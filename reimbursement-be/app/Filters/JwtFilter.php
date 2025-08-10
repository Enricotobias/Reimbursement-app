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
    private function getCorsHeaders($request)
    {
        $origin = $request->getHeaderLine('Origin');
        $allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];

        $allowOrigin = 'http://localhost:5173'; // default
        if (in_array($origin, $allowedOrigins)) {
            $allowOrigin = $origin;
        }

        return [
            'Access-Control-Allow-Origin' => $allowOrigin,
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-HTTP-Method-Override',
            'Vary' => 'Origin'
        ];
    }

    public function before(RequestInterface $request, $arguments = null)
    {
        // Skip JWT check untuk OPTIONS request (preflight CORS)
        if ($request->getMethod() === 'OPTIONS') {
            return null; // Biarkan CORS filter handle
        }
        
        $header = $request->getHeaderLine('Authorization');
        if (empty($header) || !preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            $response = Services::response();
            $corsHeaders = $this->getCorsHeaders($request);
            
            foreach ($corsHeaders as $key => $value) {
                $response->setHeader($key, $value);
            }
            
            return $response
                ->setBody(json_encode([
                    'status' => 'error',
                    'message' => 'Token tidak ditemukan atau format salah',
                    'error' => 'Unauthorized'
                ]))
                ->setStatusCode(401);
        }
        
        $token = $matches[1];

        try {
            $key = getenv('jwt.secretkey') ?: 'fallback-secret-key-for-development-only-change-this';
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            // Cek apakah token sudah kedaluwarsa
            if ($decoded->exp < time()) {
                throw new \Exception('Token kedaluwarsa');
            }
            
            // Simpan data user agar bisa diakses di controller
            $request->user = $decoded;
        } catch (\Exception $e) {
            $response = Services::response();
            $corsHeaders = $this->getCorsHeaders($request);
            
            foreach ($corsHeaders as $key => $value) {
                $response->setHeader($key, $value);
            }
            
            return $response
                ->setBody(json_encode([
                    'status' => 'error',
                    'message' => 'Token tidak valid atau kedaluwarsa: ' . $e->getMessage(),
                    'error' => 'Unauthorized'
                ]))
                ->setStatusCode(401);
        }
        
        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) 
    {
        // Pastikan CORS headers ada di response
        $corsHeaders = $this->getCorsHeaders($request);
        
        foreach ($corsHeaders as $key => $value) {
            $response->setHeader($key, $value);
        }
        
        return $response;
    }
}