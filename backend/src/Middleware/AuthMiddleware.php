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
        // In development environment, allow unrestricted access with a default user
        if (($_ENV['APP_ENV'] ?? 'production') !== 'production') {
            $token = $request->getBearerToken();

            if ($token) {
                try {
                    $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
                    $request->user = $decoded;
                    $this->logger->info('User authenticated (dev)', ['user_id' => $decoded->sub ?? 'unknown']);
                } catch (\Exception $e) {
                    // Invalid token in dev: use default user anyway
                    $request->user = (object)[
                        'user_id' => 1,
                        'email' => 'dev@example.com',
                        'name' => 'Development User'
                    ];
                }
            } else {
                // No token provided: use default development user
                $request->user = (object)[
                    'user_id' => 1,
                    'email' => 'dev@example.com',
                    'name' => 'Development User'
                ];
            }

            return $next($request, $response);
        }

        // Production: strict authentication required
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