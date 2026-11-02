import { create } from "zustand";

export type ImmersiveEntityType = "beat" | "track" | "album" | "artist" | "nav" | "cta";

export interface ImmersiveEntity {
  type: ImmersiveEntityType;
  id: string;
  title?: string;
  image?: string;
  color?: string;
  audioUrl?: string;
}

interface ImmersiveStore {
  hoveredEntity?: ImmersiveEntity;
  previewPlaying: boolean;
  previewEnergy: number;
  routePulse: number;
  setHoveredEntity: (entity?: ImmersiveEntity) => void;
  clearHoveredEntity: () => void;
  setPreviewState: (playing: boolean, energy?: number) => void;
  pulseRoute: () => void;
}

export const useImmersiveStore = create<ImmersiveStore>((set) => ({
  hoveredEntity: undefined,
  previewPlaying: false,
  previewEnergy: 0,
  routePulse: 0,
  setHoveredEntity: (entity) => set({ hoveredEntity: entity }),
  clearHoveredEntity: () => set({ hoveredEntity: undefined }),
  setPreviewState: (playing, energy = playing ? 0.8 : 0) =>
    set({ previewPlaying: playing, previewEnergy: energy }),
  pulseRoute: () => set((state) => ({ routePulse: state.routePulse + 1 })),
}));
