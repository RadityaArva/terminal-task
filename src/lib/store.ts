import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemeId, applyTheme } from './themes';
import { Language } from './i18n';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type ViewMode = 'board' | 'grid' | 'timeline' | 'graph' | 'analytics' | 'zen' | 'profile' | 'inbox' | 'mission' | 'notes';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  energyLevel?: EnergyLevel;
  history?: Array<{ id: string; timestamp: string; user: string; field: string; before: string; after: string }>;
  assignee: string;
  startDate?: string;
  endDate?: string;
  dueDate: string;
  dueTime?: string;
  labels: string[];
  dependencyIds?: string[];
  subtasks: Subtask[];
  comments: CommentItem[];
  githubPr?: {
    number: number;
    title: string;
    url: string;
    status: 'open' | 'merged';
  };
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  organizationName?: string;
  members?: Array<{ username: string; role: 'Owner' | 'Admin' | 'Member' | 'Viewer' }>;
}

export interface ProjectNote {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
}

export interface EbookSource {
  id: string;
  title: string;
  type: 'pdf' | 'link';
  url: string; // url or data URL / file name
  fileName?: string;
  description?: string;
  tags: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  commitHash: string;
  message: string;
  user: string;
  taskId?: string;
}

export interface FocusSession {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  role: string;
  avatarUrl: string;
  bio: string;
  dailyStreak: number;
  totalCompleted: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }>;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
}

interface TermFlowState {
  // Tasks & Projects
  tasks: Task[];
  projects: Project[];
  activeProjectId: string;
  selectedTaskId: string | null;
  
  // UI & View Mode
  viewMode: ViewMode;
  themeId: ThemeId;
  lang: Language;
  searchFilter: string;
  projectNotes: Record<string, ProjectNote[]>;
  notes: Note[];
  ebooks: EbookSource[];
  addEbook: (item: Omit<EbookSource, 'id' | 'createdAt'>) => string;
  deleteEbook: (id: string) => void;

  
  // CLI & History
  commandHistory: string[];
  activityLogs: ActivityLogItem[];
  focusSessions: FocusSession[];
  
  // User Profile
  profile: UserProfile;
  password: string;
  isAuthenticated: boolean;
  notificationSettings: NotificationSettings;
  glassCustomBg: string;
  glassCustomImage: string;
  setGlassBackground: (bg: string, img?: string) => void;

  
  // Zen Mode Pomodoro
  zenTaskId: string | null;
  pomodoroMinutes: number;
  pomodoroSeconds: number;
  isPomodoroRunning: boolean;
  pomodoroMode: 'work' | 'break';
  focusTaskId: string | null;
  focusDurationSeconds: number;
  focusStartedAt: string | null;

  // Actions
  setThemeId: (themeId: ThemeId) => void;
  setLang: (lang: Language) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setActiveProjectId: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'key'>) => string;
  setSelectedTaskId: (taskId: string | null) => void;
  setSearchFilter: (filter: string) => void;
  saveProjectNote: (projectId: string, note: Omit<ProjectNote, 'id' | 'updatedAt'> & { id?: string }) => void;
  deleteProjectNote: (projectId: string, noteId: string) => void;
  addNote: (note: Pick<Note, 'title'> & Partial<Pick<Note, 'content' | 'tags' | 'folder'>>) => string;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'folder'>>) => void;
  deleteNote: (id: string) => void;
  openNote: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPassword: (password: string) => void;
  login: (password: string) => boolean;
  logout: () => void;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  addCommandHistory: (cmd: string) => void;
  startFocus: (taskId: string, durationMinutes?: number) => void;
  stopFocus: () => void;
  
  // Task Actions
  addTask: (taskData: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, status: TaskStatus) => void;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => void;
  bulkDeleteTasks: (ids: string[]) => void;
  purgeExpiredTasks: () => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addComment: (taskId: string, content: string, author?: string) => void;
  
  // Pomodoro Actions
  setZenTask: (taskId: string | null) => void;
  togglePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
}

