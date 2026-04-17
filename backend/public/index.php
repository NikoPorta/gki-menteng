<?php

require_once __DIR__ . '/../vendor/autoload.php';

// CORS headers - handle preflight immediately
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 204 No Content');
    exit;
}

use Dotenv\Dotenv;
use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Core\Logger;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Middleware\CorsMiddleware;
use App\Controllers\AuthController;
use App\Controllers\EventController;
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
$router->addGlobalMiddleware(new CorsMiddleware());
$router->addGlobalMiddleware(new RateLimitMiddleware());

// Public routes (no auth required)
$router->post('/api/auth/register', [AuthController::class, 'register'], []);
$router->post('/api/auth/login', [AuthController::class, 'login'], []);
$router->get('/api/events', [EventController::class, 'index'], []);
$router->get('/api/events/{id}', [EventController::class, 'show'], []);

// Protected routes (auth required)
$router->get('/api/auth/profile', [AuthController::class, 'profile'], [new AuthMiddleware()]);
$router->post('/api/events', [EventController::class, 'store'], [new AuthMiddleware()]);
$router->put('/api/events/{id}', [EventController::class, 'update'], [new AuthMiddleware()]);
$router->delete('/api/events/{id}', [EventController::class, 'delete'], [new AuthMiddleware()]);
$router->get('/api/users', [UserController::class, 'index'], [new AuthMiddleware()]);
$router->get('/api/users/{id}', [UserController::class, 'show'], [new AuthMiddleware()]);
$router->put('/api/users/{id}', [UserController::class, 'update'], [new AuthMiddleware()]);
$router->delete('/api/users/{id}', [UserController::class, 'delete'], [new AuthMiddleware()]);

// Dispatch the request
$router->dispatch();
