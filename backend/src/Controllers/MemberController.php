<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Member;

class MemberController
{
    private Member $memberModel;

    public function __construct()
    {
        $this->memberModel = new Member();
    }

    public function index(Request $request, Response $response): string
    {
        return $response->json($this->memberModel->getAll());
    }

    public function show(Request $request, Response $response, int $id): string
    {
        $member = $this->memberModel->findById($id);

        if (!$member) {
            return $response->error('Member not found', 404);
        }

        return $response->json($member);
    }

    public function store(Request $request, Response $response): string
    {
        $body = $request->getBody();
        $validationError = $this->validateMemberPayload($body, false);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        $memberId = $this->memberModel->create($this->mapMemberPayload($body));
        $member = $this->memberModel->findById($memberId);

        return $response->json([
            'message' => 'Member created successfully',
            'member' => $member
        ], 201);
    }

    public function update(Request $request, Response $response, int $id): string
    {
        $existingMember = $this->memberModel->findById($id);

        if (!$existingMember) {
            return $response->error('Member not found', 404);
        }

        $body = $request->getBody();
        $validationError = $this->validateMemberPayload($body, true);

        if ($validationError) {
            return $response->error($validationError, 400);
        }

        $updateData = $this->mapMemberPayload($body, true);

        if (empty($updateData)) {
            return $response->error('No valid fields to update', 400);
        }

        $this->memberModel->update($id, $updateData);

        return $response->json([
            'message' => 'Member updated successfully',
            'member' => $this->memberModel->findById($id)
        ]);
    }

    public function delete(Request $request, Response $response, int $id): string
    {
        $deleted = $this->memberModel->delete($id);

        if (!$deleted) {
            return $response->error('Member not found', 404);
        }

        return $response->json(['message' => 'Member deleted successfully']);
    }

    private function validateMemberPayload(array $payload, bool $isPartial): ?string
    {
        if (!$isPartial) {
            $required = ['name', 'email', 'phone', 'joinDate', 'status', 'role'];
            foreach ($required as $field) {
                if (!isset($payload[$field]) || trim((string)$payload[$field]) === '') {
                    return ucfirst($field) . ' is required';
                }
            }
        }

        if (isset($payload['email']) && !filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
            return 'Invalid email format';
        }

        if (isset($payload['status']) && !in_array($payload['status'], ['active', 'inactive'], true)) {
            return 'Status must be active or inactive';
        }

        return null;
    }

    private function mapMemberPayload(array $payload, bool $isPartial = false): array
    {
        $mapped = [];

        if (array_key_exists('name', $payload)) {
            $mapped['name'] = trim((string)$payload['name']);
        }

        if (array_key_exists('email', $payload)) {
            $mapped['email'] = trim((string)$payload['email']);
        }

        if (array_key_exists('phone', $payload)) {
            $mapped['phone'] = trim((string)$payload['phone']);
        }

        if (array_key_exists('joinDate', $payload)) {
            $mapped['join_date'] = $payload['joinDate'];
        }

        if (array_key_exists('status', $payload)) {
            $mapped['status'] = $payload['status'];
        }

        if (array_key_exists('role', $payload)) {
            $mapped['role'] = trim((string)$payload['role']);
        }

        return $mapped;
    }
}
