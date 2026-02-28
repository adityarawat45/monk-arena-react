import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileByUsername, inviteToRoom } from '../lib/supabase';

export default function InviteDialog({ roomId, onClose }) {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInvite = async () => {
        const trimmed = username.trim().toLowerCase();
        if (!trimmed) return;
        setLoading(true); setError(''); setSuccess('');
        try {
            const profile = await getProfileByUsername(trimmed);
            if (!profile) { setError('User not found.'); return; }
            await inviteToRoom(roomId, profile.id);
            setSuccess(`Invite sent to @${trimmed} ✓`);
            setUsername('');
            setTimeout(() => onClose(), 1400);
        } catch (err) {
            setError(err.message || 'Failed to send invite.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="modal-panel"
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 24 }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" style={{ width: 36, height: 36 }}>
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <h3 style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700, fontSize: 18, color: '#fff', marginTop: 8,
                    }}>
                        Invite Member
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
                        Enter their exact username
                    </p>
                </div>

                <input
                    id="invite-username-input"
                    className={`input-field ${error ? 'error' : ''}`}
                    placeholder="username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                    autoFocus
                    disabled={loading}
                    style={{ marginBottom: 12 }}
                    aria-label="Username to invite"
                />

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.p key="err"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 8 }}
                        >
                            {error}
                        </motion.p>
                    )}
                    {success && (
                        <motion.p key="ok"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ color: '#4ade80', fontSize: 13, textAlign: 'center', marginBottom: 8 }}
                        >
                            {success}
                        </motion.p>
                    )}
                </AnimatePresence>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <motion.button
                        id="invite-send-btn"
                        className="btn btn-primary"
                        onClick={handleInvite}
                        disabled={loading || !username.trim()}
                        whileTap={{ scale: 0.97 }}
                    >
                        {loading ? <div className="spinner spinner-sm spinner-dark" /> : 'Send Invite'}
                    </motion.button>
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
