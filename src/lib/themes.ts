export type ThemeId = 
  | 'github-dark' 
  | 'github-light' 
  | 'dracula' 
  | 'nord' 
  | 'solarized' 
  | 'monokai' 
  | 'dimmed' 
  | 'high-contrast';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  isDark: boolean;
  styles: Record<string, string>;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark',
    isDark: true,
    styles: {
      '--bg-app': '#0d1117',
      '--bg-surface': '#161b22',
      '--bg-muted': '#21262d',
      '--text-main': '#c9d1d9',
      '--text-muted': '#8b949e',
      '--text-bright': '#f0f6fc',
      '--border-main': '#30363d',
      '--accent-main': '#238636',
      '--accent-hover': '#2ea043',
      '--accent-cyan': '#58a6ff',
      '--accent-purple': '#bc8cff',
      '--accent-yellow': '#d29922',
      '--accent-red': '#f85149',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  },
  'github-light': {
    id: 'github-light',
    name: 'GitHub Light',
    isDark: false,
    styles: {
      '--bg-app': '#f6f8fa',
      '--bg-surface': '#ffffff',
      '--bg-muted': '#f3f4f6',
      '--text-main': '#24292f',
      '--text-muted': '#57606a',
      '--text-bright': '#000000',
      '--border-main': '#d0d7de',
      '--accent-main': '#1f883d',
      '--accent-hover': '#1a7f37',
      '--accent-cyan': '#0969da',
      '--accent-purple': '#8250df',
      '--accent-yellow': '#9a6700',
      '--accent-red': '#cf222e',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula',
    isDark: true,
    styles: {
      '--bg-app': '#282a36',
      '--bg-surface': '#44475a',
      '--bg-muted': '#343746',
      '--text-main': '#f8f8f2',
      '--text-muted': '#6272a4',
      '--text-bright': '#ffffff',
      '--border-main': '#6272a4',
      '--accent-main': '#50fa7b',
      '--accent-hover': '#69ff94',
      '--accent-cyan': '#8be9fd',
      '--accent-purple': '#bd93f9',
      '--accent-yellow': '#f1fa8c',
      '--accent-red': '#ff5555',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  },
  'nord': {
    id: 'nord',
    name: 'Nord',
    isDark: true,
    styles: {
      '--bg-app': '#2e3440',
      '--bg-surface': '#3b4252',
      '--bg-muted': '#434c5e',
      '--text-main': '#d8dee9',
      '--text-muted': '#e5e9f0',
      '--text-bright': '#eceff4',
      '--border-main': '#4c566a',
      '--accent-main': '#a3be8c',
      '--accent-hover': '#b4d09d',
      '--accent-cyan': '#88c0d0',
      '--accent-purple': '#b48ead',
      '--accent-yellow': '#ebcb8b',
      '--accent-red': '#bf616a',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  },
  'solarized': {
    id: 'solarized',
    name: 'Solarized Dark',
    isDark: true,
    styles: {
      '--bg-app': '#002b36',
      '--bg-surface': '#073642',
      '--bg-muted': '#094352',
      '--text-main': '#839496',
      '--text-muted': '#586e75',
      '--text-bright': '#93a1a1',
      '--border-main': '#586e75',
      '--accent-main': '#859900',
      '--accent-hover': '#98ad0e',
      '--accent-cyan': '#2aa198',
      '--accent-purple': '#6c71c4',
      '--accent-yellow': '#b58900',
      '--accent-red': '#dc322f',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  },
  'monokai': {
    id: 'monokai',
    name: 'Monokai Pro',
    isDark: true,
    styles: {
      '--bg-app': '#2d2a2e',
      '--bg-surface': '#403e41',
      '--bg-muted': '#5b585c',
      '--text-main': '#fcfcfa',
      '--text-muted': '#939293',
      '--text-bright': '#ffffff',
      '--border-main': '#727072',
      '--accent-main': '#a9dc76',
      '--accent-hover': '#b8eb85',
      '--accent-cyan': '#78dce8',
      '--accent-purple': '#ab9df2',
      '--accent-yellow': '#ffd866',
      '--accent-red': '#ff6188',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  },
  'dimmed': {
    id: 'dimmed',
    name: 'Dimmed Dark',
    isDark: true,
    styles: {
      '--bg-app': '#1c2128',
      '--bg-surface': '#22272e',
      '--bg-muted': '#2d333b',
      '--text-main': '#adbac7',
      '--text-muted': '#768390',
      '--text-bright': '#cdd9e5',
      '--border-main': '#444c56',
      '--accent-main': '#347d39',
      '--accent-hover': '#46954a',
      '--accent-cyan': '#539bf5',
      '--accent-purple': '#b87fff',
      '--accent-yellow': '#c69026',
      '--accent-red': '#e5534b',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    isDark: true,
    styles: {
      '--bg-app': '#000000',
      '--bg-surface': '#0a0a0a',
      '--bg-muted': '#1f1f1f',
      '--text-main': '#ffffff',
      '--text-muted': '#a0a0a0',
      '--text-bright': '#ffffff',
      '--border-main': '#ffffff',
      '--accent-main': '#00ff66',
      '--accent-hover': '#33ff85',
      '--accent-cyan': '#00ffff',
      '--accent-purple': '#ff00ff',
      '--accent-yellow': '#ffff00',
      '--accent-red': '#ff0000',
      '--font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }
  }
};

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId] || THEMES['github-dark'];
  const root = document.documentElement;

  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  Object.entries(theme.styles).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
  });
}

