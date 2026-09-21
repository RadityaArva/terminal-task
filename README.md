# TermFlow

> Project & task management, tapi rasanya kayak ngoding di terminal.

TermFlow adalah aplikasi manajemen proyek terinspirasi dari Asana/Trello/Linear, tapi dibungkus dengan UI bergaya terminal/CLI: cepat, keyboard-first, minim distraksi, dan bisa di-theme sepuasnya seperti tampilan editor kode (VS Code / GitHub / terminal emulator).

---

## 🎯 Konsep Utama

- **Terminal-first UX** — navigasi utama pakai command palette (`Ctrl+K` / `:` seperti Vim), bukan klak-klik menu.
- **Tetap visual & readable** — bukan literal terminal hitam-putih polos, tapi UI modern dengan nuansa monospace, garis-garis ala ASCII, dan animasi ketik (typing effect) di beberapa tempat.
- **Cepat & ringan** — tanpa loading berat, semua interaksi terasa instan.
- **Bisa di-theme** — seperti GitHub (Light, Dark, Dimmed, High Contrast) + tema komunitas (Dracula, Nord, Solarized, Monokai, dll).
- **Dwibahasa** — Bahasa Indonesia & English, bisa ganti kapan saja dari Settings atau command palette.

---

## ✨ Fitur

### 1. Manajemen Proyek & Task
- Board (Kanban), List View, dan **Table/Grid View** ala spreadsheet
- Sub-task, checklist, dan dependency antar task
- Due date, prioritas, label/tag, assignee
- Filter & search super cepat lewat command palette (`/filter status:done assignee:me`)
- Drag & drop tetap didukung, tapi semua bisa juga full keyboard (`j/k` untuk navigasi, `Enter` untuk buka task — gaya Vim)
- Timeline / Gantt sederhana untuk melihat jadwal proyek

### 2. Command Palette (jantung aplikasi)
- Buka task, pindah proyek, ganti tema, ubah status — semua lewat command, contoh:
  - `> new task "Fix login bug" #bug @radit due:tomorrow`
  - `> theme dark`
  - `> goto project frontend`
- Command history (panah atas/bawah seperti shell)
- Autocomplete untuk nama proyek, user, dan label

### 3. Tema (seperti GitHub Settings → Appearance)
- Preset: Light, Dark, Dimmed, High Contrast, Dracula, Nord, Solarized, Monokai
- Custom theme builder: atur warna accent, background, font (termasuk font monospace: JetBrains Mono, Fira Code, dll)
- Sinkron dengan tema sistem (auto light/dark)
- Preview tema real-time sebelum di-apply

### 4. Integrasi & Tracking GitHub
- Hubungkan akun GitHub → tampilkan commit, PR, issue terbaru langsung di dashboard
- Link task TermFlow ke commit/PR (contoh: commit message `fixes TF-42` otomatis update status task)
- Contribution graph ala GitHub (heatmap aktivitas) tapi untuk aktivitas di TermFlow
- Widget "Recent Activity" gabungan: aktivitas GitHub + aktivitas TermFlow dalam satu feed

### 5. Profil Pengguna
- Halaman profil publik: avatar, bio, statistik task selesai, streak harian
- Badge/achievement (misal: "7-day streak", "100 tasks completed")
- Riwayat aktivitas (log ala `git log`, bisa di-scroll)
- Statistik produktivitas (grafik task selesai per minggu/bulan)

### 6. Kolaborasi Tim
- Workspace multi-tim/multi-proyek
- Komentar di task dengan mention (`@nama`)
- Notifikasi real-time (bisa juga muncul sebagai "toast" bergaya terminal log)
- Role & permission (Owner, Admin, Member, Viewer)

### 7. Pengaturan Bahasa
- Toggle **Bahasa Indonesia / English** di Settings
- Semua UI, notifikasi, dan pesan sistem tersedia dalam 2 bahasa
- Deteksi otomatis bahasa browser saat pertama kali buka (bisa diubah manual kapan saja)

### 8. Fitur Tambahan (nice-to-have, buat makin keren)
- Mode "Zen/Focus" — sembunyikan semua UI kecuali task yang sedang dikerjakan + timer Pomodoro
- Integrasi kalender (Google Calendar sync)
- Export data (Markdown, CSV, JSON)
- Offline-first dengan sinkronisasi otomatis saat online
- Keyboard shortcut cheatsheet (`?` untuk buka overlay bantuan, seperti GitHub)

---

## 🛠️ Tech Stack (saran)

| Layer | Rekomendasi |
|---|---|
| Frontend | React / Next.js + TailwindCSS |
| State Management | Zustand atau Redux Toolkit |
| Backend | Node.js (NestJS/Express) atau Supabase |
| Database | PostgreSQL |
| Auth | NextAuth / Clerk (dukung OAuth GitHub) |
| Realtime | WebSocket / Supabase Realtime |
| Font | JetBrains Mono / Fira Code / IBM Plex Mono |
| Command Palette Lib | `cmdk` |
| i18n | `next-intl` atau `i18next` |

---

## 📁 Struktur Folder (contoh)

```
termflow/
├── src/
│   ├── components/
│   │   ├── terminal-ui/       # komponen bergaya terminal (command palette, log view, dll)
│   │   ├── board/              # kanban & task components
│   │   └── profile/
│   ├── features/
│   │   ├── tasks/
│   │   ├── github-integration/
│   │   └── theming/
│   ├── locales/
│   │   ├── id.json
│   │   └── en.json
│   ├── themes/
│   │   ├── github-dark.json
│   │   ├── github-light.json
│   │   └── dracula.json
│   └── lib/
├── public/
└── README.md
```

---

## 🚀 Roadmap Pengembangan

- [ ] **MVP**: CRUD task, board view, command palette dasar, 2 tema (light/dark)
- [ ] **v0.2**: Table view, filter/search via command, i18n ID/EN
- [ ] **v0.3**: Integrasi GitHub (OAuth, commit/PR tracking)
- [ ] **v0.4**: Halaman profil, achievement, statistik
- [ ] **v0.5**: Realtime kolaborasi, notifikasi, komentar
- [ ] **v1.0**: Custom theme builder, mode Zen/Focus, export data

---

## ⌨️ Contoh Keyboard Shortcut

| Shortcut | Aksi |
|---|---|
| `Ctrl/Cmd + K` | Buka command palette |
| `j` / `k` | Navigasi task ke bawah/atas |
| `n` | Task baru |
| `Enter` | Buka detail task |
| `g` lalu `p` | Pindah ke halaman Profil |
| `g` lalu `d` | Pindah ke Dashboard |
| `?` | Tampilkan semua shortcut |

---

## 📝 Catatan untuk Vibe Coding

Saat membangun dengan bantuan AI, gunakan README ini sebagai "prompt spec" utama. Beberapa tips:
1. Bangun dulu **komponen terminal-UI inti** (command palette + theme switcher) sebelum fitur task — ini pondasi identitas visual aplikasi.
2. Jangan ke semua fitur sekaligus; ikuti urutan Roadmap di atas.
3. Simpan semua string teks di `locales/id.json` dan `locales/en.json` sejak awal, jangan hardcode teks di komponen — supaya dwibahasa gampang dirawat.
4. Uji command palette dengan skenario nyata (buat task, ganti tema, pindah proyek) sebelum polish visual.

---

## 📄 Lisensi

MIT — bebas dipakai, dimodifikasi, dan dikembangkan.