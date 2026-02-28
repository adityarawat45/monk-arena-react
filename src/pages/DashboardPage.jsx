import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '../stores/useUserStore';
import {
    confirmStreak, resetStreak, getTodayLog, signOut,
} from '../lib/supabase';

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay } },
});

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, profile, unreadCount, refreshProfile } = useUserStore();

    const [showAppMenu, setShowAppMenu] = useState(false);

    const [pageLoading, setPageLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [effectiveStreak, setEffectiveStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [confirmEnabled, setConfirmEnabled] = useState(true);
    const [resetEnabled, setResetEnabled] = useState(true);

    const loadData = async () => {
        if (!user) return;
        const todayLog = await getTodayLog(user.id);
        await refreshProfile();
        const p = useUserStore.getState().profile;
        if (!p) return;

        const currentStreak = p.current_streak ?? 0;
        const longest = p.longest_streak ?? 0;
        const lastDateRaw = p.last_confirmation_date;
        const lastDate = lastDateRaw ? new Date(lastDateRaw) : null;

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let effective = 0, status = '', cEnabled = true, rEnabled = true;

        if (todayLog?.status === 'relapsed') {
            effective = 0; status = 'Come back stronger tomorrow.';
            cEnabled = false; rEnabled = false;
        } else if (todayLog?.status === 'confirmed') {
            effective = currentStreak; status = 'Streak confirmed today.';
            cEnabled = false; rEnabled = true;
        } else {
            if (!lastDate) {
                effective = 0; status = 'Start your first streak.';
            } else if (isSameDay(lastDate, yesterday)) {
                effective = currentStreak; status = 'Confirm today to keep the streak alive.';
            } else if (isSameDay(lastDate, today)) {
                effective = currentStreak; status = 'Streak active today.';
                cEnabled = false;
            } else {
                effective = 0; status = 'Streak broken. Confirm to restart.';
            }
        }

        setEffectiveStreak(effective);
        setLongestStreak(longest);
        setStatusMessage(status);
        setConfirmEnabled(cEnabled);
        setResetEnabled(rEnabled);
        setPageLoading(false);
    };

    useEffect(() => { loadData(); }, [user]);

    const handleConfirm = async () => {
        setProcessing(true);
        await confirmStreak();
        await loadData();
        setProcessing(false);
    };
    const handleReset = async () => {
        setProcessing(true);
        await resetStreak();
        await loadData();
        setProcessing(false);
    };

    if (pageLoading) {
        return (
            <div className="page-bg flex items-center justify-center min-h-dvh">
                <div className="spinner" />
            </div>
        );
    }

    // Circle size: responsive between 180-240px
    const circleSize = 'clamp(180px, 48vw, 240px)';

    return (
        <div className="page-bg min-h-dvh flex flex-col">
            {/* ── App Bar ── */}
            <header className="app-bar">
                <div className="app-left-spacer" style={{ width: 40 }} />
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                        textAlign: 'center',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800, fontSize: 20,
                        letterSpacing: '0.8px', color: '#fff', zIndex: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                >
                    Monk Arena
                </motion.h1>

                <div className="app-actions" style={{ marginLeft: 'auto', alignItems: 'center', gap: 8 }}>
                    <button
                        id="notifications-btn"
                        className="icon-btn"
                        style={{ position: 'relative' }}
                        onClick={() => navigate('/notifications')}
                        aria-label="Notifications"
                    >
                        <svg viewBox="0 0 24 24" fill="#FBBF24" style={{ width: 22, height: 22 }}>
                            <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                        </svg>
                        <AnimatePresence>
                            {unreadCount > 0 && (
                                <motion.span
                                    key="badge"
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                    className="notif-dot"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    <button
                        id="signout-btn"
                        className="icon-btn"
                        onClick={() => signOut()}
                        aria-label="Sign out"
                    >
                        <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" style={{ width: 21, height: 21 }}>
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4C2.9 3 2 3.9 2 5v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                    </button>
                </div>

                {/* Compact 'more' menu for small screens */}
                <div tabIndex={0} className="app-more-wrap" style={{ position: 'relative' }} onBlur={() => setShowAppMenu(false)}>
                    <button
                        id="appbar-more-btn"
                        className="icon-btn app-more-btn"
                        onClick={() => setShowAppMenu((s) => !s)}
                        aria-label="More"
                    >
                        <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" style={{ width: 20, height: 20 }}>
                            <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                    {showAppMenu && (
                        <div className="appbar-dropdown" role="menu">
                            <button onMouseDown={(e) => { e.preventDefault(); setShowAppMenu(false); navigate('/notifications'); }} aria-label="Notifications">Notifications</button>
                            <button onMouseDown={(e) => { e.preventDefault(); setShowAppMenu(false); signOut(); }} aria-label="Sign out">Sign out</button>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Body ── */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <div
                    className="content-wrap"
                    style={{ paddingTop: 28, paddingBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}
                >
                    {/* Username */}
                    <motion.p
                        variants={fadeUp(0)} initial="hidden" animate="show"
                        style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 500 }}
                    >
                        @{profile?.username ?? ''}
                    </motion.p>

                    {/* Logo */}
                    <motion.img
                        variants={fadeUp(0.05)} initial="hidden" animate="show"
                        src="/transparentlogo.png" alt="Monk Arena"
                        style={{ height: 52, objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }}
                    />

                    {/* Streak Circle */}
                    <motion.div
                        variants={fadeUp(0.1)} initial="hidden" animate="show"
                        className="streak-circle"
                        style={{ width: circleSize, height: circleSize }}
                        aria-label={`Current streak: ${effectiveStreak} days`}
                    >
                        <motion.span
                            key={effectiveStreak}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 900,
                                fontSize: 'clamp(52px, 14vw, 72px)',
                                color: '#fff',
                                lineHeight: 1,
                            }}
                        >
                            {effectiveStreak}
                        </motion.span>
                        <span
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                color: 'rgba(255,255,255,0.5)',
                                letterSpacing: '3px', fontSize: 12,
                                fontWeight: 600, marginTop: 6,
                            }}
                        >
                            DAYS
                        </span>
                    </motion.div>

                    {/* Status */}
                    <motion.p
                        key={statusMessage}
                        variants={fadeUp(0.15)} initial="hidden" animate="show"
                        style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}
                    >
                        {statusMessage}
                    </motion.p>

                    {/* Longest streak pill */}
                    <motion.div variants={fadeUp(0.18)} initial="hidden" animate="show">
                        <span style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 999, padding: '6px 16px',
                            fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500,
                        }}>
                            Best: {longestStreak} days
                        </span>
                    </motion.div>

                    {/* ── Action Buttons ── */}
                    <motion.div
                        variants={fadeUp(0.22)} initial="hidden" animate="show"
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
                    >
                        {/* Confirm */}
                        <motion.button
                            id="confirm-streak-btn"
                            className="btn btn-primary"
                            onClick={handleConfirm}
                            disabled={!confirmEnabled || processing}
                            whileHover={{ scale: confirmEnabled ? 1.01 : 1 }}
                            whileTap={{ scale: confirmEnabled ? 0.98 : 1 }}
                            aria-label="Confirm today"
                        >
                            {processing
                                ? <div className="spinner spinner-sm spinner-dark" />
                                : <><span>✓</span> Confirm Today</>
                            }
                        </motion.button>

                        {/* Relapse */}
                        <motion.button
                            id="relapse-btn"
                            className="btn btn-relapse"
                            onClick={handleReset}
                            disabled={!resetEnabled || processing}
                            whileHover={{ scale: resetEnabled ? 1.01 : 1 }}
                            whileTap={{ scale: resetEnabled ? 0.98 : 1 }}
                            aria-label="I relapsed"
                        >
                            I Relapsed
                        </motion.button>
                    </motion.div>

                    {/* ── Nav Cards ── */}
                    <motion.div
                        variants={fadeUp(0.28)} initial="hidden" animate="show"
                        style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
                    >
                        {[
                            { id: 'leaderboard-btn', label: 'Leaderboard', icon: '', path: '/leaderboard' },
                            { id: 'rooms-btn', label: 'Private Rooms', icon: '', path: '/rooms' },
                        ].map(({ id, label, icon, path }) => (
                            <motion.button
                                key={id}
                                id={id}
                                className="glass-card btn-ghost"
                                style={{ height: 72, flexDirection: 'column', gap: 6, borderRadius: 16 }}
                                onClick={() => navigate(path)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                aria-label={label}
                            >

                                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
