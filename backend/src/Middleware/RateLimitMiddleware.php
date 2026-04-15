<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

class RateLimitMiddleware implements Middleware
{
    private Database $db;
    private int $maxRequests;
    private int $timeWindow;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->maxRequests = (int)($_ENV['RATE_LIMIT_REQUESTS'] ?? 100);
        $this->timeWindow = (int)($_ENV['RATE_LIMIT_MINUTES'] ?? 15) * 60;
    }

    public function handle(Request $request, Response $response, callable $next)
    {
        $ip = $request->getIp();
        $path = $request->getPath();
        
        // Create rate limit table if not exists
        $this->createRateLimitTable();
        
        // Clean old entries
        $this->cleanOldEntries();
        
        // Check rate limit
        $count = $this->getRequestCount($ip, $path);
        
        if ($count >= $this->maxRequests) {
            return $response->error('Too many requests. Please try again later.', 429);
        }
        
        // Log this request
        $this->logRequest($ip, $path);
        
        return $next($request, $response);
    }

    private function createRateLimitTable(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            path VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ip_path (ip, path)
        )";
        
        $this->db->query($sql);
    }

    private function cleanOldEntries(): void
    {
        $sql = "DELETE FROM rate_limits WHERE created_at < DATE_SUB(NOW(), INTERVAL {$this->timeWindow} SECOND)";
        $this->db->query($sql);
    }

    private function getRequestCount(string $ip, string $path): int
    {
        $sql = "SELECT COUNT(*) as count FROM rate_limits 
                WHERE ip = :ip AND path = :path 
                AND created_at > DATE_SUB(NOW(), INTERVAL {$this->timeWindow} SECOND)";
        
        $result = $this->db->fetch($sql, [':ip' => $ip, ':path' => $path]);
        return (int)$result['count'];
    }

    private function logRequest(string $ip, string $path): void
    {
        $sql = "INSERT INTO rate_limits (ip, path) VALUES (:ip, :path)";
        $this->db->query($sql, [':ip' => $ip, ':path' => $path]);
    }
}