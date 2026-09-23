// Icon mapping reference — single source of truth untuk seluruh TermFlow.
// Setiap aksi memakai ikon yang sama di semua halaman, stroke-width 1.75, size 16-18.
//
//   Actions → Lucide icon (or custom terminal icon where no Lucide match)
//   ───────────────────────────────────────────────────────────────────
//   Tambah/Buat baru          → Plus ( + )
//   Hapus                     → Trash2
//   Edit                      → SquarePen
//   Simpan                    → Save
//   Sukses / selesai          → CheckCircle
//   Batal / tutup             → X
//   Cari                      → Search  (paired with TerminalPromptIcon for ">_")
//   Filter                    → SlidersHorizontal
//   Command palette           → Terminal
//   Sync / Refresh            → RefreshCw
//   Settings                  → Settings
//   Notifikasi/Bell           → Bell
//   Tema                      → Palette  (Moon/Sun variant when toggling light/dark)
//   GitHub                    → Github
//   Bahasa                    → Languages
//   Peringatan / urgent       → AlertTriangle
//   Expand / collapse         → ChevronRight (rotates 90° on open)
//   Download / Export         → Download
//   Upload / Pilih foto       → ImagePlus
//   User / Profile            → User
//   Logout                    → LogOut
//   Inbox                     → Inbox
//   Board (Kanban)            → LayoutGrid
//   Grid/Table                → Table2
//   Timeline                  → Clock3
//   Graph/Dependencies        → Network
//   Zen / Focus               → Sparkles  (atau Eclipse)
//   Mission                   → Rocket
//   Analytics                 → BarChart3
//   Notes                     → NotebookPen
//   Kalender / Due            → Calendar
//   Zoom in/out/fit           → ZoomIn / ZoomOut / Maximize2
//   Komentar                  → MessageCircle
//   Checklist                 → ListChecks
//   Energy                    → Zap
//   More actions              → MoreHorizontal
//   Menu / hamburger          → Menu
//   Prompt / terminal cursor  → TerminalPromptIcon (custom SVG, block cursor)
//
// Warna ikon: inherit dari CSS variable tema aktif (currentColor).
//   - netral   → var(--text-muted) / var(--text-main)
//   - aktif    → var(--accent-main) / var(--accent-cyan)
//   Jangan hardcode hex pada ikon.

export const ICON_ACTIONS = {
  add: 'Plus',
  delete: 'Trash2',
  edit: 'SquarePen',
  save: 'Save',
  success: 'CheckCircle',
  close: 'X',
  search: 'Search',
  filter: 'SlidersHorizontal',
  command: 'Terminal',
  refresh: 'RefreshCw',
  settings: 'Settings',
  notification: 'Bell',
  theme: 'Palette',
  github: 'Github',
  language: 'Languages',
  warning: 'AlertTriangle',
  expand: 'ChevronRight',
  download: 'Download',
  upload: 'ImagePlus',
  user: 'User',
  logout: 'LogOut',
  inbox: 'Inbox',
} as const;
