import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getGlobalLeaderboard } from '../lib/supabase';
import LeaderTile from '../components/LeaderTile';
import Loader from '../components/Loader';

export default function LeaderboardPage() {
    const navigate = useNavigate();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGlobalLeaderboard()
            .then(setLeaders)
            .finally(() => setLoading(false));
    }, []);

    const top3 = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <div className="page-bg min-h-dvh flex flex-col">
            {/* App Bar */}
            <header className="app-bar">
                <motion.button
                    id="leaderboard-back-btn"
                    className="icon-btn"
                    onClick={() => navigate(-1)}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" style={{ width: 22, height: 22 }}>
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </motion.button>
                <h1 style={{
                    flex: 1, textAlign: 'center',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '0.5px',
                }}>
                    Leaderboard
                </h1>
                <div style={{ width: 40 }} />
            </header>

            <main style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Loader />
                ) : leaders.length === 0 ? (
                    <div className="empty-state page-enter">
                        <span style={{ fontSize: 48 }}>🏅</span>
                        <p>No users yet</p>
                    </div>
                ) : (
                    <div className="page-enter">
                        {/* Podium for top 3 */}
                        {top3.length >= 1 && (
                            <div style={{ padding: '24px 20px 8px' }}>
                                <p className="section-label" style={{ textAlign: 'center', marginBottom: 20 }}>
                                    Top Monks
                                </p>

                                {/* Podium row */}
                                <div style={{
                                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8,
                                    padding: '0 8px',
                                }}>
                                    {/* 2nd place */}
                                    {top3[1] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 22 }}
                                            style={{ flex: 1, textAlign: 'center' }}
                                        >
                                            <div style={{
                                                background: 'rgba(192,192,192,0.1)',
                                                border: '1px solid rgba(192,192,192,0.3)',
                                                borderRadius: '16px 16px 0 0',
                                                padding: '20px 8px 14px',
                                            }}>
                                                <span style={{ fontSize: 28 }}>🥈</span>
                                                <p style={{ color: '#C0C0C0', fontWeight: 700, fontSize: 13, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {top3[1].username}
                                                </p>
                                                <span className="streak-badge" style={{ fontSize: 11, padding: '3px 8px', marginTop: 4, display: 'inline-flex' }}>
                                                    🔥 {top3[1].current_streak}d
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 1st place — tallest */}
                                    {top3[0] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05, type: 'spring', stiffness: 180, damping: 22 }}
                                            style={{ flex: 1.2, textAlign: 'center' }}
                                        >
                                            <div style={{
                                                background: 'rgba(255,215,0,0.1)',
                                                border: '1px solid rgba(255,215,0,0.35)',
                                                borderRadius: '16px 16px 0 0',
                                                padding: '28px 8px 14px',
                                                boxShadow: '0 -4px 30px rgba(255,215,0,0.12)',
                                            }}>
                                                <span style={{ fontSize: 36 }}>🥇</span>
                                                <p style={{ color: '#FFD700', fontWeight: 800, fontSize: 14, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {top3[0].username}
                                                </p>
                                                <span className="streak-badge" style={{ fontSize: 11, padding: '3px 8px', marginTop: 4, display: 'inline-flex' }}>
                                                    🔥 {top3[0].current_streak}d
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 3rd place */}
                                    {top3[2] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 22 }}
                                            style={{ flex: 1, textAlign: 'center' }}
                                        >
                                            <div style={{
                                                background: 'rgba(205,127,50,0.1)',
                                                border: '1px solid rgba(205,127,50,0.3)',
                                                borderRadius: '16px 16px 0 0',
                                                padding: '14px 8px 14px',
                                            }}>
                                                <span style={{ fontSize: 24 }}>🥉</span>
                                                <p style={{ color: '#CD7F32', fontWeight: 700, fontSize: 13, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {top3[2].username}
                                                </p>
                                                <span className="streak-badge" style={{ fontSize: 11, padding: '3px 8px', marginTop: 4, display: 'inline-flex' }}>
                                                    🔥 {top3[2].current_streak}d
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Podium base */}
                                <div style={{
                                    height: 8,
                                    background: 'linear-gradient(90deg, rgba(192,192,192,0.15), rgba(255,215,0,0.2), rgba(205,127,50,0.15))',
                                    borderRadius: '0 0 4px 4px',
                                    marginBottom: 24,
                                }} />
                            </div>
                        )}

                        {/* Rest of the list */}
                        {rest.length > 0 && (
                            <div className="content-wrap" style={{ paddingBottom: 40 }}>
                                <p className="section-label" style={{ marginBottom: 12 }}>
                                    Rankings
                                </p>
                                {rest.map((u, i) => (
                                    <LeaderTile
                                        key={u.username + i}
                                        user={u}
                                        index={i + 3}
                                        animDelay={i * 0.04}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