const initialProjects: Project[] = [
  { id: 'inbox', name: 'Inbox', key: 'IN', description: 'Quick capture tasks awaiting triage' },
  { id: 'proj-1', name: 'TermFlow Web App', key: 'TF', description: 'Terminal-first task manager frontend' },
  { id: 'proj-2', name: 'Backend API Service', key: 'API', description: 'RESTful API and WebSocket engine' },
  { id: 'proj-3', name: 'CLI Tool Integration', key: 'CLI', description: 'Native binary helper and shell bindings' },
];

const initialTasks: Task[] = [
  {
    id: 'TF-1',
    projectId: 'proj-1',
    title: 'Desain Command Palette (: / Ctrl+K)',
    description: 'Bentuk modal command palette dengan support auto-complete, keyboard shortcuts, dan command parser.',
    status: 'done',
    priority: 'urgent',
    assignee: 'radit',
    dueDate: '2026-09-21',
    labels: ['frontend', 'ui', 'cli'],
    subtasks: [
      { id: 'st-1', title: 'Setup cmdk listener', completed: true },
      { id: 'st-2', title: 'Integrasi Vim shortcut j/k', completed: true },
      { id: 'st-3', title: 'Parsing parameter #tag @user', completed: true },
    ],
    comments: [
      { id: 'c-1', author: 'radit', content: 'Command palette siap dengan parser 8 command presets.', createdAt: '10:15' }
    ],
    githubPr: {
      number: 42,
      title: 'feat(cli): implement terminal command palette engine',
      url: 'https://github.com/termflow/app/pull/42',
      status: 'merged'
    },
    createdAt: '2026-09-20'
  },
  {
    id: 'TF-2',
    projectId: 'proj-1',
    title: 'Implementasi 8 Preset Tema CLI',
    description: 'Dukungan tema Dracula, Nord, Solarized, Monokai, GitHub Dark/Light, High Contrast dengan CSS variables real-time.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'radit',
    dueDate: '2026-09-22',
    labels: ['theme', 'css'],
    subtasks: [
      { id: 'st-4', title: 'Buat file themes.ts', completed: true },
      { id: 'st-5', title: 'Integrasi font monospace', completed: true },
      { id: 'st-6', title: 'Live preview modal', completed: false }
    ],
    comments: [],
    createdAt: '2026-09-21'
  },
  {
    id: 'TF-3',
    projectId: 'proj-1',
    title: 'Dukungan Dwibahasa (ID / EN)',
    description: 'Toggle internasionalisasi cepat tanpa reload halaman via navbar atau command palette.',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'dev',
    dueDate: '2026-09-23',
    labels: ['i18n'],
    subtasks: [
      { id: 'st-7', title: 'Buat locales id.json dan en.json', completed: true },
      { id: 'st-8', title: 'Refactor semua label teks', completed: false }
    ],
    comments: [],
    createdAt: '2026-09-21'
  },
  {
    id: 'TF-4',
    projectId: 'proj-1',
    title: 'Mode Zen & Timer Pomodoro',
    description: 'Tampilan bersih tanpa distraksi untuk menyelesaikan satu task utama dengan timer 25 menit.',
    status: 'todo',
    priority: 'medium',
    assignee: 'radit',
    dueDate: '2026-09-24',
    labels: ['zen', 'productivity'],
    subtasks: [
      { id: 'st-9', title: 'ZenView component', completed: false },
      { id: 'st-10', title: 'Pomodoro countdown interval', completed: false }
    ],
    comments: [],
    createdAt: '2026-09-21'
  },
  {
    id: 'TF-5',
    projectId: 'proj-1',
    title: 'Export Data (JSON, Markdown, CSV)',
    description: 'Izinkan user mengunduh laporan proyek dalam bentuk file Markdown, JSON, atau spreadsheet CSV.',
    status: 'todo',
    priority: 'low',
    assignee: 'radit',
    dueDate: '2026-09-25',
    labels: ['export', 'data'],
    subtasks: [],
    comments: [],
    createdAt: '2026-09-21'
  }
];

