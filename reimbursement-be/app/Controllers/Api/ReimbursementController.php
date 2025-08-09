<?php 

namespace App\Controllers\Api;

use App\Models\ReimbursementModel;
use App\Models\ReimbursementDetailModel;
use CodeIgniter\RESTful\ResourceController;

class ReimbursementController extends ResourceController
{
    private function setCorsHeaders()
    {
        $this->response->setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $this->response->setHeader('Access-Control-Allow-Credentials', 'true');
        $this->response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $this->response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
    
    public function index()
    {
        $this->setCorsHeaders();
        
        try {
            $user = $this->request->user;
            $model = new ReimbursementModel();
            $data = [];

            switch ($user->role) {
                case 'staff':
                    $data = $model->where('user_id', $user->uid)->orderBy('id', 'DESC')->findAll();
                    break;
                case 'direct_superior':
                    $data = $model->where('status', 'pending')->orderBy('id', 'DESC')->findAll();
                    break;
                case 'finance_spv':
                    $data = $model->where('status', 'approved_superior')->orderBy('id', 'DESC')->findAll();
                    break;
                case 'finance_manager':
                    $data = $model->where('status', 'approved_spv')->orderBy('id', 'DESC')->findAll();
                    break;
                case 'director':
                    $data = $model->where('status', 'approved_manager')->orderBy('id', 'DESC')->findAll();
                    break;
                default:
                    return $this->failForbidden('Role tidak dikenal');
            }
            
            // Pastikan return format konsisten
            return $this->respond([
                'status' => 'success',
                'message' => 'Data berhasil dimuat',
                'data' => $data ?: [] // Pastikan selalu array, meski kosong
            ]);
            
        } catch (\Exception $e) {
            log_message('error', 'Error in reimbursements index: ' . $e->getMessage());
            return $this->fail([
                'status' => 'error',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

        public function show($id = null){
        $reimbursementModel = new ReimbursementModel();
        $detailModel = new ReimbursementDetailModel();

        $reimbursement = $reimbursementModel
            ->select('reimbursements.*, users.name as user_name')
            ->join('users', 'users.id = reimbursements.user_id')
            ->find($id);

        if (!$reimbursement) {
            return $this->failNotFound('Data pengajuan tidak ditemukan');
        }

        $details = $detailModel->where('reimbursement_id', $id)->findAll();
        $reimbursement['details'] = $details;

        return $this->respond($reimbursement);
    }

    // Method lainnya tetap sama...
    public function create()
    {
        $this->setCorsHeaders();
        // ... kode create sama seperti sebelumnya
    }

    public function approve($id = null)
    {
        $this->setCorsHeaders();
        // ... kode approve sama seperti sebelumnya
    }
}