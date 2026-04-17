<?php

namespace App\Models;

use App\Core\Database;

class Event
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->createTable();
    }

    private function createTable(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            event_date DATE NOT NULL,
            event_time VARCHAR(50) NOT NULL,
            location VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            volunteers VARCHAR(50) NOT NULL DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_event_date (event_date)
        )";

        $this->db->query($sql);

        $this->migrateAttendeesToVolunteers();
    }

    private function migrateAttendeesToVolunteers(): void
    {
        $checkSql = "SHOW COLUMNS FROM events LIKE 'attendees'";
        $result = $this->db->fetch($checkSql);

        if ($result) {
            $alterSql = "ALTER TABLE events CHANGE COLUMN attendees volunteers VARCHAR(50) NOT NULL DEFAULT ''";
            $this->db->query($alterSql);
        }
    }

    public function create(array $data): int
    {
        return $this->db->insert('events', $data);
    }

    public function getAll(): array
    {
        $sql = "SELECT
            id,
            title,
            event_date AS date,
            event_time AS time,
            location,
            description,
            volunteers,
            created_at,
            updated_at
        FROM events
        ORDER BY event_date ASC, event_time ASC, id ASC";

        return $this->db->fetchAll($sql);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT
            id,
            title,
            event_date AS date,
            event_time AS time,
            location,
            description,
            volunteers,
            created_at,
            updated_at
        FROM events
        WHERE id = :id
        LIMIT 1";

        $result = $this->db->fetch($sql, [':id' => $id]);
        return $result ?: null;
    }

    public function update(int $id, array $data): int
    {
        return $this->db->update('events', $data, 'id = :id', [':id' => $id]);
    }

    public function delete(int $id): int
    {
        return $this->db->delete('events', 'id = :id', [':id' => $id]);
    }
}
