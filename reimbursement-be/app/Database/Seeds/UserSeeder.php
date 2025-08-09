<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'name'       => 'Staff Karyawan',
                'department' => 'Operasional',
                'branch'     => 'Jakarta Pusat',
                'role'       => 'staff',
                'email'      => 'staff@stn.com',
                'password'   => password_hash('password123', PASSWORD_DEFAULT),
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name'       => 'Budi Superior',
                'department' => 'Operasional',
                'branch'     => 'Jakarta Pusat',
                'role'       => 'direct_superior',
                'email'      => 'superior@stn.com',
                'password'   => password_hash('password123', PASSWORD_DEFAULT),
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name'       => 'Citra Finance SPV',
                'department' => 'Finance',
                'branch'     => 'Pusat',
                'role'       => 'finance_spv',
                'email'      => 'spv@stn.com',
                'password'   => password_hash('password123', PASSWORD_DEFAULT),
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name'       => 'Doni Finance Manager',
                'department' => 'Finance',
                'branch'     => 'Pusat',
                'role'       => 'finance_manager',
                'email'      => 'manager@stn.com',
                'password'   => password_hash('password123', PASSWORD_DEFAULT),
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name'       => 'Eka Direktur',
                'department' => 'Direksi',
                'branch'     => 'Pusat',
                'role'       => 'director',
                'email'      => 'director@stn.com',
                'password'   => password_hash('password123', PASSWORD_DEFAULT),
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];

        // Using Query Builder
        $this->db->table('users')->insertBatch($data);
    }
}