<?php namespace App\Models;
use CodeIgniter\Model;
class ReimbursementDetailModel extends Model
{
    protected $table      = 'reimbursement_details';
    protected $primaryKey = 'id';
    protected $allowedFields = ['reimbursement_id', 'date', 'location', 'description', 'qty', 'amount'];
    // Detail tidak memerlukan timestamps
    protected $useTimestamps = false; 
}