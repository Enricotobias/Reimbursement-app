<?php namespace App\Controllers\Api;

use App\Models\ReimbursementModel;
use App\Models\ReimbursementDetailModel;
use CodeIgniter\RESTful\ResourceController;

class ReimbursementController extends ResourceController
{
    public function index()
    {
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
        }
        return $this->respond($data);
    }

    public function create()
    {
        $user = $this->request->user;
        $json = $this->request->getJSON();
        $db = \Config\Database::connect();
        $db->transBegin();

        try {
            $reimbursementModel = new ReimbursementModel();
            $detailModel = new ReimbursementDetailModel();

            $mainData = [
                'user_id' => $user->uid,
                'reimbursement_date' => date('Y-m-d'),
                'acc_name' => $json->acc_name, 'acc_no' => $json->acc_no, 'bank' => $json->bank,
                'total_amount' => $json->total_amount, 'status' => 'pending'
            ];
            $reimbursementId = $reimbursementModel->insert($mainData, true);

            foreach ($json->details as $detail) {
                $detailModel->insert([
                    'reimbursement_id' => $reimbursementId,
                    'date' => $detail->date, 'location' => $detail->location, 'description' => $detail->description,
                    'qty' => $detail->qty, 'amount' => $detail->amount,
                ]);
            }

            if ($db->transStatus() === false) {
                $db->transRollback(); return $this->fail('Gagal menyimpan data.');
            } else {
                $db->transCommit(); return $this->respondCreated(['message' => 'Pengajuan berhasil dibuat']);
            }
        } catch (\Exception $e) {
            $db->transRollback(); return $this->fail('Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function approve($id = null)
    {
        $user = $this->request->user;
        $model = new ReimbursementModel();
        $reimbursement = $model->find($id);

        if (!$reimbursement) return $this->failNotFound('Data tidak ditemukan');

        $json = $this->request->getJSON();
        $action = $json->action ?? 'approve'; // 'approve' or 'reject'

        if ($action === 'reject') {
            $model->update($id, ['status' => 'rejected']);
            return $this->respond(['message' => 'Pengajuan berhasil ditolak']);
        }

        $newStatus = '';
        $currentStatus = $reimbursement['status'];

        switch ($user->role) {
            case 'direct_superior': if ($currentStatus === 'pending') $newStatus = 'approved_superior'; break;
            case 'finance_spv': if ($currentStatus === 'approved_superior') $newStatus = 'approved_spv'; break;
            case 'finance_manager': if ($currentStatus === 'approved_spv') $newStatus = 'approved_manager'; break;
            case 'director': if ($currentStatus === 'approved_manager') $newStatus = 'completed'; break; // Langsung completed
            default: return $this->failForbidden('Anda tidak memiliki hak akses untuk approval ini');
        }

        if (empty($newStatus)) return $this->fail('Status pengajuan tidak sesuai untuk diproses', 409); // 409 Conflict

        $model->update($id, ['status' => $newStatus]);
        return $this->respond(['message' => 'Status berhasil diperbarui']);
    }
}
