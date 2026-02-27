import { motion } from 'framer-motion';
import { removeMember } from '../lib/supabase';

export default function MemberActionsSheet({ user, roomId, onClose, onRemoved }) {
    const handleRemove = async () => {
        onClose();
        await removeMember(roomId, user.user_id);
        onRemoved?.();
    };

    return (
        <motion.div
            className="overlay-bottom"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="sheet-panel"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
                {/* Handle */}
                <div style={{
                    width: 36, height: 4, borderRadius: 2,
                    background: 'rgba(255,255,255,0.15)',
                    margin: '12px auto 20px',
                }} />

                {/* Avatar + name */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px',
                        fontSize: 22,
                    }}>
                        👤
                    </div>
                    <p style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700, fontSize: 17, color: '#fff',
                    }}>
                        @{user.username}
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <motion.button
                        id="remove-member-btn"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleRemove}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 16px',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: 14, cursor: 'pointer', width: '100%',
                        }}
                        aria-label={`Remove ${user.username}`}
                    >
                        <svg viewBox="0 0 24 24" fill="#ef4444" style={{ width: 20, height: 20, flexShrink: 0 }}>
                            <path d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z" />
                        </svg>
                        <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 15 }}>
                            Remove from Room
                        </span>
                    </motion.button>

                    <button
                        className="btn btn-ghost"
                        onClick={onClose}
                        style={{ marginTop: 4 }}
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
