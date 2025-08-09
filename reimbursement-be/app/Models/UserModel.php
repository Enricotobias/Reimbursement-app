<?php namespace App\Models;
use CodeIgniter\Model;
class UserModel extends Model
{
    protected $table      = 'users';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'sin', 'department', 'branch', 'role', 'email', 'password'];
    protected $useTimestamps = true;
}