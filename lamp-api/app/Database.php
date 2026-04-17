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

        $dsn = get_env('DATABASE_URL');
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
        ]);

        self::$pdo = $pdo;
        return self::$pdo;
    }
}

