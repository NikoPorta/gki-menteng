<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\User;

class UserController
{
    private User $userModel;
    
    public function __construct()
    {
        $this->userModel = new User();
    }
    
    public function index(Request $request, Response $response): string
    {
        $limit = (int)($request->getBody()['limit'] ?? 50);
        $offset = (int)($request->getBody()['offset'] ?? 0);
        
        $users = $this->userModel->getAll($limit, $offset);
        
        return $response->json($users);
    }
    
    public function show(Request $request, Response $response, int $id): string
    {
        $user = $this->userModel->findById($id);
        
        if (!$user) {
            return $response->error('User not found', 404);
        }
        
        return $response->json($user);
    }
    
    public function update(Request $request, Response $response, int $id): string
    {
        $body = $request->getBody();
        
        // Only allow updating specific fields
        $allowedFields = ['name', 'password'];
        $updateData = array_intersect_key($body, array_flip($allowedFields));
        
        if (empty($updateData)) {
            return $response->error('No valid fields to update', 400);
        }
        
        $updated = $this->userModel->update($id, $updateData);
        
        if (!$updated) {
            return $response->error('User not found or no changes made', 404);
        }
        
        $user = $this->userModel->findById($id);
        
        return $response->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }
    
    public function delete(Request $request, Response $response, int $id): string
    {
        $deleted = $this->userModel->delete($id);
        
        if (!$deleted) {
            return $response->error('User not found', 404);
        }
        
        return $response->json(['message' => 'User deleted successfully']);
    }
}