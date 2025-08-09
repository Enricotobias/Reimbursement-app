<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateReimbursementsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 5,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 5,
                'unsigned'   => true,
            ],
            'reimbursement_date' => [
                'type' => 'DATE',
            ],
            'acc_name' => [
                'type'       => 'VARCHAR',
                'constraint' => '100',
            ],
            'acc_no' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
            ],
            'bank' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
            ],
            'total_amount' => [
                'type'       => 'DECIMAL',
                'constraint' => '15,2',
                'default'    => 0.00,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['pending', 'approved_superior', 'approved_spv', 'approved_manager', 'rejected', 'completed'],
                'default'    => 'pending',
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('reimbursements');
    }

    public function down()
    {
        $this->forge->dropTable('reimbursements');
    }
}