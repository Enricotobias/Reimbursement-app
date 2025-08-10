<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ReimbursementSeeder extends Seeder
{
    public function run()
    {
        // Insert test reimbursements
        $reimbursementData = [
            [
                'id' => 1,
                'user_id' => 1, // staff user
                'reimbursement_date' => date('Y-m-d'),
                'acc_name' => 'Staff Karyawan',
                'acc_no' => '1234567890',
                'bank' => 'BCA',
                'total_amount' => 500000.00,
                'status' => 'pending',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'id' => 2,
                'user_id' => 1, // staff user
                'reimbursement_date' => date('Y-m-d', strtotime('-1 day')),
                'acc_name' => 'Staff Karyawan',
                'acc_no' => '1234567890',
                'bank' => 'Mandiri',
                'total_amount' => 750000.00,
                'status' => 'approved_superior',
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'updated_at' => date('Y-m-d H:i:s'),
            ]
        ];

        // Insert reimbursements
        foreach ($reimbursementData as $data) {
            $this->db->table('reimbursements')->insert($data);
        }

        // Insert test reimbursement details
        $detailData = [
            [
                'reimbursement_id' => 1,
                'date' => date('Y-m-d'),
                'location' => 'Jakarta',
                'description' => 'Transport ke client',
                'qty' => 2,
                'amount' => 100000.00,
            ],
            [
                'reimbursement_id' => 1,
                'date' => date('Y-m-d'),
                'location' => 'Jakarta',
                'description' => 'Makan siang dengan client',
                'qty' => 3,
                'amount' => 150000.00,
            ],
            [
                'reimbursement_id' => 2,
                'date' => date('Y-m-d', strtotime('-1 day')),
                'location' => 'Surabaya',
                'description' => 'Transport ke kantor cabang',
                'qty' => 1,
                'amount' => 250000.00,
            ],
            [
                'reimbursement_id' => 2,
                'date' => date('Y-m-d', strtotime('-1 day')),
                'location' => 'Surabaya',
                'description' => 'Hotel menginap',
                'qty' => 1,
                'amount' => 500000.00,
            ]
        ];

        // Insert details
        foreach ($detailData as $data) {
            $this->db->table('reimbursement_details')->insert($data);
        }
    }
}