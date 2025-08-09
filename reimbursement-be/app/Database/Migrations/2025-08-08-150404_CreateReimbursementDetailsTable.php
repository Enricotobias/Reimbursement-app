<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateReimbursementDetailsTable extends Migration
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
            'reimbursement_id' => [
                'type'       => 'INT',
                'constraint' => 5,
                'unsigned'   => true,
            ],
            'date' => [
                'type' => 'DATE',
            ],
            'location' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'qty' => [
                'type'       => 'INT',
                'constraint' => 5,
            ],
            'amount' => [
                'type'       => 'DECIMAL',
                'constraint' => '15,2',
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('reimbursement_id', 'reimbursements', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('reimbursement_details');
    }

    public function down()
    {
        $this->forge->dropTable('reimbursement_details');
    }
}