const initialLogs: ActivityLogItem[] = [
  { id: 'log-1', timestamp: '10:45:00', commitHash: 'a8f3b2c', message: 'merged PR #42 (fixes TF-1)', user: 'radit', taskId: 'TF-1' },
  { id: 'log-2', timestamp: '11:12:14', commitHash: 'c9d1e4f', message: 'updated status of TF-2 to IN_PROGRESS', user: 'radit', taskId: 'TF-2' },
  { id: 'log-3', timestamp: '11:30:22', commitHash: 'b4a2c1d', message: 'added subtask to TF-3', user: 'dev', taskId: 'TF-3' },
];

const initialProfile: UserProfile = {
  name: 'Raditya Messi',
  username: 'radit',
  role: 'Core Maintainer / Developer',
  avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
  bio: 'Keyboard-first productivity enthusiast. Building terminal-first web experiences.',
  dailyStreak: 7,
  totalCompleted: 42,
  achievements: [
    { id: 'ach-1', title: 'Terminal Master', description: 'Eksekusi 50+ perintah via command palette', icon: '⌨️', unlockedAt: '2026-09-18' },
    { id: 'ach-2', title: '7-Day Streak', description: 'Aktif mengelola proyek 7 hari berturut-turut', icon: '🔥', unlockedAt: '2026-09-21' },
    { id: 'ach-3', title: 'Task Ninja', description: 'Menyelesaikan 40+ task dengan cepat', icon: '🥷', unlockedAt: '2026-09-20' },
    { id: 'ach-4', title: 'Vim Navigator', description: 'Menggunakan navigasi j/k tanpa mouse', icon: '⚡', unlockedAt: '2026-09-19' },
  ]
};

