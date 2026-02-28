import { motion } from 'framer-motion';

export default function RoomCard({ room, onClick, animDelay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: animDelay }}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            aria-label={`Open room ${room.name}`}
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px',
                margin: '6px 0',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                transition: 'border-color 0.2s, background 0.2s',
            }}
            className="glass-card"
        >
            {/* Icon */}
            <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" style={{ width: 20, height: 20 }}>
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18 13 16 13z" />
                </svg>
            </div>

            {/* Name */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{
                    color: '#fff', fontWeight: 600, fontSize: 15,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {room.name}
                </p>
            </div>

            {/* Arrow */}
            <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
        </motion.div>
    );
}
