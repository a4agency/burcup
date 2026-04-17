<?php
declare(strict_types=1);

abstract class BaseRepository
{
    public function __construct(protected PDO $pdo)
    {
    }

    protected function queryAll(string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    protected function queryOne(string $sql, array $params = []): ?array
    {
        $rows = $this->queryAll($sql, $params);
        return $rows[0] ?? null;
    }
}
