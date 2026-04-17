<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\Middleware;

class CorsMiddleware implements Middleware
{
    public function handle(Request $request, Response $response, callable $next): string
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');

        if ($request->getMethod() === 'OPTIONS') {
            header('HTTP/1.1 204 No Content');
            return '';
        }

        return $next($request, $response);
    }
}