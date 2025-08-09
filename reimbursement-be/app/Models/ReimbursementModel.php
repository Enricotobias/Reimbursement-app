<?php namespace App\Models;
use CodeIgniter\Model;
class ReimbursementModel extends Model
{
    protected $table      = 'reimbursements';
    protected $primaryKey = 'id';
    protected $allowedFields = ['user_id', 'reimbursement_date', 'acc_name', 'acc_no', 'bank', 'total_amount', 'status'];
    protected $useTimestamps = true;
}