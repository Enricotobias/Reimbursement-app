<?php namespace App\Filters;

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
        $header = $request->getHeaderLine('Authorization');
        if (empty($header) || !preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            return Services::response()->setBody('Token tidak ditemukan atau format salah')->setStatusCode(401);
        }
        $token = $matches[1];

        try {
            $key = getenv('jwt.secretkey');
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            // Simpan data user agar bisa diakses di controller
            $request->user = $decoded;
        } catch (\Exception $e) {
            return Services::response()->setBody('Token tidak valid atau kedaluwarsa')->setStatusCode(401);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}