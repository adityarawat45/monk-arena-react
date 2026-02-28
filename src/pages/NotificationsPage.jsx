import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getPendingInvites, acceptRoomInvite, declineRoomInvite, markAllNotificationsRead,
} from '../lib/supabase';
import useUserStore from '../stores/useUserStore';
import Loader from '../components/Loader';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { user, refreshProfile } = useUserStore();

    const [loading, setLoading] = useState(true);
    const [invites, setInvites] = useState([]);
    const [processingId, setProcessingId] = useState(null);

    const initialize = async () => {
        if (user) await markAllNotificationsRead(user.id);
        const data = await getPendingInvites();
        setInvites(data);
        setLoading(false);
        refreshProfile();
    };

    useEffect(() => { initialize(); }, []);

    const reload = async () => {
        const data = await getPendingInvites();
        setInvites(data);
        setProcessingId(null);
    };

    const handleAccept = async (id) => {
        setProcessingId(id);
        await acceptRoomInvite(id);
        await reload();
    };

    const handleDecline = async (id) => {
        setProcessingId(id);
        await declineRoomInvite(id);
        await reload();
    };

    const getRoomName = (invite) => invite?.rooms?.name ?? 'Unknown Room';

    return (
        <div className="page-bg min-h-dvh flex flex-col">
            {/* App Bar */}
            <header className="app-bar">
                <motion.button
                    id="notifications-back-btn"
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
                    fontWeight: 700, fontSize: 18, color: '#fff',
                }}>
                    Invitations
                </h1>
                <div style={{ width: 40 }} />
            </header>

            {/* Body */}
            <main style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Loader />
                ) : invites.length === 0 ? (
                    <div className="empty-state page-enter">
                        <p style={{ fontSize: 14, fontWeight: 500 }}>No pending invites</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                            You're all caught up
                        </p>
                    </div>
                ) : (
                    <div className="content-wrap page-enter" style={{ paddingTop: 16, paddingBottom: 32 }}>
                        <p className="section-label" style={{ marginBottom: 12 }}>
                            Pending ({invites.length})
                        </p>

                        <AnimatePresence>
                            {invites.map((invite, i) => {
                                const isProcessing = processingId === invite.id;
                                return (
                                    <motion.div
                                        key={invite.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                                        transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.09)',
                                            borderRadius: 18,
                                            padding: 20,
                                            marginBottom: 12,
                                            backdropFilter: 'blur(12px)',
                                        }}
                                    >
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                                background: 'rgba(255,255,255,0.07)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" style={{ width: 20, height: 20 }}>
                                                    <path d="M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zm5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                                </svg>
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <p style={{
                                                    color: '#fff', fontWeight: 600, fontSize: 15,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {getRoomName(invite)}
                                                </p>
                                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                                                    Private room invitation
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <motion.button
                                                id={`accept-invite-${invite.id}`}
                                                className="btn btn-accept"
                                                style={{ flex: 1 }}
                                                onClick={() => handleAccept(invite.id)}
                                                disabled={isProcessing}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.97 }}
                                                aria-label={`Accept invite to ${getRoomName(invite)}`}
                                            >
                                                {isProcessing
                                                    ? <div className="spinner spinner-sm" style={{ borderTopColor: '#000' }} />
                                                    : '✓ Accept'}
                                            </motion.button>

                                            <motion.button
                                                id={`decline-invite-${invite.id}`}
                                                className="btn"
                                                style={{
                                                    flex: 1, height: 44,
                                                    background: 'transparent',
                                                    border: '1px solid rgba(239,68,68,0.35)',
                                                    color: '#f87171',
                                                    fontSize: 14, fontWeight: 600,
                                                    borderRadius: 14,
                                                }}
                                                onClick={() => handleDecline(invite.id)}
                                                disabled={isProcessing}
                                                whileHover={{ background: 'rgba(239,68,68,0.08)' }}
                                                whileTap={{ scale: 0.97 }}
                                                aria-label={`Decline invite to ${getRoomName(invite)}`}
                                            >
                                                Decline
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
