<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Core\Logger;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Controllers\AuthController;
use App\Controllers\UserController;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$logger = new Logger();

set_exception_handler(function ($throwable) use ($logger) {
    $logger->error('Uncaught exception', [
        'message' => $throwable->getMessage(),
        'file' => $throwable->getFile(),
        'line' => $throwable->getLine()
    ]);
    http_response_code(500);
    echo json_encode(['status' => 500, 'error' => 'Internal server error']);
});

set_error_handler(function ($severity, $message, $file, $line) use ($logger) {
    $logger->error('PHP Error', [
        'message' => $message,
        'file' => $file,
        'line' => $line,
        'severity' => $severity
    ]);
});

$request = new Request();
$response = new Response();
$router = new Router($request, $response);

// Add global middleware
$router->addGlobalMiddleware(new RateLimitMiddleware());

// Public routes (no auth required)
$router->post('/api/auth/register', [AuthController::class, 'register'], []);
$router->post('/api/auth/login', [AuthController::class, 'login'], []);

// Protected routes (auth required)
$router->get('/api/auth/profile', [AuthController::class, 'profile'], [new AuthMiddleware()]);
$router->get('/api/users', [UserController::class, 'index'], [new AuthMiddleware()]);
$router->get('/api/users/{id}', [UserController::class, 'show'], [new AuthMiddleware()]);
$router->put('/api/users/{id}', [UserController::class, 'update'], [new AuthMiddleware()]);
$router->delete('/api/users/{id}', [UserController::class, 'delete'], [new AuthMiddleware()]);

// Dispatch the request
$router->dispatch();