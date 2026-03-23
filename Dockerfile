# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Production PHP Image ---
ARG PHP_VERSION=8.4
FROM php:${PHP_VERSION}-fpm-alpine

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
    netcat-openbsd

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure intl \
    && docker-php-ext-install \
        exif \
        gd \
        pdo \
        pdo_pgsql \
        pcntl \
        zip \
        intl \
        opcache

# Redis (using pecl)
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Setup directories and permissions
RUN mkdir -p /var/lib/nginx /var/log/nginx /var/www/storage /var/www/bootstrap/cache /run \
    && chown -R nobody:nobody /var/lib/nginx /var/log/nginx /run /var/www

WORKDIR /var/www

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application code first
COPY --chown=nobody:nobody . .

# Copy compiled assets from the first stage
COPY --from=frontend-builder --chown=nobody:nobody /app/public/build ./public/build

# Run Composer once (Optimized)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Set final permissions
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copy configs
COPY .docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini
COPY .docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY .docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY .docker/nginx/app.conf /etc/nginx/http.d/default.conf
COPY .docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Finalize ownership of config files
USER root
RUN chown -R nobody:nobody /etc/nginx /usr/local/etc/php-fpm.d /etc/supervisor /usr/local/etc/php/conf.d

# Use the 'nobody' user for runtime security
USER nobody

EXPOSE 8080

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]