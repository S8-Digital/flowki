ARG PHP_VERSION=8.4

# ── Stage 0: PHP base ─────────────────────────────────────────────────────────
# Defines PHP extensions once; both the builder and production stages inherit
# from here so the final image never needs to re-install them.
FROM php:${PHP_VERSION}-fpm-alpine AS php-base

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    libpq-dev \
    postgresql-dev \
    zip \
    unzip \
    bash \
    icu-dev \
    icu-data-full \
    netcat-openbsd \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure intl \
    && docker-php-ext-install \
        bcmath \
        exif \
        gd \
        mbstring \
        pdo \
        pdo_pgsql \
        pcntl \
        zip \
        intl \
        opcache

    # Redis (using pecl)
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis mailparse \
    && docker-php-ext-enable redis mailparse \
    && apk del .build-deps

# ── Stage 1: Builder (PHP + Node + Composer) ──────────────────────────────────
# Inherits PHP from php-base, then adds Node.js and Composer so that
# `npm run build` can invoke `php artisan wayfinder:generate` via the Vite plugin.
FROM php-base AS builder

WORKDIR /app

# Add Node.js / npm for Vite
RUN apk add --no-cache nodejs npm

# Install Composer (pinned for reproducible builds)
COPY --from=composer:2.8.5 /usr/bin/composer /usr/bin/composer

# Install PHP dependencies — no-dev: only production packages are needed to run
# artisan and generate wayfinder types; the same vendor dir is shipped to prod.
# Split into two steps: install with the lockfile first (good layer cache),
# then regenerate the classmap after the full app code is present.
COPY composer*.json ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --no-progress

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Regenerate the optimized autoloader with the full application codebase present
# so classmap entries for all app classes are included
RUN composer dump-autoload --optimize

# Create a minimal, ephemeral .env so Laravel can boot for `php artisan wayfinder:generate`
# (invoked by the Vite plugin during `npm run build`).
# The APP_KEY is randomly generated at build time and is only used to satisfy
# Laravel's boot requirements — it is never written into the final image.
# SQLite in-memory + array session/cache/queue prevent any live DB / Redis / cache
# connections during the build. DB_CONNECTION=array is not a valid Laravel database
# driver; use sqlite with DB_DATABASE=:memory: instead.
RUN KEY=$(php -r "echo base64_encode(random_bytes(32));") \
    && printf "APP_KEY=base64:%s\nDB_CONNECTION=sqlite\nDB_DATABASE=:memory:\nSESSION_DRIVER=array\nCACHE_STORE=array\nQUEUE_CONNECTION=sync\nBROADCAST_CONNECTION=log\n" "$KEY" > .env \
    && npm run build \
    && rm -f .env

# ── Stage 2: Production ───────────────────────────────────────────────────────
# Starts clean from php-base (no Node, no Composer, no build tooling).
FROM php-base

# Setup directories and permissions
RUN mkdir -p /var/lib/nginx /var/log/nginx /var/www/storage /var/www/bootstrap/cache /run \
    && chown -R nobody:nobody /var/lib/nginx /var/log/nginx /run /var/www

WORKDIR /var/www

# Copy application code
COPY --chown=nobody:nobody . .

# Copy compiled frontend assets and PHP vendor from the builder stage
COPY --from=builder --chown=nobody:nobody /app/public/build ./public/build
COPY --from=builder --chown=nobody:nobody /app/vendor ./vendor

# Set final permissions
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copy configs
COPY .docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini
COPY .docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY .docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY .docker/nginx/app.conf /etc/nginx/conf.d/default.conf
COPY .docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Finalize ownership of config files
USER root
RUN chown -R nobody:nobody /etc/nginx /usr/local/etc/php-fpm.d /etc/supervisor /usr/local/etc/php/conf.d

# Use the 'nobody' user for runtime security
USER nobody

EXPOSE 8080

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]