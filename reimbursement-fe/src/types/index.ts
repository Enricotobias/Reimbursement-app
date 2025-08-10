export interface User {
  uid: number;
  email: string;
  role: 'staff' | 'direct_superior' | 'finance_spv' | 'finance_manager' | 'director';
  exp: number;
}

export interface Reimbursement {
  id: number;
  user_id: number;
  user_name?: string;
  reimbursement_date: string;
  total_amount: string | number;
  status: string;
  acc_name?: string;
  acc_no?: string;
  bank?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReimbursementHistory extends Reimbursement {
  approval_progress?: {
    [role: string]: {
      status: 'waiting' | 'approved' | 'rejected';
      label: string;
    };
  };
}

export interface ReimbursementDetail {
  id: number;
  reimbursement_id: number;
  date: string;
  location: string;
  description: string;
  qty: number;
  amount: string | number;
}

export interface ReimbursementWithDetails extends Reimbursement {
  details: ReimbursementDetail[];
  bank_name?: string;
  account_name?: string;
  account_number?: string;
}