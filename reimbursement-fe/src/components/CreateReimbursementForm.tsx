import React, { useState } from 'react';
import { apiService } from '../services/apiService';

interface DetailItem {
  date: string;
  location: string;
  description: string;
  qty: number;
  amount: string;
}

const CreateReimbursementForm = () => {
  const [accName, setAccName] = useState('');
  const [accNo, setAccNo] = useState('');
  const [bank, setBank] = useState('');
  const [details, setDetails] = useState<DetailItem[]>([
    { date: '', location: '', description: '', qty: 1, amount: '' }
  ]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [e.target.name]: e.target.value };
    setDetails(newDetails);
  };

  const addDetailRow = () => {
    setDetails([...details, { date: '', location: '', description: '', qty: 1, amount: '' }]);
  };

  const removeDetailRow = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const totalAmount = details.reduce((sum, item) => sum + (Number(item.amount) * item.qty), 0);
    const payload = { acc_name: accName, acc_no: accNo, bank, details, total_amount: totalAmount };

    try {
      await apiService.createReimbursement(payload);
      setMessage({ type: 'success', text: 'Pengajuan berhasil dikirim!' });
      // Reset form
      setAccName(''); setAccNo(''); setBank('');
      setDetails([{ date: '', location: '', description: '', qty: 1, amount: '' }]);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengirim pengajuan. Silakan coba lagi.' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Form Pengajuan Reimbursement Baru</h2>
      <fieldset style={{ marginBottom: '20px' }}>
        <legend>Informasi Rekening</legend>
        <input name="acc_name" value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Nama Pemilik Rekening" required />
        <input name="acc_no" value={accNo} onChange={(e) => setAccNo(e.target.value)} placeholder="Nomor Rekening" required />
        <input name="bank" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Nama Bank" required />
      </fieldset>
      
      <fieldset>
        <legend>Rincian Reimbursement</legend>
        {details.map((detail, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="date" name="date" value={detail.date} onChange={(e) => handleDetailChange(index, e)} required />
            <input name="location" value={detail.location} onChange={(e) => handleDetailChange(index, e)} placeholder="Lokasi" required />
            <input name="description" value={detail.description} onChange={(e) => handleDetailChange(index, e)} placeholder="Deskripsi" required style={{ flex: 1 }} />
            <input type="number" name="qty" value={detail.qty} onChange={(e) => handleDetailChange(index, e)} placeholder="Qty" required style={{ width: '60px' }} />
            <input type="number" name="amount" value={detail.amount} onChange={(e) => handleDetailChange(index, e)} placeholder="Nominal" required />
            {details.length > 1 && <button type="button" onClick={() => removeDetailRow(index)}>Hapus</button>}
          </div>
        ))}
        <button type="button" onClick={addDetailRow}>+ Tambah Rincian</button>
      </fieldset>
      
      {message && <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>{message.text}</p>}
      <button type="submit" disabled={loading} style={{ marginTop: '20px', padding: '10px 20px' }}>
        {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
      </button>
    </form>
  );
};

export default CreateReimbursementForm;