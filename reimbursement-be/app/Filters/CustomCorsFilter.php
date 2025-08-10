<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class CustomCorsFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $origin = $request->getHeaderLine('Origin');
        $allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];

        // Tentukan origin yang diizinkan
        $allowOrigin = '*';
        if (in_array($origin, $allowedOrigins)) {
            $allowOrigin = $origin;
        } elseif (empty($origin)) {
            $allowOrigin = $allowedOrigins[0]; // Default ke localhost:5173
        }

        // Handle preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            $response = service('response');
            
            return $response
                ->setHeader('Access-Control-Allow-Origin', $allowOrigin)
                ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-HTTP-Method-Override')
                ->setHeader('Access-Control-Allow-Credentials', 'true')
                ->setHeader('Access-Control-Max-Age', '86400')
                ->setHeader('Vary', 'Origin')
                ->setStatusCode(200)
                ->setBody('CORS OK');
        }
        
        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        $origin = $request->getHeaderLine('Origin');
        $allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];

        // Tentukan origin yang diizinkan
        $allowOrigin = '*';
        if (in_array($origin, $allowedOrigins)) {
            $allowOrigin = $origin;
        } elseif (empty($origin)) {
            $allowOrigin = $allowedOrigins[0]; // Default ke localhost:5173
        }

        // Tambahkan CORS headers ke semua response
        $response->setHeader('Access-Control-Allow-Origin', $allowOrigin)
                 ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                 ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-HTTP-Method-Override')
                 ->setHeader('Access-Control-Allow-Credentials', 'true')
                 ->setHeader('Vary', 'Origin');
        
        return $response;
    }
}