import { create } from "zustand";
import type { Map } from "maplibre-gl";

interface MapStore {
    maps: Record<string, Map>;
    registerMap: (id: string, map: Map) => void;
    unregisterMap: (id: string) => void;
    getMap: (id: string) => Map | undefined;
}

export const useMapStore = create<MapStore>((set, get) => ({
    maps: {},
    registerMap: (id, map) =>
        set((state) => ({
            maps: { ...state.maps, [id]: map },
        })),
    unregisterMap: (id) =>
        set((state) => {
            const newMaps = { ...state.maps };
            delete newMaps[id];
            return { maps: newMaps };
        }),
    getMap: (id) => get().maps[id],
}));
