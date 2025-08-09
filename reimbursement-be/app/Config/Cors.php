<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */
class Cors extends BaseConfig
{
    /**
     * The default CORS configuration.
     */
public array $default = [
    'allowedOrigins'      => ['http://localhost:5173'],
    'allowedHeaders'      => ['X-API-KEY', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    'allowedMethods'      => ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    'supportsCredentials' => true,
    'maxAge'              => 3600,
];
}