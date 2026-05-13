import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '../stores/useUserStore';
import {
    confirmStreak, getTodayLog, signOut, calculateAverageScore
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

    const [averageScore, setAverageScore] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [confirmEnabled, setConfirmEnabled] = useState(true);

    // Habit Tracking State
    const [workoutEnabled, setWorkoutEnabled] = useState(false);
    const [workoutMinutes, setWorkoutMinutes] = useState(30);
    const [stepsWalked, setStepsWalked] = useState(5000);
    const [studyHours, setStudyHours] = useState(2);

    const loadData = async () => {
        if (!user) return;
        const todayLog = await getTodayLog(user.id);
        await refreshProfile();
        const p = useUserStore.getState().profile;
        if (!p) return;

        const avgScore = calculateAverageScore(p.total_score, p.started_tracking_on);
        
        let status = '', cEnabled = true;

        if (todayLog?.status === 'confirmed') {
            status = 'Habits logged for today!';
            cEnabled = false;
        } else {
            status = 'Log your habits to boost your score.';
        }

        setAverageScore(avgScore);
        setStatusMessage(status);
        setConfirmEnabled(cEnabled);
        
        // Load existing habit data if present
        if (todayLog) {
            if (todayLog.workout_minutes > 0) {
                setWorkoutEnabled(true);
                setWorkoutMinutes(todayLog.workout_minutes);
            }
            if (todayLog.steps_walked != null) setStepsWalked(todayLog.steps_walked);
            if (todayLog.study_hours != null) setStudyHours(todayLog.study_hours);
        }

        setPageLoading(false);
    };

    useEffect(() => { loadData(); }, [user]);

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            await confirmStreak({
                workout_minutes: workoutEnabled ? Number(workoutMinutes) : 0,
                steps_walked: Number(stepsWalked),
                study_hours: Number(studyHours)
            });
            await loadData();
        } catch (err) {
            console.error('Error confirming streak:', err);
            alert(`Supabase Error: ${err.message || JSON.stringify(err)}\n\nPlease ensure you successfully ran the SQL query.`);
        } finally {
            setProcessing(false);
        }
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
                        style={{ height: 'clamp(96px, 16vw, 140px)', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }}
                    />

                    {/* Streak Circle */}
                    <motion.div
                        variants={fadeUp(0.1)} initial="hidden" animate="show"
                        className="streak-circle"
                        style={{ width: circleSize, height: circleSize }}
                        aria-label={`Average score: ${averageScore} pts`}
                    >
                        <motion.span
                            key={averageScore}
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
                            {averageScore}
                        </motion.span>
                        <span
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                color: 'rgba(255,255,255,0.5)',
                                letterSpacing: '3px', fontSize: 12,
                                fontWeight: 600, marginTop: 6,
                            }}
                        >
                            PTS / DAY
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

                    {/* Longest streak (moved to footer) */}

                    {/* ── Action Buttons & Habit Tracker ── */}
                    <motion.div
                        variants={fadeUp(0.22)} initial="hidden" animate="show"
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                        {confirmEnabled && (
                            <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, borderRadius: 20, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>Daily Student Log</h3>
                                </div>
                                
                                {/* Workout */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Did you workout?</label>
                                        <button 
                                            onClick={() => setWorkoutEnabled(!workoutEnabled)}
                                            style={{ 
                                                width: 44, height: 24, borderRadius: 12, 
                                                background: workoutEnabled ? '#10B981' : 'rgba(255,255,255,0.1)',
                                                position: 'relative', transition: 'background 0.3s', cursor: 'pointer'
                                            }}
                                        >
                                            <motion.div 
                                                animate={{ x: workoutEnabled ? 20 : 2 }}
                                                style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2 }}
                                            />
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {workoutEnabled && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '8px 12px', marginTop: 8 }}>
                                                    <span style={{ color: '#fff', fontSize: 13 }}>Minutes</span>
                                                    <input type="number" min="0" value={workoutMinutes} onChange={(e) => setWorkoutMinutes(e.target.value)} style={{ background: 'transparent', color: '#10B981', fontWeight: 'bold', fontSize: 16, textAlign: 'right', width: 60, outline: 'none' }} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Study */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Study Hours</span>
                                        <span style={{ color: '#3B82F6', fontWeight: 600 }}>{studyHours}h</span>
                                    </label>
                                    <input type="range" min="0" max="16" step="0.5" value={studyHours} onChange={(e) => setStudyHours(e.target.value)} style={{ accentColor: '#3B82F6', cursor: 'pointer' }} />
                                </div>

                                {/* Steps */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Steps Walked</span>
                                        <span style={{ color: '#F59E0B', fontWeight: 600 }}>{stepsWalked}</span>
                                    </label>
                                    <input type="range" min="0" max="30000" step="500" value={stepsWalked} onChange={(e) => setStepsWalked(e.target.value)} style={{ accentColor: '#F59E0B', cursor: 'pointer' }} />
                                </div>
                            </div>
                        )}

                        {/* Confirm */}
                        <motion.button
                            id="confirm-streak-btn"
                            className="btn btn-primary"
                            onClick={handleConfirm}
                            disabled={!confirmEnabled || processing}
                            whileHover={{ scale: confirmEnabled ? 1.01 : 1 }}
                            whileTap={{ scale: confirmEnabled ? 0.98 : 1 }}
                            aria-label="Log Habits & Confirm"
                        >
                            {processing
                                ? <div className="spinner spinner-sm spinner-dark" />
                                : <><span>✓</span> {confirmEnabled ? 'Log Habits & Confirm' : 'Confirmed Today'}</>
                            }
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

                                <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            </main>

        </div>
    );
}
