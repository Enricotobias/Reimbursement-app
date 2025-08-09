<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Cors extends BaseConfig
{
    public array $default = [
        'allowedOrigins' => [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ],
        'allowedOriginsPatterns' => [],
        'supportsCredentials' => true, // Ubah ke true untuk mendukung Authorization header
        'allowedHeaders' => [
            'Content-Type', 
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin'
        ],
        'exposedHeaders' => [],
        'allowedMethods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'maxAge' => 7200,
    ];
}