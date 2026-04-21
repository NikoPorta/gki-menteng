<?php

namespace App\Models;

use App\Core\Database;

class Member
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->createTable();
    }

    private function createTable(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            phone VARCHAR(50) NOT NULL,
            join_date DATE NOT NULL,
            status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
            role VARCHAR(100) NOT NULL DEFAULT 'Member',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name),
            INDEX idx_status (status)
        )";

        $this->db->query($sql);
    }

    public function create(array $data): int
    {
        return $this->db->insert('members', $data);
    }

    public function getAll(): array
    {
        $sql = "SELECT
            id,
            name,
            email,
            phone,
            join_date AS joinDate,
            status,
            role,
            created_at,
            updated_at
        FROM members
        ORDER BY name ASC, id ASC";

        return $this->db->fetchAll($sql);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT
            id,
            name,
            email,
            phone,
            join_date AS joinDate,
            status,
            role,
            created_at,
            updated_at
        FROM members
        WHERE id = :id
        LIMIT 1";

        $result = $this->db->fetch($sql, [':id' => $id]);
        return $result ?: null;
    }

    public function update(int $id, array $data): int
    {
        return $this->db->update('members', $data, 'id = :id', [':id' => $id]);
    }

    public function delete(int $id): int
    {
        return $this->db->delete('members', 'id = :id', [':id' => $id]);
    }
}
