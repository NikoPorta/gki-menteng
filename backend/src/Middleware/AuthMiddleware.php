<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Logger;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware implements Middleware
{
    private string $secret;
    private Logger $logger;

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'];
        $this->logger = new Logger();
    }

    public function handle(Request $request, Response $response, callable $next)
    {
        $token = $request->getBearerToken();
        
        if (!$token) {
            $this->logger->warning('Unauthorized access attempt: No token provided');
            return $response->error('Unauthorized: No token provided', 401);
        }
        
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            $request->user = $decoded;
            $this->logger->info('User authenticated', ['user_id' => $decoded->sub ?? 'unknown']);
            return $next($request, $response);
        } catch (\Exception $e) {
            $this->logger->warning('Unauthorized access attempt: Invalid token');
            return $response->error('Unauthorized: Invalid token', 401);
        }
    }
}