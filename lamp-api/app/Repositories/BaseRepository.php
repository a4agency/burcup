<?php
declare(strict_types=1);

abstract class BaseRepository
{
    public function __construct(protected PDO $pdo)
    {
    }

    protected function all(string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    protected function one(string $sql, array $params = []): ?array
    {
        $rows = $this->all($sql, $params);
        return $rows[0] ?? null;
    }
}

