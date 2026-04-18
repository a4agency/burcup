<?php
declare(strict_types=1);

final class Database
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $dsn = self::getDatabaseUrl();
        if ($dsn !== '') {
            $parts = parse_url($dsn);
            if (!$parts || !isset($parts['host'], $parts['user'], $parts['pass'], $parts['path'])) {
                throw new RuntimeException('Invalid DATABASE_URL');
            }
            $host = $parts['host'];
            $port = isset($parts['port']) ? (int) $parts['port'] : 3306;
            $dbName = ltrim($parts['path'], '/');
            $user = rawurldecode($parts['user']);
            $password = rawurldecode($parts['pass']);
        } else {
            $host = get_env('DB_HOST');
            $port = (int) get_env('DB_PORT', '3306');
            $dbName = get_env('DB_NAME');
            $user = get_env('DB_USER');
            $password = get_env('DB_PASSWORD');
            if ($host === '' || $dbName === '' || $user === '') {
                throw new RuntimeException('MySQL credentials are required');
            }
        }

        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $dbName);
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => (int) get_env('MYSQL_CONNECT_TIMEOUT', '5'),
        ]);

        self::$pdo = $pdo;
        return self::$pdo;
    }

    private static function getDatabaseUrl(): string
    {
        foreach ([
            'MYSQL_URL',
            'MYSQL_PUBLIC_URL',
            'DATABASE_URL',
            'DATABASE_PUBLIC_URL',
            'DB_URL',
        ] as $key) {
            $value = get_env($key);
            if ($value !== '') {
                return $value;
            }
        }

        $host = get_env('MYSQLHOST', get_env('MYSQL_HOST', get_env('DB_HOST')));
        $port = get_env('MYSQLPORT', get_env('MYSQL_PORT', get_env('DB_PORT', '3306')));
        $dbName = get_env('MYSQLDATABASE', get_env('MYSQL_DATABASE', get_env('DB_NAME')));
        $user = get_env('MYSQLUSER', get_env('MYSQL_USER', get_env('DB_USER')));
        $password = get_env('MYSQLPASSWORD', get_env('MYSQL_PASSWORD', get_env('DB_PASSWORD')));
        if ($host !== '' && $dbName !== '' && $user !== '') {
            $encodedUser = rawurlencode($user);
            $encodedPassword = rawurlencode($password);
            return sprintf('mysql://%s:%s@%s:%s/%s', $encodedUser, $encodedPassword, $host, $port ?: '3306', $dbName);
        }

        return '';
    }
}
