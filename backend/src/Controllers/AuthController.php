<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController
{
    private User $userModel;
    private string $jwtSecret;
    private int $jwtExpiry;
    
    public function __construct()
    {
        $this->userModel = new User();
        $this->jwtSecret = $_ENV['JWT_SECRET'];
        $this->jwtExpiry = (int)($_ENV['JWT_EXPIRY'] ?? 3600);
    }
    
    public function register(Request $request, Response $response): string
    {
        $body = $request->getBody();
        
        // Validation
        if (empty($body['name']) || empty($body['email']) || empty($body['password'])) {
            return $response->error('Name, email and password are required', 400);
        }
        
        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            return $response->error('Invalid email format', 400);
        }
        
        if (strlen($body['password']) < 6) {
            return $response->error('Password must be at least 6 characters', 400);
        }
        
        // Check if user exists
        if ($this->userModel->findByEmail($body['email'])) {
            return $response->error('User already exists', 409);
        }
        
        // Create user
        $userId = $this->userModel->create([
            'name' => $body['name'],
            'email' => $body['email'],
            'password' => $body['password']
        ]);
        
        $user = $this->userModel->findById($userId);
        
        return $response->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }
    
    public function login(Request $request, Response $response): string
    {
        $body = $request->getBody();
        
        if (empty($body['email']) || empty($body['password'])) {
            return $response->error('Email and password are required', 400);
        }
        
        $user = $this->userModel->findByEmail($body['email']);
        
        if (!$user || !$this->userModel->verifyPassword($body['password'], $user['password'])) {
            return $response->error('Invalid credentials', 401);
        }
        
        // Generate JWT
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'iat' => time(),
            'exp' => time() + $this->jwtExpiry
        ];
        
        $token = JWT::encode($payload, $this->jwtSecret, 'HS256');
        
        return $response->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email']
            ]
        ]);
    }
    
    public function profile(Request $request, Response $response): string
    {
        $user = $this->userModel->findById($request->user->user_id);
        
        if (!$user) {
            return $response->error('User not found', 404);
        }
        
        return $response->json($user);
    }
}