import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// ─── Auth State ────────────────────────────────────────────────────────────────

export const getCurrentUser = () => supabase.auth.getUser();
export const getCurrentSession = () => supabase.auth.getSession();
export const onAuthStateChange = (callback) => supabase.auth.onAuthStateChange(callback);

export const signOut = async () => {
    await supabase.auth.signOut();
};

export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    if (error) throw error;
};

// ─── Profile ────────────────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) return null;
    return data;
};

export const getProfileByUsername = async (username) => {
    const { data } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username.toLowerCase().trim())
        .maybeSingle();
    return data;
};

export const updateProfile = async ({ userId, username, age }) => {
    const { error } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase().trim(), age })
        .eq('id', userId);
    if (error) {
        if (error.code === '23505') {
            const e = new Error('Username already taken');
            e.code = 'USERNAME_TAKEN';
            throw e;
        }
        throw error;
    }
};

// ─── Streak RPCs ─────────────────────────────────────────────────────────────────

export function isSameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

export function calculateAverageScore(totalScore, startedTrackingOnRaw) {
    if (totalScore == null || !startedTrackingOnRaw) return 0;
    
    const start = new Date(startedTrackingOnRaw + 'T12:00:00Z');
    const today = new Date();
    start.setUTCHours(0,0,0,0);
    today.setUTCHours(0,0,0,0);
    
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const avg = Number(totalScore) / diffDays;
    return Math.round(avg * 10) / 10;
}

export const confirmStreak = async (stats = {}) => {
    const { workout_minutes = 0, steps_walked = 0, study_hours = 0 } = stats;
    const { error } = await supabase.rpc('confirm_streak', {
        p_workout_minutes: workout_minutes,
        p_steps_walked: steps_walked,
        p_study_hours: study_hours
    });
    if (error) throw error;
};

export const resetStreak = async () => {
    const { error } = await supabase.rpc('reset_streak');
    if (error) throw error;
};

export const getTodayLog = async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', today)
        .maybeSingle();
    return data;
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────────

export const getGlobalLeaderboard = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('username, total_score, started_tracking_on')
        .limit(1000);
    if (error) throw error;

    const mapped = (data || []).map((item) => ({
        username: item.username,
        average_score: calculateAverageScore(item.total_score, item.started_tracking_on),
    }));

    mapped.sort((a, b) => b.average_score - a.average_score);
    return mapped.slice(0, 50);
};

// ─── Notifications ───────────────────────────────────────────────────────────────

export const getNotifications = async (userId) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const getUnreadNotificationCount = async (userId) => {
    const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false);
    return data?.length ?? 0;
};

export const markAllNotificationsRead = async (userId) => {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
};

// ─── Rooms ───────────────────────────────────────────────────────────────────────

export const getMyRooms = async () => {
    const { data, error } = await supabase
        .from('user_rooms')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const createRoom = async (name) => {
    const { data, error } = await supabase.rpc('create_room', { p_name: name });
    if (error) throw error;
    return data;
};

export const leaveRoom = async (roomId) => {
    const { error } = await supabase.rpc('leave_room', { p_room_id: roomId });
    if (error) throw error;
};

// ─── Room Members ─────────────────────────────────────────────────────────────────

export const getRoomMembers = async (roomId) => {
    const { data, error } = await supabase
        .from('room_members')
        .select('user_id')
        .eq('room_id', roomId);
    if (error) throw error;
    return data || [];
};

export const removeMember = async (roomId, userId) => {
    const { error } = await supabase.rpc('remove_member', {
        p_room_id: roomId,
        p_user_id: userId,
    });
    if (error) throw error;
};

// ─── Room Leaderboard ─────────────────────────────────────────────────────────────

export const getRoomLeaderboard = async (roomId) => {
    const { data, error } = await supabase
        .from('room_members')
        .select('user_id, profiles(username, total_score, started_tracking_on)')
        .eq('room_id', roomId);
    if (error) throw error;

    const mapped = (data || []).map((item) => ({
        user_id: item.user_id,
        username: item.profiles?.username ?? '',
        average_score: calculateAverageScore(
            item.profiles?.total_score ?? 0,
            item.profiles?.started_tracking_on
        ),
    }));

    mapped.sort((a, b) => (b.average_score ?? 0) - (a.average_score ?? 0));
    return mapped;
};

// ─── Invites ─────────────────────────────────────────────────────────────────────

export const inviteToRoom = async (roomId, userId) => {
    const { error } = await supabase.rpc('invite_to_room', {
        p_room_id: roomId,
        p_user_id: userId,
    });
    if (error) throw error;
};

export const getPendingInvites = async () => {
    const { data, error } = await supabase
        .from('room_invites')
        .select('id, status, rooms(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const acceptRoomInvite = async (inviteId) => {
    const { error } = await supabase.rpc('accept_room_invite', { p_invite_id: inviteId });
    if (error) throw error;
};

export const declineRoomInvite = async (inviteId) => {
    const { error } = await supabase.rpc('decline_room_invite', { p_invite_id: inviteId });
    if (error) throw error;
};

// ─── Realtime ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to room member/leaderboard changes.
 * handlers: { onLeaderboardChange, onMembersChange }
 * Returns the channel (call .unsubscribe() to stop)
 */
export const subscribeToRoom = (roomId, handlers) => {
    const channel = supabase
        .channel(`room-${roomId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${roomId}` },
            () => {
                handlers.onLeaderboardChange?.();
                handlers.onMembersChange?.();
            }
        )
        .subscribe();
    return channel;
};

export const unsubscribeChannel = (channel) => {
    if (channel) supabase.removeChannel(channel);
};
