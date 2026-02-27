import { motion } from 'framer-motion';

export default function Loader() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: 240,
                flex: 1,
            }}
        >
            <div className="spinner" />
        </motion.div>
    );
}