export const useTermFlowStore = create<TermFlowState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      projects: initialProjects,
      activeProjectId: 'proj-1',
      selectedTaskId: null,
      
      viewMode: 'board',
      themeId: 'dracula',
      lang: 'id',
      searchFilter: '',
      projectNotes: {},
      notes: [],
      ebooks: [
        {
          id: 'eb-1',
          title: 'The Pragmatic Programmer (Summary & Notes)',
          type: 'pdf',
          url: '#',
          fileName: 'pragmatic-programmer-summary.pdf',
          description: 'Catatan penting seputar software craftsmanship dan mindset developer.',
          tags: ['programming', 'craft'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'eb-2',
          title: 'Linux CLI Cheat Sheet & System Commands',
          type: 'link',
          url: 'https://cheat.sh/',
          description: 'Repositori interaktif perintah Linux & tools terminal modern.',
          tags: ['cli', 'linux'],
          createdAt: new Date().toISOString()
        }
      ],
      
      commandHistory: ['theme dracula', 'view board', 'new task "Design UI" #ui'],
      activityLogs: initialLogs,
      focusSessions: [],
      profile: initialProfile,
      password: 'termflow123',
      isAuthenticated: false,
      notificationSettings: { enabled: true, reminderMinutes: 60 },
      glassCustomBg: '#0f172a',
      glassCustomImage: '',
      
      zenTaskId: 'TF-2',
      pomodoroMinutes: 25,
      pomodoroSeconds: 0,
      isPomodoroRunning: false,
      pomodoroMode: 'work',
      focusTaskId: null,
      focusDurationSeconds: 0,
      focusStartedAt: null,

      setThemeId: (themeId) => {
        applyTheme(themeId, get().glassCustomBg, get().glassCustomImage);
        set({ themeId });
      },

      setLang: (lang) => set({ lang }),
      setViewMode: (viewMode) => set({ viewMode }),
      setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
      addProject: (projectData) => {
        const state = get();
        const id = `proj-${Date.now()}`;
        const keyBase = projectData.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'NEW';
        const usedKeys = new Set(state.projects.map((project) => project.key));
        let key = keyBase;
        let suffix = 2;
        while (usedKeys.has(key)) key = `${keyBase.slice(0, 3 - String(suffix).length)}${suffix++}`;
        set({
          projects: [...state.projects, { ...projectData, id, key }],
          activeProjectId: id,
          viewMode: 'board'
        });
        return id;
      },
      setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
      setSearchFilter: (searchFilter) => set({ searchFilter }),
      saveProjectNote: (projectId, note) => set((state) => {
        const existing = Array.isArray(state.projectNotes[projectId]) ? state.projectNotes[projectId] : [];
        const savedNote: ProjectNote = {
          id: note.id || `note-${Date.now()}`,
          name: note.name.trim() || 'Untitled note',
          content: note.content,
          updatedAt: new Date().toISOString()
        };
        return {
          projectNotes: {
            ...state.projectNotes,
            [projectId]: note.id && existing.some((item) => item.id === note.id)
              ? existing.map((item) => item.id === note.id ? savedNote : item)
              : [savedNote, ...existing]
          }
        };
      }),
      deleteProjectNote: (projectId, noteId) => set((state) => ({
        projectNotes: {
          ...state.projectNotes,
          [projectId]: (state.projectNotes[projectId] || []).filter((note) => note.id !== noteId)
        }
      })),
      addNote: (note) => {
        const id = `note-${Date.now()}`;
        const now = new Date().toISOString();
        set((state) => ({
          notes: [{ id, title: note.title.trim() || 'Untitled note', content: note.content || '', tags: note.tags || [], folder: note.folder?.trim() || undefined, createdAt: now, updatedAt: now, lastOpenedAt: now }, ...state.notes]
        }));
        return id;
      },
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, ...updates, title: updates.title?.trim() || note.title, updatedAt: new Date().toISOString() } : note)
      })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
      openNote: (id) => set((state) => ({ notes: state.notes.map((note) => note.id === id ? { ...note, lastOpenedAt: new Date().toISOString() } : note) })),
      addEbook: (item) => {
        const id = `ebook-${Date.now()}`;
        const now = new Date().toISOString();
        const newEbook: EbookSource = { ...item, id, createdAt: now };
        set((state) => ({ ebooks: [newEbook, ...state.ebooks] }));
        return id;
      },
      deleteEbook: (id) => set((state) => ({ ebooks: state.ebooks.filter((eb) => eb.id !== id) })),
      setGlassBackground: (bg, img = '') => set({ glassCustomBg: bg, glassCustomImage: img }),
      updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
      setPassword: (password) => set({ password }),
      login: (password) => {
        const valid = password === get().password;
        if (valid) set({ isAuthenticated: true });
        return valid;
      },
      logout: () => set({ isAuthenticated: false }),
      setNotificationSettings: (settings) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...settings }
      })),
      
      addCommandHistory: (cmd) => {
        set((state) => ({
          commandHistory: [cmd, ...state.commandHistory.slice(0, 19)]
        }));
      },

      addTask: (taskData) => {
        const state = get();
        const targetProjectId = taskData.projectId || state.activeProjectId;
        const id = `${state.projects.find(p => p.id === targetProjectId)?.key || 'TF'}-${state.tasks.length + 1}`;
        const newTask: Task = {
          id,
          projectId: targetProjectId,
          title: taskData.title || 'New Task',
          description: taskData.description || '',
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          energyLevel: taskData.energyLevel || 'medium',
          assignee: taskData.assignee || 'radit',
          startDate: taskData.startDate || new Date().toISOString().slice(0, 10),
          endDate: taskData.endDate || taskData.dueDate || new Date().toISOString().slice(0, 10),
          dueDate: taskData.dueDate || new Date().toISOString().slice(0, 10),
          labels: taskData.labels || [],
          subtasks: taskData.subtasks || [],
          comments: [],
          createdAt: new Date().toISOString().slice(0, 10),
          completedAt: taskData.status === 'done' ? new Date().toISOString() : undefined
        };

        const newLog: ActivityLogItem = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          commitHash: Math.random().toString(36).substring(2, 9),
          message: `created task ${newTask.id}: "${newTask.title}"`,
          user: newTask.assignee,
          taskId: newTask.id
        };

        set({
          tasks: [newTask, ...state.tasks],
          activityLogs: [newLog, ...state.activityLogs]
        });
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const status = updates.status ?? task.status;
            const history = Object.entries(updates).map(([field, value]) => ({
              id: `history-${Date.now()}-${field}`,
              timestamp: new Date().toISOString(),
              user: state.profile.username,
              field,
              before: String(task[field as keyof Task] ?? ''),
              after: String(value ?? '')
            }));
            return {
              ...task,
              ...updates,
              history: [...(task.history || []), ...history],
              completedAt: status === 'done'
                ? task.status === 'done' ? task.completedAt : new Date().toISOString()
                : undefined
            };
          })
        }));
      },

      bulkUpdateTasks: (ids, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => ids.includes(task.id) ? {
            ...task,
            ...updates,
            history: [...(task.history || []), ...Object.entries(updates).map(([field, value]) => ({
              id: `history-${Date.now()}-${task.id}-${field}`,
              timestamp: new Date().toISOString(),
              user: state.profile.username,
              field,
              before: String(task[field as keyof Task] ?? ''),
              after: String(value ?? '')
            }))]
          } : task)
        }));
      },

      bulkDeleteTasks: (ids) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !ids.includes(task.id)),
          selectedTaskId: state.selectedTaskId && ids.includes(state.selectedTaskId) ? null : state.selectedTaskId
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId
        }));
      },

      moveTaskStatus: (id, status) => {
        const state = get();
        const targetTask = state.tasks.find(t => t.id === id);
        if (!targetTask) return;

        const newLog: ActivityLogItem = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          commitHash: Math.random().toString(36).substring(2, 9),
          message: `moved ${id} -> ${status.toUpperCase()}`,
          user: 'radit',
          taskId: id
        };

        // If completed, check total streak/completed
        let updatedProfile = state.profile;
        if (status === 'done' && targetTask.status !== 'done') {
          updatedProfile = {
            ...state.profile,
            totalCompleted: state.profile.totalCompleted + 1
          };
        }

        set({
          tasks: state.tasks.map((t) => (t.id === id ? {
            ...t,
            status,
            completedAt: status === 'done'
              ? t.status === 'done' ? t.completedAt : new Date().toISOString()
              : undefined
          } : t)),
          activityLogs: [newLog, ...state.activityLogs],
          profile: updatedProfile
        });
      },

      purgeExpiredTasks: () => {
        const now = new Date();
        set((state) => {
          const expiredIds = new Set(
            state.tasks
              .filter((task) => {
                if (task.status !== 'done' || !task.completedAt) return false;
                const expiration = new Date(task.completedAt);
                expiration.setHours(24, 0, 0, 0);
                return now >= expiration;
              })
              .map((task) => task.id)
          );
          if (expiredIds.size === 0) return state;
          return {
            tasks: state.tasks.filter((task) => !expiredIds.has(task.id)),
            selectedTaskId: state.selectedTaskId && expiredIds.has(state.selectedTaskId)
              ? null
              : state.selectedTaskId
          };
        });
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const subtasks = t.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            );
            const isChecklistComplete = subtasks.length > 0 && subtasks.every((s) => s.completed);
            return {
              ...t,
              subtasks,
              ...(isChecklistComplete && t.status !== 'done'
                ? { status: 'done' as const, completedAt: new Date().toISOString() }
                : {})
            };
          })
        }));
      },

      addSubtask: (taskId, title) => {
        if (!title.trim()) return;
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: `st-${Date.now()}`, title: title.trim(), completed: false }
              ]
            };
          })
        }));
      },

      addComment: (taskId, content, author = 'radit') => {
        if (!content.trim()) return;
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              comments: [
                ...t.comments,
                {
                  id: `c-${Date.now()}`,
                  author,
                  content: content.trim(),
                  createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            };
          })
        }));
      },

      setZenTask: (zenTaskId) => set({ zenTaskId }),

      startFocus: (taskId, durationMinutes = 25) => {
        const state = get();
        if (!state.tasks.some((task) => task.id === taskId)) return;
        const minutes = durationMinutes === 50 ? 50 : 25;
        set({
          zenTaskId: taskId,
          pomodoroMinutes: minutes,
          pomodoroSeconds: 0,
          pomodoroMode: 'work',
          isPomodoroRunning: true,
          focusTaskId: taskId,
          focusDurationSeconds: minutes * 60,
          focusStartedAt: new Date().toISOString()
        });
      },

      stopFocus: () => {
        const state = get();
        if (!state.focusTaskId || !state.focusStartedAt) return;
        const elapsedSeconds = Math.max(0, state.focusDurationSeconds - (state.pomodoroMinutes * 60 + state.pomodoroSeconds));
        const taskId = state.focusTaskId;
        if (elapsedSeconds < 1) {
          set({ isPomodoroRunning: false, focusTaskId: null, focusStartedAt: null });
          return;
        }
        const session: FocusSession = {
          id: `focus-${Date.now()}`,
          taskId,
          startedAt: state.focusStartedAt,
          endedAt: new Date().toISOString(),
          durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
          completed: state.pomodoroMinutes === 0 && state.pomodoroSeconds === 0
        };
        const task = state.tasks.find((item) => item.id === taskId);
        const log: ActivityLogItem = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          commitHash: Math.random().toString(36).substring(2, 9),
          message: `focus session ${session.durationMinutes}m on ${task?.id || taskId}`,
          user: state.profile.username,
          taskId
        };
        set({
          isPomodoroRunning: false,
          focusTaskId: null,
          focusStartedAt: null,
          focusSessions: [session, ...state.focusSessions],
          activityLogs: [log, ...state.activityLogs]
        });
      },

      togglePomodoro: () => set((state) => ({ isPomodoroRunning: !state.isPomodoroRunning })),

      resetPomodoro: () => set((state) => ({
        pomodoroMinutes: state.pomodoroMode === 'work' ? 25 : 5,
        pomodoroSeconds: 0,
        isPomodoroRunning: false
      })),

      tickPomodoro: () => {
        const state = get();
        if (!state.isPomodoroRunning) return;

        if (state.pomodoroSeconds > 0) {
          set({ pomodoroSeconds: state.pomodoroSeconds - 1 });
        } else if (state.pomodoroMinutes > 0) {
          set({ pomodoroMinutes: state.pomodoroMinutes - 1, pomodoroSeconds: 59 });
        } else {
          // Timer completed
          const nextMode = state.pomodoroMode === 'work' ? 'break' : 'work';
          set({
            pomodoroMode: nextMode,
            pomodoroMinutes: nextMode === 'work' ? 25 : 5,
            pomodoroSeconds: 0,
            isPomodoroRunning: false
          });
          if (state.pomodoroMode === 'work') get().stopFocus();
        }
      }
    }),
    {
      name: 'termflow-storage-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        themeId: state.themeId,
        lang: state.lang,
        commandHistory: state.commandHistory,
        profile: state.profile,
        projectNotes: state.projectNotes,
        notes: state.notes,
        ebooks: state.ebooks,
        password: state.password,
        isAuthenticated: state.isAuthenticated,
        notificationSettings: state.notificationSettings,
        glassCustomBg: state.glassCustomBg,
        glassCustomImage: state.glassCustomImage,
        focusSessions: state.focusSessions
      })
    }
  )
);
