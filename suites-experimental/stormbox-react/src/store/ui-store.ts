import { create } from 'zustand';

export type AppliedTheme = 'dark' | 'light';
export type AppSpace = 'mail' | 'contacts';

export const DEFAULT_FOLDER_LIST_WIDTH = 240;
export const MESSAGE_COLUMN_MIN_WIDTH = 280;
export const MESSAGE_COLUMN_MAX_WIDTH = 1920;
export const MESSAGE_COLUMN_DEFAULT_WIDTH = 360;
export const MESSAGE_COLUMN_RESIZER_WIDTH = 6;

interface UiState {
  theme: AppliedTheme;
  space: AppSpace;
  quickFilter: string;
  folderListWidth: number;
  messageColumnWidth: number;
  /** Request counter for the quick filter focus shortcut. */
  quickFilterFocusRequest: number;
  setTheme: (theme: AppliedTheme) => void;
  toggleTheme: () => void;
  setSpace: (space: AppSpace) => void;
  setQuickFilter: (value: string) => void;
  setFolderListWidth: (width: number) => void;
  setMessageColumnWidth: (width: number) => void;
  requestQuickFilterFocus: () => void;
}

function initialTheme(): AppliedTheme {
  if (typeof location === 'undefined') return 'dark';
  return new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark';
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: initialTheme(),
  space: 'mail',
  quickFilter: '',
  folderListWidth: DEFAULT_FOLDER_LIST_WIDTH,
  messageColumnWidth: MESSAGE_COLUMN_DEFAULT_WIDTH,
  quickFilterFocusRequest: 0,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  setSpace: (space) => set({ space, quickFilter: '' }),
  setQuickFilter: (quickFilter) => set({ quickFilter }),
  setFolderListWidth: (folderListWidth) => set({ folderListWidth }),
  setMessageColumnWidth: (messageColumnWidth) => set({ messageColumnWidth }),
  requestQuickFilterFocus: () => set({ quickFilterFocusRequest: get().quickFilterFocusRequest + 1 }),
}));
