import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles the OAuth callback redirect from Supabase.
 * Supabase will redirect here with the code/token in the URL.
 * We just wait for the session to load and then redirect to home.
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                navigate('/', { replace: true });
            }
        });

        // Also check immediately in case session is already set
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/', { replace: true });
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="page-gradient flex items-center justify-center min-h-dvh">
            <div className="flex flex-col items-center gap-4">
                <div className="spinner" />
                <p className="text-white/60 text-sm font-montserrat">Signing you in…</p>
            </div>
        </div>
    );
}
