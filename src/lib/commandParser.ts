import { ThemeId } from './themes';
import { ViewMode } from './store';

export interface ParsedNewTask {
  type: 'new_task';
  title: string;
  labels: string[];
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ParsedThemeChange {
  type: 'theme_change';
  themeId: ThemeId;
}

export interface ParsedViewChange {
  type: 'view_change';
  view: ViewMode;
}

export interface ParsedLangChange {
  type: 'lang_change';
  lang: 'id' | 'en';
}

export interface ParsedFilter {
  type: 'filter';
  query: string;
}

export interface ParsedExport {
  type: 'export';
  format: 'json' | 'md' | 'csv';
}

export type ParsedCommand = 
  | ParsedNewTask 
  | ParsedThemeChange 
  | ParsedViewChange 
  | ParsedLangChange 
  | ParsedFilter
  | ParsedExport;

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim().replace(/^>\s*/, '');
  if (!trimmed) return null;

  // Pattern: new task "Title" #label1 #label2 @assignee due:2026-09-25 priority:high
  if (trimmed.startsWith('new task') || trimmed.startsWith('add task') || trimmed.startsWith('task new')) {
    const rest = trimmed.replace(/^(new task|add task|task new)\s*/, '');
    
    // Extract title in quotes or default rest
    let title = '';
    const titleMatch = rest.match(/^"([^"]+)"|^'([^']+)'/);
    if (titleMatch) {
      title = titleMatch[1] || titleMatch[2];
    } else {
      // First word or unquoted text up to hashtags or @
      const firstArg = rest.split(/ [#@]| due:| priority:/)[0];
      title = firstArg || 'New Task';
    }

    // Extract hashtags (#bug, #frontend)
    const labels = Array.from(rest.matchAll(/#([\w-]+)/g)).map(m => m[1]);

    // Extract assignee (@radit)
    const assigneeMatch = rest.match(/@([\w-]+)/);
    const assignee = assigneeMatch ? assigneeMatch[1] : undefined;

    // Extract due date (due:tomorrow, due:2026-09-25)
    const dueMatch = rest.match(/due:([\w-]+)/);
    let dueDate: string | undefined = undefined;
    if (dueMatch) {
      const val = dueMatch[1];
      if (val === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        dueDate = d.toISOString().slice(0, 10);
      } else if (val === 'today') {
        dueDate = new Date().toISOString().slice(0, 10);
      } else {
        dueDate = val;
      }
    }

    // Extract priority (priority:high, priority:urgent)
    const priorityMatch = rest.match(/priority:(low|medium|high|urgent)/);
    const priority = priorityMatch ? (priorityMatch[1] as ParsedNewTask['priority']) : 'medium';

    return {
      type: 'new_task',
      title,
      labels,
      assignee,
      dueDate,
      priority
    };
  }

  // Pattern: theme dracula
  if (trimmed.startsWith('theme')) {
    const themeStr = trimmed.replace(/^theme\s*/, '').toLowerCase();
    const validThemes: ThemeId[] = ['github-dark', 'github-light', 'dracula', 'nord', 'solarized', 'monokai', 'dimmed', 'high-contrast'];
    const matched = validThemes.find(t => t.includes(themeStr) || t.replace('-', '') === themeStr);
    if (matched) {
      return { type: 'theme_change', themeId: matched };
    }
  }

  // Pattern: view board | list | grid | timeline | zen | profile
  // or goto profile | dashboard
  if (trimmed.startsWith('view') || trimmed.startsWith('goto')) {
    const viewStr = trimmed.replace(/^(view|goto)\s*/, '').toLowerCase();
    if (viewStr === 'board' || viewStr === 'kanban') return { type: 'view_change', view: 'board' };
    if (viewStr === 'list') return { type: 'view_change', view: 'list' };
    if (viewStr === 'grid' || viewStr === 'table') return { type: 'view_change', view: 'grid' };
    if (viewStr === 'timeline' || viewStr === 'gantt') return { type: 'view_change', view: 'timeline' };
    if (viewStr === 'zen' || viewStr === 'focus') return { type: 'view_change', view: 'zen' };
    if (viewStr === 'profile' || viewStr === 'me') return { type: 'view_change', view: 'profile' };
    if (viewStr === 'dashboard' || viewStr === 'home') return { type: 'view_change', view: 'board' };
  }

  // Pattern: lang id | en
  if (trimmed.startsWith('lang') || trimmed.startsWith('language')) {
    const langStr = trimmed.replace(/^(lang|language)\s*/, '').toLowerCase();
    if (langStr.includes('id') || langStr.includes('indo')) return { type: 'lang_change', lang: 'id' };
    if (langStr.includes('en') || langStr.includes('eng')) return { type: 'lang_change', lang: 'en' };
  }

  // Pattern: filter status:done assignee:me
  if (trimmed.startsWith('filter') || trimmed.startsWith('search')) {
    const filterQuery = trimmed.replace(/^(filter|search)\s*/, '');
    return { type: 'filter', query: filterQuery };
  }

  // Pattern: export json | md | csv
  if (trimmed.startsWith('export')) {
    const fmt = trimmed.replace(/^export\s*/, '').toLowerCase();
    if (fmt === 'json') return { type: 'export', format: 'json' };
    if (fmt === 'md' || fmt === 'markdown') return { type: 'export', format: 'md' };
    if (fmt === 'csv') return { type: 'export', format: 'csv' };
  }

  return null;
}
