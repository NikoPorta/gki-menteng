<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Bible;

class BibleController
{
    private Bible $bibleModel;

    public function __construct()
    {
        $this->bibleModel = new Bible();
    }

    public function index(Request $request, Response $response): string
    {
        $filters = $request->getBody();

        return $response->json($this->bibleModel->getAll([
            'translation' => isset($filters['translation']) ? trim((string) $filters['translation']) : '',
            'testament' => isset($filters['testament']) ? trim((string) $filters['testament']) : '',
            'book' => isset($filters['book']) ? trim((string) $filters['book']) : '',
            'chapter' => $filters['chapter'] ?? '',
            'search' => isset($filters['search']) ? trim((string) $filters['search']) : ''
        ]));
    }

    public function show(Request $request, Response $response, int $id): string
    {
        $verse = $this->bibleModel->findById($id);

        if (!$verse) {
            return $response->error('Bible verse not found', 404);
        }

        return $response->json($verse);
    }

    public function store(Request $request, Response $response): string
    {
        $body = $request->getBody();
        $validationError = $this->validateBiblePayload($body, false);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        try {
            $verseId = $this->bibleModel->create($this->mapBiblePayload($body));
        } catch (\Throwable $throwable) {
            return $response->error($this->mapPersistenceError($throwable), 400);
        }

        return $response->json([
            'message' => 'Bible verse created successfully',
            'verse' => $this->bibleModel->findById($verseId)
        ], 201);
    }

    public function update(Request $request, Response $response, int $id): string
    {
        $existingVerse = $this->bibleModel->findById($id);

        if (!$existingVerse) {
            return $response->error('Bible verse not found', 404);
        }

        $body = $request->getBody();
        $validationError = $this->validateBiblePayload($body, true);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        $updateData = $this->mapBiblePayload($body, true);

        if (empty($updateData)) {
            return $response->error('No valid fields to update', 400);
        }

        try {
            $this->bibleModel->update($id, $updateData);
        } catch (\Throwable $throwable) {
            return $response->error($this->mapPersistenceError($throwable), 400);
        }

        return $response->json([
            'message' => 'Bible verse updated successfully',
            'verse' => $this->bibleModel->findById($id)
        ]);
    }

    public function delete(Request $request, Response $response, int $id): string
    {
        $deleted = $this->bibleModel->delete($id);

        if (!$deleted) {
            return $response->error('Bible verse not found', 404);
        }

        return $response->json(['message' => 'Bible verse deleted successfully']);
    }

    private function validateBiblePayload(array $payload, bool $isPartial): ?string
    {
        $requiredFields = ['translation', 'testament', 'book', 'chapter', 'verse', 'text'];

        if (!$isPartial) {
            foreach ($requiredFields as $field) {
                if (!isset($payload[$field]) || trim((string) $payload[$field]) === '') {
                    return ucfirst($field) . ' is required';
                }
            }
        }

        if (isset($payload['testament']) && !in_array($payload['testament'], ['Old Testament', 'New Testament'], true)) {
            return 'Testament must be Old Testament or New Testament';
        }

        if (isset($payload['chapter']) && (!is_numeric($payload['chapter']) || (int) $payload['chapter'] < 1)) {
            return 'Chapter must be a number greater than 0';
        }

        if (isset($payload['verse']) && (!is_numeric($payload['verse']) || (int) $payload['verse'] < 1)) {
            return 'Verse must be a number greater than 0';
        }

        return null;
    }

    private function mapBiblePayload(array $payload, bool $isPartial = false): array
    {
        $fieldMap = [
            'translation' => 'translation',
            'testament' => 'testament',
            'book' => 'book_name',
            'chapter' => 'chapter_number',
            'verse' => 'verse_number',
            'text' => 'verse_text'
        ];

        $mapped = [];

        foreach ($fieldMap as $inputField => $databaseField) {
            if (!array_key_exists($inputField, $payload)) {
                continue;
            }

            $value = $payload[$inputField];

            if (is_string($value)) {
                $value = trim($value);
            }

            if (in_array($inputField, ['chapter', 'verse'], true) && $value !== '') {
                $value = (int) $value;
            }

            $mapped[$databaseField] = $value;
        }

        return $mapped;
    }

    private function mapPersistenceError(\Throwable $throwable): string
    {
        $message = $throwable->getMessage();

        if (stripos($message, 'uniq_bible_reference') !== false || stripos($message, 'duplicate') !== false) {
            return 'That translation and verse reference already exists.';
        }

        return 'Unable to save bible verse.';
    }
}
