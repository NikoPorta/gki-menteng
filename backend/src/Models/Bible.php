<?php

namespace App\Models;

use App\Core\Database;

class Bible
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->createTable();
    }

    private function createTable(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS bible_verses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            translation VARCHAR(50) NOT NULL DEFAULT 'TB',
            testament ENUM('Old Testament', 'New Testament') NOT NULL,
            book_name VARCHAR(100) NOT NULL,
            chapter_number INT NOT NULL,
            verse_number INT NOT NULL,
            verse_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_bible_reference (translation, book_name, chapter_number, verse_number),
            INDEX idx_bible_lookup (translation, book_name, chapter_number, verse_number),
            INDEX idx_bible_testament (testament)
        )";

        $this->db->query($sql);
    }

    public function getAll(array $filters = []): array
    {
        $conditions = [];
        $params = [];

        if (!empty($filters['translation'])) {
            $conditions[] = 'translation LIKE :translation';
            $params[':translation'] = '%' . $filters['translation'] . '%';
        }

        if (!empty($filters['testament'])) {
            $conditions[] = 'testament = :testament';
            $params[':testament'] = $filters['testament'];
        }

        if (!empty($filters['book'])) {
            $conditions[] = 'book_name LIKE :book_name';
            $params[':book_name'] = '%' . $filters['book'] . '%';
        }

        if (!empty($filters['chapter'])) {
            $conditions[] = 'chapter_number = :chapter_number';
            $params[':chapter_number'] = (int) $filters['chapter'];
        }

        if (!empty($filters['search'])) {
            $conditions[] = 'verse_text LIKE :search';
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);

        $sql = "SELECT
            id,
            translation,
            testament,
            book_name AS book,
            chapter_number AS chapter,
            verse_number AS verse,
            verse_text AS text,
            CONCAT(book_name, ' ', chapter_number, ':', verse_number) AS reference,
            created_at,
            updated_at
        FROM bible_verses
        {$where}
        ORDER BY translation ASC, testament ASC, book_name ASC, chapter_number ASC, verse_number ASC, id ASC";

        return $this->db->fetchAll($sql, $params);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT
            id,
            translation,
            testament,
            book_name AS book,
            chapter_number AS chapter,
            verse_number AS verse,
            verse_text AS text,
            CONCAT(book_name, ' ', chapter_number, ':', verse_number) AS reference,
            created_at,
            updated_at
        FROM bible_verses
        WHERE id = :id
        LIMIT 1";

        $result = $this->db->fetch($sql, [':id' => $id]);
        return $result ?: null;
    }

    public function create(array $data): int
    {
        return $this->db->insert('bible_verses', $data);
    }

    public function update(int $id, array $data): int
    {
        return $this->db->update('bible_verses', $data, 'id = :id', [':id' => $id]);
    }

    public function delete(int $id): int
    {
        return $this->db->delete('bible_verses', 'id = :id', [':id' => $id]);
    }
}
