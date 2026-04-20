<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Volunteer;

class VolunteerController
{
    private Volunteer $volunteerModel;

    public function __construct()
    {
        $this->volunteerModel = new Volunteer();
    }

    public function index(Request $request, Response $response): string
    {
        return $response->json($this->volunteerModel->getAll());
    }

    public function show(Request $request, Response $response, int $id): string
    {
        $volunteer = $this->volunteerModel->findById($id);

        if (!$volunteer) {
            return $response->error('Volunteer not found', 404);
        }

        return $response->json($volunteer);
    }

    public function store(Request $request, Response $response): string
    {
        $body = $request->getBody();
        $validationError = $this->validateVolunteerPayload($body, false);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        $volunteerId = $this->volunteerModel->create($this->mapVolunteerPayload($body));
        $volunteer = $this->volunteerModel->findById($volunteerId);

        return $response->json([
            'message' => 'Volunteer created successfully',
            'volunteer' => $volunteer
        ], 201);
    }

    public function update(Request $request, Response $response, int $id): string
    {
        $existingVolunteer = $this->volunteerModel->findById($id);

        if (!$existingVolunteer) {
            return $response->error('Volunteer not found', 404);
        }

        $body = $request->getBody();
        $validationError = $this->validateVolunteerPayload($body, true);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        $updateData = $this->mapVolunteerPayload($body, true);

        if (empty($updateData)) {
            return $response->error('No valid fields to update', 400);
        }

        $this->volunteerModel->update($id, $updateData);

        return $response->json([
            'message' => 'Volunteer updated successfully',
            'volunteer' => $this->volunteerModel->findById($id)
        ]);
    }

    public function delete(Request $request, Response $response, int $id): string
    {
        $deleted = $this->volunteerModel->delete($id);

        if (!$deleted) {
            return $response->error('Volunteer not found', 404);
        }

        return $response->json(['message' => 'Volunteer deleted successfully']);
    }

    private function validateVolunteerPayload(array $payload, bool $isPartial): ?string
    {
        $requiredFields = ['name', 'contact'];

        if (!$isPartial) {
            foreach ($requiredFields as $field) {
                if (!isset($payload[$field]) || trim((string)$payload[$field]) === '') {
                    return ucfirst($field) . ' is required';
                }
            }
        }

        if (isset($payload['services'])) {
            if (!is_array($payload['services'])) {
                return 'Services must be an array';
            }
            foreach ($payload['services'] as $service) {
                if (!in_array($service, Volunteer::SERVICES, true)) {
                    return 'Service must be one of: ' . implode(', ', Volunteer::SERVICES);
                }
            }
        }

        if (array_key_exists('skills', $payload) && !is_array($payload['skills'])) {
            return 'Skills must be an array';
        }

        $hasWorshipCommittee = isset($payload['services']) && in_array('Worship Committee', $payload['services'], true);
        if ($hasWorshipCommittee && array_key_exists('skills', $payload) && !empty($payload['skills'])) {
            return 'Worship Committee does not use skills';
        }

        return null;
    }

    private function mapVolunteerPayload(array $payload, bool $isPartial = false): array
    {
        $mapped = [];

        if (array_key_exists('name', $payload)) {
            $mapped['name'] = trim((string)$payload['name']);
        }

        if (array_key_exists('services', $payload)) {
            $mapped['services'] = $this->encodeServices($payload['services']);
        } elseif (!$isPartial) {
            $mapped['services'] = json_encode(['Musician']);
        }

        if (array_key_exists('contact', $payload)) {
            $mapped['contact'] = trim((string)$payload['contact']);
        }

        if (array_key_exists('skills', $payload)) {
            $mapped['skills'] = $this->encodeSkills($payload['services'] ?? null, $payload['skills']);
        } elseif (!$isPartial) {
            $mapped['skills'] = $this->encodeSkills($payload['services'] ?? ['Musician'], []);
        }

        $hasWorshipCommittee = isset($payload['services']) && in_array('Worship Committee', $payload['services'], true);
        if ($hasWorshipCommittee) {
            $mapped['skills'] = json_encode([]);
        }

        return $mapped;
    }

    private function encodeServices(mixed $services): string
    {
        if (!is_array($services) || empty($services)) {
            return json_encode(['Musician']);
        }

        $normalized = array_values(array_filter(array_map(static function ($service) {
            return is_string($service) ? trim($service) : null;
        }, $services)));

        return json_encode(empty($normalized) ? ['Musician'] : $normalized);
    }

    private function encodeSkills(?array $services, mixed $skills): string
    {
        $hasWorshipCommittee = is_array($services) && in_array('Worship Committee', $services, true);
        if ($hasWorshipCommittee) {
            return json_encode([]);
        }

        if (!is_array($skills)) {
            return json_encode([]);
        }

        $normalized = array_values(array_filter(array_map(static function ($skill) {
            return is_string($skill) ? trim($skill) : null;
        }, $skills)));

        return json_encode($normalized);
    }
}
