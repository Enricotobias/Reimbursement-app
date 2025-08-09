<?php 

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Config\Services;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Skip JWT check untuk OPTIONS request (preflight CORS)
        if ($request->getMethod() === 'OPTIONS') {
            return null; // Biarkan CORS filter handle
        }
        
        $header = $request->getHeaderLine('Authorization');
        if (empty($header) || !preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            $response = Services::response();
            return $response
                ->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
                ->setHeader('Access-Control-Allow-Credentials', 'true')
                ->setBody(json_encode(['error' => 'Token tidak ditemukan atau format salah']))
                ->setStatusCode(401);
        }
        
        $token = $matches[1];

        try {
            $key = getenv('jwt.secretkey') ?: 'fallback-secret-key-for-development-only-change-this';
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            // Simpan data user agar bisa diakses di controller
            $request->user = $decoded;
        } catch (\Exception $e) {
            $response = Services::response();
            return $response
                ->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
                ->setHeader('Access-Control-Allow-Credentials', 'true')
                ->setBody(json_encode(['error' => 'Token tidak valid atau kedaluwarsa']))
                ->setStatusCode(401);
        }
        
        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) 
    {
        // Pastikan CORS headers ada di response
        $response->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
                 ->setHeader('Access-Control-Allow-Credentials', 'true');
        
        return $response;
    }
}