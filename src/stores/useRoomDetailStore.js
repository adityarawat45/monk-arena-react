import { create } from 'zustand';
import {
    getRoomLeaderboard,
    getRoomMembers,
    subscribeToRoom,
    unsubscribeChannel,
} from '../lib/supabase';

const useRoomDetailStore = create((set, get) => ({
    roomId: null,
    leaderboard: [],
    members: [],
    loading: false,
    error: null,
    channel: null,

    loadLeaderboard: async (roomId) => {
        set({ loading: true, error: null });
        try {
            const leaderboard = await getRoomLeaderboard(roomId);
            set({ leaderboard, roomId, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    refreshLeaderboard: async () => {
        const { roomId } = get();
        if (!roomId) return;
        try {
            const leaderboard = await getRoomLeaderboard(roomId);
            set({ leaderboard });
        } catch { /* silent */ }
    },

    loadMembers: async (roomId) => {
        try {
            const members = await getRoomMembers(roomId);
            set({ members });
        } catch { /* silent */ }
    },

    subscribe: (roomId) => {
        const { channel: existing } = get();
        if (existing) unsubscribeChannel(existing);

        const channel = subscribeToRoom(roomId, {
            onLeaderboardChange: () => get().refreshLeaderboard(),
            onMembersChange: () => get().loadMembers(roomId),
        });
        set({ channel });
    },

    unsubscribe: () => {
        const { channel } = get();
        if (channel) unsubscribeChannel(channel);
        set({ channel: null });
    },

    reset: () => {
        get().unsubscribe();
        set({ roomId: null, leaderboard: [], members: [], loading: false, error: null });
    },
}));

export default useRoomDetailStore;
