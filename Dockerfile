FROM php:8.3-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html

RUN a2enmod rewrite headers \
    && docker-php-ext-install pdo pdo_mysql \
    && printf '%s\n' \
        '<Directory /var/www/html>' \
        '    AllowOverride All' \
        '    Require all granted' \
        '</Directory>' \
      > /etc/apache2/conf-available/burchalkin.conf \
    && a2enconf burchalkin \
    && printf '%s\n' \
        '#!/bin/sh' \
        'set -eu' \
        'PORT="${PORT:-8080}"' \
        'if grep -q "^Listen " /etc/apache2/ports.conf; then' \
        '  sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf' \
        'else' \
        '  echo "Listen ${PORT}" >> /etc/apache2/ports.conf' \
        'fi' \
        'if [ -f /etc/apache2/sites-available/000-default.conf ]; then' \
        '  sed -i "s/<VirtualHost \\*:.*>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf' \
        'fi' \
        'exec apache2-foreground' \
      > /usr/local/bin/docker-entrypoint-bcup.sh \
    && chmod +x /usr/local/bin/docker-entrypoint-bcup.sh

WORKDIR /var/www/html

COPY . /var/www/html

RUN rm -rf /var/www/html/.git \
    && rm -rf /var/www/html/node_modules \
    && rm -rf /var/www/html/archive \
    && rm -f /var/www/html/package.json /var/www/html/package-lock.json \
    && mkdir -p /var/www/html/lamp-api/public/uploads \
    && ln -sfn /var/www/html/lamp-api/public/uploads /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/lamp-api/public/uploads

EXPOSE 8080

CMD ["/usr/local/bin/docker-entrypoint-bcup.sh"]
