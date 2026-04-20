<?php

namespace App\Models;

use App\Core\Database;

class Volunteer
{
    public const SERVICES = [
        'Musician',
        'Soundman',
        'Multimedia',
        'Streaming',
        'Worship Committee'
    ];

    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->createTable();
        $this->seedDefaults();
    }

    private function createTable(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS volunteers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            services JSON NOT NULL,
            skills TEXT NULL,
            contact VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name)
        )";

        $this->db->query($sql);
    }

    private function seedDefaults(): void
    {
        $result = $this->db->fetch('SELECT COUNT(*) AS total FROM volunteers');
        $count = (int)($result['total'] ?? 0);

        if ($count > 0) {
            return;
        }

        $defaults = [
            [
                'name' => 'Abednego',
                'services' => json_encode(['Musician']),
                'skills' => json_encode(['Piano', 'Sound System', 'Streaming', 'Multimedia']),
                'contact' => '+62839482'
            ],
            [
                'name' => 'Ruth Natalia',
                'services' => json_encode(['Streaming', 'Multimedia']),
                'skills' => json_encode(['OBS Operation', 'Camera Direction', 'YouTube Live']),
                'contact' => '+628112223344'
            ],
            [
                'name' => 'Jonathan',
                'services' => json_encode(['Worship Committee']),
                'skills' => json_encode([]),
                'contact' => '+628778889900'
            ],
            [
                'name' => 'Debora',
                'services' => json_encode(['Multimedia']),
                'skills' => json_encode(['Song Lyrics', 'Presentation Slides', 'Visual Cueing']),
                'contact' => '+628223344556'
            ],
            [
                'name' => 'Samuel',
                'services' => json_encode(['Soundman', 'Musician']),
                'skills' => json_encode(['Mixer Setup', 'Microphone Balancing', 'Stage Monitoring']),
                'contact' => '+628556677889'
            ]
        ];

        foreach ($defaults as $volunteer) {
            $this->db->insert('volunteers', $volunteer);
        }
    }

    public function create(array $data): int
    {
        return $this->db->insert('volunteers', $data);
    }

    public function getAll(): array
    {
        $sql = "SELECT
            id,
            name,
            services,
            skills,
            contact,
            created_at,
            updated_at
        FROM volunteers
        ORDER BY name ASC, id ASC";

        $rows = $this->db->fetchAll($sql);

        return array_map([$this, 'mapVolunteer'], $rows);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT
            id,
            name,
            services,
            skills,
            contact,
            created_at,
            updated_at
        FROM volunteers
        WHERE id = :id
        LIMIT 1";

        $result = $this->db->fetch($sql, [':id' => $id]);

        return $result ? $this->mapVolunteer($result) : null;
    }

    public function update(int $id, array $data): int
    {
        return $this->db->update('volunteers', $data, 'id = :id', [':id' => $id]);
    }

    public function delete(int $id): int
    {
        return $this->db->delete('volunteers', 'id = :id', [':id' => $id]);
    }

    private function mapVolunteer(array $volunteer): array
    {
        return [
            'id' => (int)$volunteer['id'],
            'name' => $volunteer['name'] ?? '',
            'services' => $this->decodeServices($volunteer['services'] ?? null),
            'skills' => $this->decodeSkills($volunteer['skills'] ?? null),
            'contact' => $volunteer['contact'] ?? '',
            'created_at' => $volunteer['created_at'] ?? null,
            'updated_at' => $volunteer['updated_at'] ?? null
        ];
    }

    private function decodeServices(?string $services): array
    {
        if ($services === null || trim($services) === '') {
            return ['Musician'];
        }

        $decoded = json_decode($services, true);

        if (!is_array($decoded) || empty($decoded)) {
            return ['Musician'];
        }

        return array_values(array_filter(array_map(static function ($service) {
            return is_string($service) ? trim($service) : null;
        }, $decoded)));
    }

    private function decodeSkills(?string $skills): array
    {
        if ($skills === null || trim($skills) === '') {
            return [];
        }

        $decoded = json_decode($skills, true);

        if (!is_array($decoded)) {
            return [];
        }

        return array_values(array_filter(array_map(static function ($skill) {
            return is_string($skill) ? trim($skill) : null;
        }, $decoded)));
    }
}
