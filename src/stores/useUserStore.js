import { create } from 'zustand';
import { supabase, getProfile, getUnreadNotificationCount } from '../lib/supabase';

const useUserStore = create((set, get) => ({
    user: null,
    profile: null,
    session: null,
    loading: true,
    unreadCount: 0,

    setSession: (session) => set({ session, user: session?.user ?? null }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),
    setUnreadCount: (unreadCount) => set({ unreadCount }),

    /** Called once on app boot – subscribes to auth changes */
    initAuth: () => {
        // Get current session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ session, user: session?.user ?? null });
            if (session?.user) {
                get().loadProfile(session.user.id);
            } else {
                set({ loading: false });
            }
        });

        // Subscribe to future auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null });
            if (session?.user) {
                get().loadProfile(session.user.id);
            } else {
                set({ profile: null, loading: false });
            }
        });

        return () => subscription.unsubscribe();
    },

    loadProfile: async (userId) => {
        set({ loading: true });
        try {
            const profile = await getProfile(userId);
            const unread = await getUnreadNotificationCount(userId);
            set({ profile, unreadCount: unread, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        const profile = await getProfile(user.id);
        const unread = await getUnreadNotificationCount(user.id);
        set({ profile, unreadCount: unread });
    },
}));

export default useUserStore;
