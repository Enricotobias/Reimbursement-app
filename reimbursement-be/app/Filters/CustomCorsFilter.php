<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class CustomCorsFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Handle preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            $response = service('response');
            
            return $response
                ->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
                ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
                ->setHeader('Access-Control-Allow-Credentials', 'true')
                ->setHeader('Access-Control-Max-Age', '86400')
                ->setStatusCode(200)
                ->setBody('CORS OK');
        }
        
        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Tambahkan CORS headers ke semua response
        $response->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
                 ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                 ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
                 ->setHeader('Access-Control-Allow-Credentials', 'true');
        
        return $response;
    }
}