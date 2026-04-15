<?php

namespace App\Core;

class Logger
{
    private string $logPath;

    public function __construct(?string $logPath = null)
    {
        $this->logPath = $logPath ?? __DIR__ . '/../../logs';
    }

    private function getLogFile(string $level): string
    {
        $date = date('Y-m-d');
        return $this->logPath . "/app-$date.log";
    }

    private function formatMessage(string $level, string $message, array $context = []): string
    {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = empty($context) ? '' : ' ' . json_encode($context);
        return "[$timestamp] $level: $message$contextStr" . PHP_EOL;
    }

    public function log(string $level, string $message, array $context = []): void
    {
        $logDir = dirname($this->getLogFile($level));
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $formattedMessage = $this->formatMessage($level, $message, $context);
        file_put_contents($this->getLogFile($level), $formattedMessage, FILE_APPEND);
    }

    public function info(string $message, array $context = []): void
    {
        $this->log('INFO', $message, $context);
    }

    public function error(string $message, array $context = []): void
    {
        $this->log('ERROR', $message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->log('WARNING', $message, $context);
    }

    public function debug(string $message, array $context = []): void
    {
        $this->log('DEBUG', $message, $context);
    }
}