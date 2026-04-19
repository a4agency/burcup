FROM php:8.3-cli

RUN docker-php-ext-install pdo_mysql

WORKDIR /var/www/html

COPY . /var/www/html

RUN set -eux; \
    mkdir -p /var/www/html/lamp-api/public/uploads; \
    ln -sfn /var/www/html/lamp-api/public/uploads /var/www/html/uploads

EXPOSE 8080

CMD ["sh", "-lc", "php -S 0.0.0.0:${PORT:-8080} -t /var/www/html /var/www/html/router.php"]
