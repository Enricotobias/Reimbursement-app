export interface User {
  uid: number;
  email: string;
  role: 'staff' | 'direct_superior' | 'finance_spv' | 'finance_manager' | 'director';
}

export interface Reimbursement {
  id: number;
  user_id: number;
  reimbursement_date: string;
  total_amount: string;
  status: string;
}