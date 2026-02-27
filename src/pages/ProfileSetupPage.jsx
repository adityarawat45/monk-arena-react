import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from '../lib/supabase';
import useUserStore from '../stores/useUserStore';

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProfileSetupPage() {
    const navigate = useNavigate();
    const { user, refreshProfile } = useUserStore();

    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [ageError, setAgeError] = useState('');
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');

    const validateUsername = (val) => {
        if (!val.trim()) return 'Username required';
        if (!USERNAME_REGEX.test(val.trim().toLowerCase()))
            return '3–20 chars: lowercase letters, digits, underscore only';
        return '';
    };
    const validateAge = (val) => {
        if (!val) return 'Age required';
        const n = parseInt(val, 10);
        if (isNaN(n) || n < 13 || n > 100) return 'Age must be between 13 and 100';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const uErr = validateUsername(username);
        const aErr = validateAge(age);
        setUsernameError(uErr);
        setAgeError(aErr);
        if (uErr || aErr) return;

        setLoading(true);
        setGlobalError('');
        try {
            await updateProfile({ userId: user.id, username: username.trim(), age: parseInt(age, 10) });
            await refreshProfile();
            navigate('/', { replace: true });
        } catch (err) {
            if (err.code === 'USERNAME_TAKEN') {
                setUsernameError('Username already taken');
            } else {
                setGlobalError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-bg min-h-dvh flex items-center justify-center px-6 py-16">
            {/* Decorative orb */}
            <div style={{
                position: 'fixed', top: '10%', left: '50%',
                transform: 'translateX(-50%)',
                width: 360, height: 360,
                background: 'radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <motion.div
                variants={stagger} initial="hidden" animate="show"
                style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
            >
                {/* Logo */}
                <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 28 }}>
                    <img
                        src="/transparentlogo.png" alt="Monk Arena"
                        style={{ height: 80, objectFit: 'contain', filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.1))' }}
                    />
                </motion.div>

                {/* Heading */}
                <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 36 }}>
                    <h1 style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800, fontSize: 22, color: '#fff',
                    }}>
                        Welcome to Monk Arena
                    </h1>
                    <p style={{
                        fontFamily: "'Montserrat', sans-serif",
                        color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 8,
                    }}>
                        Set up your profile to begin your journey.
                    </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    {/* Username */}
                    <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.5px' }}>
                            USERNAME
                        </label>
                        <input
                            id="profile-username-input"
                            className={`input-field ${usernameError ? 'error' : ''}`}
                            placeholder="e.g. monk_warrior"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                            autoComplete="username"
                            spellCheck={false}
                            aria-label="Username"
                        />
                        <AnimatePresence>
                            {usernameError && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}
                                >
                                    {usernameError}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Age */}
                    <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.5px' }}>
                            AGE
                        </label>
                        <input
                            id="profile-age-input"
                            className={`input-field ${ageError ? 'error' : ''}`}
                            placeholder="Your age"
                            type="number"
                            value={age}
                            onChange={(e) => { setAge(e.target.value); setAgeError(''); }}
                            min={13} max={100}
                            aria-label="Age"
                        />
                        <AnimatePresence>
                            {ageError && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}
                                >
                                    {ageError}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {globalError && (
                        <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{globalError}</p>
                    )}

                    <motion.div variants={fadeUp}>
                        <motion.button
                            id="profile-submit-btn"
                            type="submit"
                            className="btn btn-primary"
                            style={{ height: 56, borderRadius: 16, fontSize: 16 }}
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label="Continue"
                        >
                            {loading ? <div className="spinner spinner-sm spinner-dark" /> : 'Continue →'}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
}
