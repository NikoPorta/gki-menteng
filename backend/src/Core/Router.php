<?php

namespace App\Core;

use App\Middleware\Middleware;

class Router
{
    private array $routes = [];
    private array $globalMiddleware = [];
    private Request $request;
    private Response $response;
    private Logger $logger;

    public function __construct(Request $request, Response $response)
    {
        $this->request = $request;
        $this->response = $response;
        $this->logger = new Logger();
    }

    public function addGlobalMiddleware(Middleware $middleware): void
    {
        $this->globalMiddleware[] = $middleware;
    }

    public function addRoute(string $method, string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function get(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function delete(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    public function dispatch(): void
    {
        $method = $this->request->getMethod();
        $path = $this->request->getPath();
        
        $this->logger->info('Request', ['method' => $method, 'path' => $path, 'ip' => $this->request->getIp()]);
        
        $route = $this->matchRoute($method, $path);
        
        if (!$route) {
            $this->response->error('Route not found', 404);
            return;
        }
        
        $handler = $route['handler'];
        $middlewares = array_merge($this->globalMiddleware, $route['middlewares']);
        
        // Create middleware chain
        $next = function($request, $response) use ($handler) {
            $routeParams = $request->routeParams ?? [];

            if (is_callable($handler)) {
                return $handler($request, $response, ...array_values($routeParams));
            }
            
            if (is_array($handler)) {
                $controller = new $handler[0]();
                $method = $handler[1];
                return $controller->$method($request, $response, ...array_values($routeParams));
            }
            
            return $response->error('Invalid handler', 500);
        };
        
        // Apply middlewares in reverse order
        for ($i = count($middlewares) - 1; $i >= 0; $i--) {
            $middleware = $middlewares[$i];
            $currentNext = $next;
            $next = function($request, $response) use ($middleware, $currentNext) {
                return $middleware->handle($request, $response, $currentNext);
            };
        }
        
        $result = $next($this->request, $this->response);
        
        if (is_string($result)) {
            $this->response->send($result);
        }
    }

    private function matchRoute(string $method, string $path): ?array
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            $paramNames = [];
            $pattern = $this->convertPathToRegex($route['path'], $paramNames);
            
            if (preg_match($pattern, $path, $matches)) {
                $params = [];

                foreach ($paramNames as $index => $name) {
                    $params[$name] = $matches[$index + 1] ?? null;
                }

                $this->request->routeParams = $params;
                return $route;
            }
        }
        
        return null;
    }

    private function convertPathToRegex(string $path, array &$paramNames = []): string
    {
        $pattern = preg_replace_callback('/\{([a-z]+)\}/', function ($matches) use (&$paramNames) {
            $paramNames[] = $matches[1];
            return '([^/]+)';
        }, $path);

        return '#^' . $pattern . '$#';
    }
}
