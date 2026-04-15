<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

interface Middleware
{
    public function handle(Request $request, Response $response, callable $next);
}