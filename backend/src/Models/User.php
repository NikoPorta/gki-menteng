<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class User
{
    private Database $db;
    
    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->createTable();
    }
    
    private function createTable(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        )";
        
        $this->db->query($sql);
    }
    
    public function create(array $data): int
    {
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        return $this->db->insert('users', $data);
    }
    
    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $result = $this->db->fetch($sql, [':email' => $email]);
        return $result ?: null;
    }
    
    public function findById(int $id): ?array
    {
        $sql = "SELECT id, name, email, created_at FROM users WHERE id = :id LIMIT 1";
        $result = $this->db->fetch($sql, [':id' => $id]);
        return $result ?: null;
    }
    
    public function update(int $id, array $data): int
    {
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        
        return $this->db->update('users', $data, 'id = :id', [':id' => $id]);
    }
    
    public function delete(int $id): int
    {
        return $this->db->delete('users', 'id = :id', [':id' => $id]);
    }
    
    public function getAll(int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT id, name, email, created_at FROM users LIMIT :limit OFFSET :offset";
        return $this->db->fetchAll($sql, [':limit' => $limit, ':offset' => $offset]);
    }
    
    public function verifyPassword(string $plainPassword, string $hashedPassword): bool
    {
        return password_verify($plainPassword, $hashedPassword);
    }
}