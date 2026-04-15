<?php

namespace App\Core;

class Response
{
    private int $statusCode = 200;
    private array $headers = [];

    public function setStatusCode(int $code): self
    {
        $this->statusCode = $code;
        http_response_code($code);
        return $this;
    }

    public function setHeader(string $key, string $value): self
    {
        $this->headers[$key] = $value;
        header("{$key}: {$value}");
        return $this;
    }

    public function json($data, int $statusCode = 200): string
    {
        $this->setHeader('Content-Type', 'application/json');
        $this->setStatusCode($statusCode);
        
        return json_encode([
            'status' => $statusCode,
            'data' => $data
        ]);
    }

    public function error(string $message, int $statusCode = 400): string
    {
        $this->setHeader('Content-Type', 'application/json');
        $this->setStatusCode($statusCode);
        
        return json_encode([
            'status' => $statusCode,
            'error' => $message
        ]);
    }

    public function send($data): void
    {
        echo $data;
    }
}