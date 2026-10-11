# TermFlow

Aplikasi manajemen tugas dan proyek dengan tampilan ala terminal. Cepat dipakai lewat keyboard, rapi dilihat lewat berbagai tampilan.

> **Status: dalam pengembangan.** Fitur dan tampilan masih bisa berubah.

## Tampilan

### Board (Kanban)
<img width="1343" height="744" alt="Dependencies" src="https://github.com/user-attachments/assets/42e50838-fa9a-478e-84d6-11ad7f6f3675" />

### Kalender
<img width="1346" height="734" alt="Kalender" src="https://github.com/user-attachments/assets/7f6471a9-b491-44c4-9418-e0b22457a638" />

### Tabel
<img width="1344" height="737" alt="Tabel" src="https://github.com/user-attachments/assets/a825a393-2381-47c2-886b-c8e8fa530f6c" />

### Task Dependencies (radial)
<img width="1348" height="738" alt="Dashboard" src="https://github.com/user-attachments/assets/a2a73291-215b-4ed9-99a6-b062ae6b428d" />

## Fitur

- **Board (Kanban)**: drag and drop kartu antar kolom (Akan Dikerjakan, Sedang Dikerjakan, Peninjauan, Selesai), bisa di desktop dan HP.
- **Tabel**: daftar tugas lengkap dengan status, prioritas, assignee, checklist, progress, dan due date.
- **Kalender**: tugas multi-hari tampil sebagai bar dari tanggal mulai sampai deadline.
- **Task Dependencies (radial)**: peta tugas per board, warna node menunjukkan urgensi deadline.
- **Command Palette**: akses cepat dengan `Ctrl + K`, cheatsheet shortcut dengan `?`.
- **Activity log**: riwayat aktivitas bergaya `git log --oneline`.
- **Multi board**: pindah antar board dan buat board baru.
- **Autentikasi**: login dengan email dan password.
- **PWA**: bisa dipasang sebagai aplikasi lewat tombol *Install App*.

## Teknologi

- Next.js
- *(tambahkan: database, library auth, styling, dll.)*

## Memulai

Prasyarat: Node.js 18+ dan npm (atau pnpm/yarn).

```bash
git clone https://github.com/RadityaArva/terminal-task.git
cd terminal-task
npm install
cp .env.example .env.local
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Roadmap

- [x] Board, tabel, kalender, dan graf dependensi
- [x] Command palette dan activity log
- [x] Login
- [ ] Integrasi GitHub
- [ ] Tema ala GitHub
- [ ] Halaman profil
- [ ] Dwibahasa (ID / EN)
- [ ] Notifikasi
- [ ] Subtask dan checklist yang lebih lengkap

## Kontribusi

Project ini masih tahap awal. Saran dan laporan bug lewat Issues sangat diterima.

## Lisensi

*(Pilih lisensi, misalnya MIT.)*


