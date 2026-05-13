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
        <div className="page-bg flex flex-col overflow-hidden m-0 p-0 items-center justify-center px-4 py-10 sm:px-6 sm:py-12" style={{ minHeight: '100dvh' }}>
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
                className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 gap-12 w-full max-w-3xl"
                style={{ maxWidth: 'min(920px, 92vw)', margin: '0 auto', width: '100%' }}
            >
                {/* Top: logo + headline */}
                <div className="flex flex-col items-center gap-0 w-full max-w-md m-auto">
                    <motion.div variants={fadeUp}>
                        <img
                            src="/transparentlogo.png"
                            alt="Monk Arena"
                            style={{
                                display: 'block',
                                height: 'clamp(200px, 40vw, 360px)',
                                width: 'auto',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.12))',
                            }}
                        />
                    </motion.div>

                    <motion.div variants={fadeUp} className="text-center">
                        <h1
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 900,
                                fontSize: 'clamp(34px, 6.5vw, 64px)',
                                letterSpacing: '1.5px',
                                color: '#fff',
                                lineHeight: 1.02,
                                whiteSpace: 'nowrap',
                                marginTop: 0,
                            }}
                        >
                            MONK ARENA
                        </h1>
                        <p
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                color: 'rgba(255,255,255,0.85)',
                                fontSize: 'clamp(14px, 2.8vw, 22px)',
                                marginTop: 6,
                                letterSpacing: '0.4px',
                                fontWeight: 600,
                                lineHeight: 1.05,
                            }}
                        >
                            Discipline.   Consistency.   Competition.
                        </p>
                    </motion.div>

                    {/* Stat pills removed per design feedback */}
                </div>

                {/* Bottom: CTA */}
                <motion.div variants={fadeUp} className="w-full flex flex-col gap-3 max-w-md mx-auto">
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
                        type="button"
                        className="btn btn-primary"
                        style={{ width: '100%', maxWidth: 420, height: 58, borderRadius: 18, fontSize: 16, padding: '0 18px' }}
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

                    <p style={{ textAlign: 'center', fontSize: 11, color: 'gray', marginTop: 16, marginBottom: 10 }}>
                        By continuing, you agree to our Privacy Policy &amp; Terms.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
