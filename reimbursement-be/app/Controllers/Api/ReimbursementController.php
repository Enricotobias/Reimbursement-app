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

            // Cek apakah ini request untuk history (bisa ditambahkan parameter atau endpoint terpisah)
            $showAllHistory = $this->request->getGet('history') === 'true';
            
            if ($showAllHistory) {
                // Untuk halaman history, tampilkan semua data sesuai dengan role
                switch ($user->role) {
                    case 'staff':
                        // Staff hanya melihat pengajuan mereka sendiri
                        $data = $model->where('user_id', $user->uid)->orderBy('id', 'DESC')->findAll();
                        break;
                    case 'direct_superior':
                        // Direct superior melihat semua pengajuan yang pernah melewati tahap mereka
                        $data = $model->whereIn('status', [
                            'pending', 'approved_superior', 'approved_spv', 'approved_manager', 'completed', 'rejected'
                        ])->orderBy('id', 'DESC')->findAll();
                        break;
                    case 'finance_spv':
                        // Finance SPV melihat pengajuan yang sudah melewati superior
                        $data = $model->whereIn('status', [
                            'approved_superior', 'approved_spv', 'approved_manager', 'completed', 'rejected'
                        ])->orderBy('id', 'DESC')->findAll();
                        break;
                    case 'finance_manager':
                        // Finance Manager melihat pengajuan yang sudah melewati SPV
                        $data = $model->whereIn('status', [
                            'approved_spv', 'approved_manager', 'completed', 'rejected'
                        ])->orderBy('id', 'DESC')->findAll();
                        break;
                    case 'director':
                        // Director melihat pengajuan yang sudah melewati manager
                        $data = $model->whereIn('status', [
                            'approved_manager', 'completed', 'rejected'
                        ])->orderBy('id', 'DESC')->findAll();
                        break;
                    default:
                        return $this->failForbidden('Role tidak dikenal');
                }
            } else {
                // Untuk halaman dashboard, tampilkan hanya yang perlu diproses
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
            }
            
            // Tambahkan informasi user name untuk setiap pengajuan
            if (!empty($data)) {
                $userModel = model('UserModel');
                foreach ($data as &$item) {
                    $user_info = $userModel->find($item['user_id']);
                    $item['user_name'] = $user_info ? $user_info['name'] : 'Unknown User';
                }
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

    public function show($id = null)
    {
        $this->setCorsHeaders();
        
        try {
            // Validasi ID
            if (!$id || !is_numeric($id)) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'ID tidak valid'
                ], 400);
            }

            log_message('info', 'Requesting detail for reimbursement ID: ' . $id);
            
            $reimbursementModel = new ReimbursementModel();
            $detailModel = new ReimbursementDetailModel();

            // Coba ambil data reimbursement tanpa JOIN dulu untuk debug
            $reimbursement = $reimbursementModel->find($id);
            
            if (!$reimbursement) {
                log_message('warning', 'Reimbursement not found for ID: ' . $id);
                return $this->failNotFound('Data pengajuan tidak ditemukan');
            }

            // Ambil nama user secara terpisah untuk menghindari JOIN error
            $userModel = model('UserModel');
            $user = $userModel->find($reimbursement['user_id']);
            $reimbursement['user_name'] = $user ? $user['name'] : 'Unknown User';

            // Ambil details
            $details = $detailModel->where('reimbursement_id', $id)->findAll();
            $reimbursement['details'] = $details ?: [];

            log_message('info', 'Successfully retrieved reimbursement detail for ID: ' . $id);
            log_message('debug', 'Reimbursement data: ' . json_encode($reimbursement));
            
            return $this->respond($reimbursement);
            
        } catch (\Exception $e) {
            log_message('error', 'Error in reimbursements show: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            
            return $this->fail([
                'status' => 'error',
                'message' => 'Terjadi kesalahan server',
                'debug' => $e->getMessage() // Untuk development, hapus di production
            ], 500);
        }
    }

    public function create()
    {
        $this->setCorsHeaders();
        
        try {
            $user = $this->request->user;
            
            // Validasi role - hanya staff yang bisa create
            if ($user->role !== 'staff') {
                return $this->failForbidden('Hanya staff yang dapat membuat pengajuan');
            }

            $rawInput = $this->request->getBody();
            $inputData = json_decode($rawInput, true);

            if (!$inputData) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'Data tidak valid'
                ], 400);
            }

            $reimbursementModel = new ReimbursementModel();
            $detailModel = new ReimbursementDetailModel();
            
            // Mulai transaksi
            $db = \Config\Database::connect();
            $db->transStart();

            // Insert reimbursement utama
            $reimbursementData = [
                'user_id' => $user->uid,
                'reimbursement_date' => date('Y-m-d'),
                'acc_name' => $inputData['acc_name'],
                'acc_no' => $inputData['acc_no'],
                'bank' => $inputData['bank'],
                'total_amount' => $inputData['total_amount'],
                'status' => 'pending'
            ];

            $reimbursementId = $reimbursementModel->insert($reimbursementData);

            // Insert details
            foreach ($inputData['details'] as $detail) {
                $detailData = [
                    'reimbursement_id' => $reimbursementId,
                    'date' => $detail['date'],
                    'location' => $detail['location'],
                    'description' => $detail['description'],
                    'qty' => $detail['qty'],
                    'amount' => $detail['amount']
                ];
                $detailModel->insert($detailData);
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'Gagal menyimpan pengajuan'
                ], 500);
            }

            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Pengajuan berhasil dibuat',
                'id' => $reimbursementId
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error in reimbursements create: ' . $e->getMessage());
            return $this->fail([
                'status' => 'error',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approve($id = null)
    {
        $this->setCorsHeaders();
        
        try {
            $user = $this->request->user;
            $rawInput = $this->request->getBody();
            $inputData = json_decode($rawInput, true);

            if (!$inputData || !isset($inputData['action'])) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'Action tidak valid'
                ], 400);
            }

            $action = $inputData['action']; // 'approve' atau 'reject'
            $model = new ReimbursementModel();
            $reimbursement = $model->find($id);

            if (!$reimbursement) {
                return $this->failNotFound('Pengajuan tidak ditemukan');
            }

            // Tentukan status baru berdasarkan role dan action
            $newStatus = '';
            $canProcess = false;

            switch ($user->role) {
                case 'direct_superior':
                    if ($reimbursement['status'] === 'pending') {
                        $canProcess = true;
                        $newStatus = $action === 'approve' ? 'approved_superior' : 'rejected';
                    }
                    break;
                case 'finance_spv':
                    if ($reimbursement['status'] === 'approved_superior') {
                        $canProcess = true;
                        $newStatus = $action === 'approve' ? 'approved_spv' : 'rejected';
                    }
                    break;
                case 'finance_manager':
                    if ($reimbursement['status'] === 'approved_spv') {
                        $canProcess = true;
                        $newStatus = $action === 'approve' ? 'approved_manager' : 'rejected';
                    }
                    break;
                case 'director':
                    if ($reimbursement['status'] === 'approved_manager') {
                        $canProcess = true;
                        $newStatus = $action === 'approve' ? 'completed' : 'rejected';
                    }
                    break;
                default:
                    return $this->failForbidden('Anda tidak memiliki hak untuk memproses pengajuan ini');
            }

            if (!$canProcess) {
                return $this->fail([
                    'status' => 'error',
                    'message' => 'Status pengajuan tidak sesuai untuk diproses oleh role Anda'
                ], 400);
            }

            // Update status
            $model->update($id, ['status' => $newStatus]);

            return $this->respond([
                'status' => 'success',
                'message' => 'Pengajuan berhasil diproses',
                'new_status' => $newStatus
            ]);

        } catch (\Exception $e) {
            log_message('error', 'Error in reimbursements approve: ' . $e->getMessage());
            return $this->fail([
                'status' => 'error',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}