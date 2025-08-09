<?php namespace App\Controllers\API;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;

class AuthController extends ResourceController
{
    public function login()
    {
        $rules = ['email' => 'required|valid_email', 'password' => 'required'];
        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $model = new UserModel();
        $user = $model->where('email', $this->request->getVar('email'))->first();
        if (!$user) return $this->failNotFound('Email tidak ditemukan');

        if (!password_verify($this->request->getVar('password'), $user['password'])) {
            return $this->fail(['error' => 'Password salah'], 401);
        }

        $key = getenv('jwt.secretkey');
        $payload = [
            'iat' => time(),
            'exp' => time() + 3600, // Token berlaku 1 jam
            'uid' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];
        $token = JWT::encode($payload, $key, 'HS256');
        return $this->respond(['token' => $token]);
    }
}