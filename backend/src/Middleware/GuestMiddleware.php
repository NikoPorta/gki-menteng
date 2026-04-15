<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class GuestMiddleware implements Middleware
{
    public function handle(Request $request, Response $response, callable $next)
    {
        $token = $request->getBearerToken();
        
        if ($token) {
            return $response->error('Already authenticated', 403);
        }
        
        return $next($request, $response);
    }
}