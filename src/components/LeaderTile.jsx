import { motion } from 'framer-motion';

export function getRankColor(index) {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return 'rgba(255,255,255,0.22)';
}
export function getRankClass(index) {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return 'rank-other';
}

const MEDAL = ['1', '2', '3'];

export default function LeaderTile({ user, index, onTap, tappable = false, animDelay = 0 }) {
    const rankColor = getRankColor(index);
    const rankClass = getRankClass(index);
    const isTop3 = index < 3;

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: animDelay }}
            onClick={tappable ? onTap : undefined}
            role={tappable ? 'button' : undefined}
            tabIndex={tappable ? 0 : undefined}
            onKeyDown={tappable ? (e) => e.key === 'Enter' && onTap?.() : undefined}
            aria-label={tappable ? `Manage ${user.username}` : undefined}
            whileHover={tappable ? { scale: 1.01, x: 4 } : undefined}
            whileTap={tappable ? { scale: 0.99 } : undefined}
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                margin: '5px 0',
                background: isTop3
                    ? `linear-gradient(135deg, rgba(${index === 0 ? '255,215,0' : index === 1 ? '192,192,192' : '205,127,50'},0.06) 0%, rgba(255,255,255,0.02) 100%)`
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isTop3 ? rankColor + '30' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14,
                cursor: tappable ? 'pointer' : 'default',
                transition: 'background 0.2s',
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Rank Badge */}
            <div
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 ${rankClass}`}
                style={{ borderColor: rankColor }}
            >
                {isTop3 ? (
                    <span style={{ fontSize: 18 }}>{MEDAL[index]}</span>
                ) : (
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{index + 1}</span>
                )}
            </div>

            {/* Username */}
            <span style={{
                flex: 1,
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: "'Inter', sans-serif",
            }}>
                {user.username || '—'}
            </span>

            {/* Streak */}
            <span className="streak-badge">
                {user.current_streak ?? 0}d
            </span>

            {/* Tap indicator for owner */}
            {tappable && (
                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
            )}
        </motion.div>
    );
}
