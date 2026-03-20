ARG PHP_VERSION=8.5.3
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
    zip \
    unzip \
    bash \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        exif gd pdo pdo_mysql mysqli pcntl zip intl opcache

# Redis (using pecl)
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Setup directories and permissions BEFORE copying code
# This ensures 'nobody' owns the environment they'll work in
RUN mkdir -p /var/lib/nginx /var/log/nginx /var/www/storage /var/www/bootstrap/cache /run \
    && chown -R nobody:nobody /var/lib/nginx /var/log/nginx /run /var/www

WORKDIR /var/www

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy only composer files first to leverage Docker cache
COPY --chown=nobody:nobody composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction

# Copy the rest of the application
COPY --chown=nobody:nobody . .

# Finish composer (generate autoloader and run scripts)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set final permissions
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copy configs
COPY .docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY .docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY .docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Use the 'nobody' user for security
USER nobody

EXPOSE 8080

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]