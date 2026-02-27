import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../lib/supabase';

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(`Login failed: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="page-bg flex flex-col min-h-dvh overflow-hidden">
            {/* Decorative glow orb */}
            <div
                style={{
                    position: 'fixed', top: '15%', left: '50%',
                    transform: 'translateX(-50%)',
                    width: 480, height: 480,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 0,
                }}
            />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="relative z-10 flex flex-col min-h-dvh items-center justify-between px-6 py-14"
                style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}
            >
                {/* Top: logo + headline */}
                <div className="flex flex-col items-center gap-6 flex-1 justify-center">
                    <motion.div variants={fadeUp}>
                        <img
                            src="/transparentlogo.png"
                            alt="Monk Arena"
                            style={{
                                height: 140, width: 'auto', objectFit: 'contain',
                                filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.12))',
                            }}
                        />
                    </motion.div>

                    <motion.div variants={fadeUp} className="text-center">
                        <h1
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 900,
                                fontSize: 'clamp(28px, 7vw, 34px)',
                                letterSpacing: '1.5px',
                                color: '#fff',
                                lineHeight: 1.1,
                            }}
                        >
                            MONK ARENA
                        </h1>
                        <p
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 13,
                                marginTop: 10,
                                letterSpacing: '0.3px',
                            }}
                        >
                            Discipline. Consistency. Competition.
                        </p>
                    </motion.div>

                    {/* Stat pills */}
                    <motion.div variants={fadeUp} className="flex gap-3 flex-wrap justify-center">
                        {['Track Streaks', 'Compete Globally', 'Private Rooms'].map((t) => (
                            <span
                                key={t}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 999,
                                    padding: '5px 14px',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.55)',
                                    letterSpacing: '0.3px',
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* Bottom: CTA */}
                <motion.div variants={fadeUp} className="w-full flex flex-col gap-3">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 12,
                                padding: '10px 14px',
                            }}
                        >
                            <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>
                        </motion.div>
                    )}

                    <motion.button
                        id="google-signin-btn"
                        className="btn btn-primary"
                        style={{ height: 58, borderRadius: 16, fontSize: 16 }}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label="Continue with Google"
                    >
                        {loading ? (
                            <div className="spinner spinner-dark spinner-sm" />
                        ) : (
                            <>
                                <img src="/google.png" alt="" style={{ height: 22, width: 22 }} />
                                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: '#000' }}>
                                    Continue with Google
                                </span>
                            </>
                        )}
                    </motion.button>

                    <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 4 }}>
                        By continuing, you agree to our Privacy Policy &amp; Terms.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
