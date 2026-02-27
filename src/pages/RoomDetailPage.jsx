import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useRoomDetailStore from '../stores/useRoomDetailStore';
import useUserStore from '../stores/useUserStore';
import { leaveRoom } from '../lib/supabase';
import LeaderTile from '../components/LeaderTile';
import InviteDialog from '../components/InviteDialog';
import MemberActionsSheet from '../components/MemberActionsSheet';
import Loader from '../components/Loader';

export default function RoomDetailPage() {
    const { roomId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const roomName = state?.roomName ?? 'Room';
    const ownerId = state?.ownerId ?? '';

    const { user } = useUserStore();
    const { leaderboard, loading, loadLeaderboard, subscribe, reset } = useRoomDetailStore();

    const [processing, setProcessing] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [memberSheet, setMemberSheet] = useState(null);
    const [confirmLeave, setConfirmLeave] = useState(false);

    const isOwner = user?.id === ownerId;

    useEffect(() => {
        loadLeaderboard(roomId);
        subscribe(roomId);
        return () => reset();
    }, [roomId]);

    const handleLeaveOrDelete = async () => {
        if (!confirmLeave) { setConfirmLeave(true); return; }
        setProcessing(true);
        try {
            await leaveRoom(roomId);
            navigate(-1);
        } catch { setProcessing(false); setConfirmLeave(false); }
    };

    return (
        <div className="page-bg min-h-dvh flex flex-col">
            {/* App Bar */}
            <header className="app-bar">
                <motion.button
                    id="room-detail-back-btn"
                    className="icon-btn"
                    onClick={() => navigate(-1)}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" style={{ width: 22, height: 22 }}>
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </motion.button>

                <div style={{ flex: 1, overflow: 'hidden', padding: '0 8px' }}>
                    <h1 style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700, fontSize: 18, color: '#fff',
                        textAlign: 'center', textOverflow: 'ellipsis',
                        overflow: 'hidden', whiteSpace: 'nowrap',
                    }}>
                        {roomName}
                    </h1>
                    {isOwner && (
                        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                            You are the owner
                        </p>
                    )}
                </div>

                {/* Invite shortcut for owner */}
                {isOwner ? (
                    <motion.button
                        id="invite-header-btn"
                        className="icon-btn"
                        onClick={() => setShowInvite(true)}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Invite member"
                    >
                        <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" style={{ width: 22, height: 22 }}>
                            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </motion.button>
                ) : (
                    <div style={{ width: 40 }} />
                )}
            </header>

            {/* Body */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {loading ? (
                    <Loader />
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Section label */}
                        <div className="content-wrap" style={{ paddingTop: 20, paddingBottom: 8 }}>
                            <p className="section-label" style={{ textAlign: 'center' }}>
                                🏆 Leaderboard · {leaderboard.length} member{leaderboard.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 8px' }}>
                            <div className="content-wrap" style={{ paddingTop: 4 }}>
                                {leaderboard.length === 0 ? (
                                    <div className="empty-state" style={{ minHeight: '40vh' }}>
                                        <span style={{ fontSize: 40 }}>🏅</span>
                                        <p>No members yet.</p>
                                    </div>
                                ) : (
                                    leaderboard.map((member, i) => (
                                        <LeaderTile
                                            key={member.user_id}
                                            user={member}
                                            index={i}
                                            animDelay={i * 0.04}
                                            tappable={isOwner && member.user_id !== ownerId}
                                            onTap={() => setMemberSheet(member)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="content-wrap" style={{ paddingTop: 12, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {/* Divider */}
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 4 }} />

                            {isOwner && (
                                <motion.button
                                    id="invite-member-btn"
                                    className="btn btn-primary"
                                    onClick={() => setShowInvite(true)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    📨 Invite Member
                                </motion.button>
                            )}

                            <AnimatePresence mode="wait">
                                <motion.button
                                    key={confirmLeave ? 'confirm' : 'initial'}
                                    id="leave-delete-room-btn"
                                    className="btn btn-danger"
                                    onClick={handleLeaveOrDelete}
                                    disabled={processing}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                >
                                    {processing ? (
                                        <div className="spinner spinner-sm" style={{ borderTopColor: '#ef4444' }} />
                                    ) : confirmLeave ? (
                                        `⚠️ Confirm ${isOwner ? 'Delete' : 'Leave'}`
                                    ) : (
                                        isOwner ? '🗑 Delete Room' : '🚪 Leave Room'
                                    )}
                                </motion.button>
                            </AnimatePresence>

                            {confirmLeave && !processing && (
                                <motion.button
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="btn btn-ghost"
                                    onClick={() => setConfirmLeave(false)}
                                >
                                    Cancel
                                </motion.button>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Invite Dialog */}
            <AnimatePresence>
                {showInvite && (
                    <InviteDialog
                        roomId={roomId}
                        onClose={() => { setShowInvite(false); loadLeaderboard(roomId); }}
                    />
                )}
            </AnimatePresence>

            {/* Member Sheet */}
            <AnimatePresence>
                {memberSheet && (
                    <MemberActionsSheet
                        user={memberSheet}
                        roomId={roomId}
                        onClose={() => setMemberSheet(null)}
                        onRemoved={() => loadLeaderboard(roomId)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
