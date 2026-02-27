import { create } from 'zustand';
import { getMyRooms, createRoom as apiCreateRoom } from '../lib/supabase';

const useRoomsStore = create((set, get) => ({
    rooms: [],
    loading: false,
    error: null,

    loadRooms: async () => {
        set({ loading: true, error: null });
        try {
            const rooms = await getMyRooms();
            set({ rooms, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    createRoom: async (name) => {
        await apiCreateRoom(name);
        await get().loadRooms();
    },
}));

export default useRoomsStore;
