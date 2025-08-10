# Aplikasi Reimbursement Karyawan

Selamat datang di Proyek Aplikasi Reimbursement! Ini adalah aplikasi web *full-stack* yang dirancang untuk mempermudah proses pengajuan dan persetujuan reimbursement di dalam perusahaan. Aplikasi ini memiliki alur persetujuan multi-level berdasarkan peran pengguna, mulai dari staf hingga direktur.

![Tampilan Dashboard](<img width="1919" height="867" alt="image" src="https://github.com/user-attachments/assets/f4f79e3b-a2c5-4b7e-84fb-e0fc91c514f7" />
)

## 🌟 Fitur Utama

* **Autentikasi Pengguna**: Sistem login aman menggunakan JWT (JSON Web Tokens).
* **Panel Berbasis Peran (Role-Based)**: Tampilan dan aksi yang tersedia disesuaikan dengan peran pengguna (Staf, Atasan, Finance SPV, Finance Manager, Direktur).
* **Alur Persetujuan Multi-Level**: Setiap pengajuan akan melalui alur persetujuan berjenjang.
* **Pengajuan Reimbursement**: Staf dapat dengan mudah membuat pengajuan baru dengan rincian yang lengkap.
* **Riwayat & Pelacakan**: Semua pengguna dapat melihat riwayat dan melacak status progres persetujuan dari pengajuan yang relevan.
* **Desain Responsif & Modern**: Antarmuka yang bersih, modern, dan dilengkapi dengan animasi untuk pengalaman pengguna yang lebih baik.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan arsitektur modern dengan pemisahan antara frontend dan backend.

* **Frontend (FE):**
    * [React](https://reactjs.org/) (dengan Vite)
    * [TypeScript](https://www.typescriptlang.org/)
    * [Axios](https://axios-http.com/) untuk pemanggilan API
    * CSS Murni untuk styling

* **Backend (BE):**
    * [CodeIgniter 4](https://codeigniter.com/)
    * PHP 8.1+
    * MySQL
    * `firebase/php-jwt` untuk autentikasi JWT

## 🚀 Panduan Instalasi & Setup

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

### 1. Backend (CodeIgniter)

a. **Navigasi ke direktori backend:**
   ```bash
   cd reimbursement-be
   ```

b. **Install dependensi PHP:**
   ```bash
   composer install
   ```

c. **Konfigurasi Environment:**
   Salin file `env` menjadi `.env` dan sesuaikan konfigurasinya.
   ```bash
   cp env .env
   ```
   Buka file `.env` dan atur koneksi database Anda:
   ```
   CI_ENVIRONMENT = development
   app.baseURL = 'http://localhost/reimbursement-be/public'

   database.default.hostname = localhost
   database.default.database = reimbursement_db
   database.default.username = root
   database.default.password =
   
   jwt.secretkey = 'ganti-dengan-kunci-rahasia-yang-kuat'
   ```

d. **Buat Database:**
   Buat sebuah database baru di MySQL dengan nama yang sesuai (contoh: `reimbursement_db`).

e. **Jalankan Migrasi & Seeder:**
   Perintah ini akan membuat semua tabel yang dibutuhkan dan mengisinya dengan data awal (termasuk akun pengguna).
   ```bash
   php spark migrate
   php spark db:seed DatabaseSeeder
   ```

f. **Jalankan Server Backend:**
   Anda bisa menggunakan server bawaan CodeIgniter atau XAMPP/Laragon.
   ```bash
   php spark serve
   ```
   Atau, pastikan folder `reimbursement-be/public` dapat diakses melalui web server Anda.

### 2. Frontend (React)

a. **Navigasi ke direktori frontend:**
   ```bash
   cd reimbursement-fe
   ```

b. **Install dependensi Node.js:**
   ```bash
   npm install
   ```

c. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Aplikasi frontend akan berjalan di `http://localhost:5173` (atau port lain yang tersedia).

## 🔑 Akun Pengguna untuk Login

Gunakan akun-akun di bawah ini untuk mencoba alur kerja aplikasi sesuai dengan perannya masing-masing. Semua akun menggunakan password yang sama.

**Password Default untuk Semua Akun:** `password123`

| Peran             | Email                  | Deskripsi                                        |
| ----------------- | ---------------------- | ------------------------------------------------ |
| 👤 **Staff** | `staff@stn.com`        | Dapat membuat pengajuan reimbursement baru.      |
| 👨‍💼 **Atasan** | `superior@stn.com`     | Menyetujui pengajuan awal dari Staff.            |
| 💰 **Finance SPV** | `spv@stn.com`          | Melakukan pengecekan setelah disetujui Atasan. |
| 📊 **Finance Manager**| `manager@stn.com`      | Memberikan persetujuan final untuk nominal < 5jt. |
| 👑 **Direktur** | `director@stn.com`     | Memberikan persetujuan final untuk nominal >= 5jt. |

---
Selamat mencoba! Jika ada pertanyaan atau kendala, jangan ragu untuk membuka *issue*.
