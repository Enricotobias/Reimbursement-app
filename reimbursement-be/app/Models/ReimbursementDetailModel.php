<?php 

namespace App\Models;

use CodeIgniter\Model;

class ReimbursementDetailModel extends Model
{
    protected $table      = 'reimbursement_details';
    protected $primaryKey = 'id';
    protected $allowedFields = ['reimbursement_id', 'date', 'location', 'description', 'qty', 'amount'];
    
    // Detail tidak memerlukan timestamps
    protected $useTimestamps = false;
    
    // Validasi dasar untuk memastikan data yang masuk benar
    protected $validationRules = [
        'reimbursement_id' => 'required|integer',
        'date' => 'required|valid_date',
        'location' => 'required|max_length[255]',
        'qty' => 'required|integer|greater_than[0]',
        'amount' => 'required|decimal'
    ];
}