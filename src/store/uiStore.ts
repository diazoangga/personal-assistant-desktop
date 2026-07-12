import { create } from 'zustand';

export type SelectedEntity =
  | { type: 'interest'; label: string }
  | { type: 'node'; id: string; label: string; category: string }
  | null;

export type CanvasMode = 'dashboard' | 'chat' | 'graph';

interface UIState {
  selectedEntity: SelectedEntity;
  selectEntity: (entity: SelectedEntity) => void;

  activeSessionId: string | null;
  canvasMode: CanvasMode;
  openSession: (id: string | null) => void;
  closeSession: () => void;
  showGraph: () => void;

  researchLauncherOpen: boolean;
  openResearchLauncher: () => void;
  closeResearchLauncher: () => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;

  contextPanelOpen: boolean;
  toggleContextPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedEntity: null,
  selectEntity: (entity) => set({ selectedEntity: entity }),

  activeSessionId: null,
  canvasMode: 'dashboard',
  openSession: (id) => set({ activeSessionId: id, canvasMode: 'chat' }),
  closeSession: () => set({ activeSessionId: null, canvasMode: 'dashboard' }),
  showGraph: () => set({ canvasMode: 'graph', activeSessionId: null }),

  researchLauncherOpen: false,
  openResearchLauncher: () => set({ researchLauncherOpen: true }),
  closeResearchLauncher: () => set({ researchLauncherOpen: false }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  contextPanelOpen: true,
  toggleContextPanel: () => set((s) => ({ contextPanelOpen: !s.contextPanelOpen })),
}));
