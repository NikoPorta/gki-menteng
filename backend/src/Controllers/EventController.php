<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Event;

class EventController
{
    private Event $eventModel;

    public function __construct()
    {
        $this->eventModel = new Event();
    }

    public function index(Request $request, Response $response): string
    {
        return $response->json($this->eventModel->getAll());
    }

    public function show(Request $request, Response $response, int $id): string
    {
        $event = $this->eventModel->findById($id);

        if (!$event) {
            return $response->error('Event not found', 404);
        }

        return $response->json($event);
    }

    public function store(Request $request, Response $response): string
    {
        $body = $request->getBody();
        $validationError = $this->validateEventPayload($body, false);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        $eventId = $this->eventModel->create($this->mapEventPayload($body));
        $event = $this->eventModel->findById($eventId);

        return $response->json([
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }

    public function update(Request $request, Response $response, int $id): string
    {
        $existingEvent = $this->eventModel->findById($id);

        if (!$existingEvent) {
            return $response->error('Event not found', 404);
        }

        $body = $request->getBody();
        $validationError = $this->validateEventPayload($body, true);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        $updateData = $this->mapEventPayload($body, true);

        if (empty($updateData)) {
            return $response->error('No valid fields to update', 400);
        }

        $this->eventModel->update($id, $updateData);

        return $response->json([
            'message' => 'Event updated successfully',
            'event' => $this->eventModel->findById($id)
        ]);
    }

    public function delete(Request $request, Response $response, int $id): string
    {
        $deleted = $this->eventModel->delete($id);

        if (!$deleted) {
            return $response->error('Event not found', 404);
        }

        return $response->json(['message' => 'Event deleted successfully']);
    }

    private function validateEventPayload(array $payload, bool $isPartial): ?string
    {
        $requiredFields = ['title', 'date', 'time', 'location', 'description', 'volunteers'];

        if (!$isPartial) {
            foreach ($requiredFields as $field) {
                if (!isset($payload[$field]) || trim((string)$payload[$field]) === '') {
                    return ucfirst($field) . ' is required';
                }
            }
        }

        if (isset($payload['date']) && !$this->isValidDate($payload['date'])) {
            return 'Date must use YYYY-MM-DD format';
        }

        return null;
    }

    private function mapEventPayload(array $payload, bool $isPartial = false): array
    {
        $fieldMap = [
            'title' => 'title',
            'date' => 'event_date',
            'time' => 'event_time',
            'location' => 'location',
            'description' => 'description',
            'volunteers' => 'volunteers'
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

            $mapped[$databaseField] = $value;
        }

        return $mapped;
    }

    private function isValidDate(string $date): bool
    {
        $parts = explode('-', $date);

        if (count($parts) !== 3) {
            return false;
        }

        [$year, $month, $day] = array_map('intval', $parts);

        return checkdate($month, $day, $year);
    }
}
