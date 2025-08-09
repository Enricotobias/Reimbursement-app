<?php 

namespace App\Controllers\Api;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;

class AuthController extends ResourceController
{
    public function login()
    {
        // Set CORS headers dulu
        $this->response->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $this->response->setHeader('Access-Control-Allow-Credentials', 'true');
        
        try {
            // Method 1: Coba ambil dari JSON body
            $rawInput = $this->request->getBody();
            log_message('debug', 'Raw request body: ' . $rawInput);
            
            $inputData = json_decode($rawInput, true);
            
            // Jika JSON decode gagal, coba dari POST
            if (!$inputData) {
                $inputData = [
                    'email' => $this->request->getPost('email'),
                    'password' => $this->request->getPost('password')
                ];
            }
            
            log_message('debug', 'Parsed input data: ' . print_r($inputData, true));
            
            // Validasi manual (tidak pakai validate() yang bermasalah)
            if (empty($inputData['email']) || empty($inputData['password'])) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'Email dan password wajib diisi'
                ], 400);
            }
            
            if (!filter_var($inputData['email'], FILTER_VALIDATE_EMAIL)) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'Format email tidak valid'
                ], 400);
            }

            // Cari user
            $model = new UserModel();
            $user = $model->where('email', $inputData['email'])->first();
            
            if (!$user) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'Email tidak ditemukan'
                ], 404);
            }

            // Verifikasi password
            if (!password_verify($inputData['password'], $user['password'])) {
                return $this->fail([
                    'status' => 'error', 
                    'message' => 'Password salah'
                ], 401);
            }

            // Generate JWT
            $key = getenv('jwt.secretkey');
            if (!$key) {
                $key = 'fallback-secret-key-for-development-only-change-this';
            }
            
            $payload = [
                'iat' => time(),
                'exp' => time() + 3600,
                'uid' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
            ];
            
            $token = JWT::encode($payload, $key, 'HS256');
            
            return $this->respond([
                'status' => 'success',
                'message' => 'Login berhasil',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'name' => $user['name']
                ]
            ]);
            
        } catch (\Exception $e) {
            log_message('error', 'Login error: ' . $e->getMessage());
            return $this->fail([
                'status' => 'error',
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
            ], 500);
        }
    }
}