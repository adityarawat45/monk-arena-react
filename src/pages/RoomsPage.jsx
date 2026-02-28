import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useRoomsStore from '../stores/useRoomsStore';
import RoomCard from '../components/RoomCard';
import Loader from '../components/Loader';

export default function RoomsPage() {
    const navigate = useNavigate();
    const { rooms, loading, loadRooms, createRoom } = useRoomsStore();

    const [showDialog, setShowDialog] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => { loadRooms(); }, []);

    const handleCreate = async () => {
        const name = roomName.trim();
        if (!name) return;
        setCreating(true);
        try {
            await createRoom(name);
            setRoomName('');
            setShowDialog(false);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="page-bg min-h-dvh flex flex-col">
            {/* App Bar */}
            <header className="app-bar">
                <motion.button
                    id="rooms-back-btn"
                    className="icon-btn"
                    onClick={() => navigate(-1)}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Go back"
                >
                    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" style={{ width: 22, height: 22 }}>
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </motion.button>
                <h1 style={{
                    flex: 1, textAlign: 'center',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700, fontSize: 18, color: '#fff',
                }}>
                    Private Rooms
                </h1>
                <div style={{ width: 40 }} />
            </header>

            {/* Body */}
            <main style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Loader />
                ) : rooms.length === 0 ? (
                    <div className="empty-state page-enter">
                        <p style={{ fontSize: 14, fontWeight: 500 }}>No rooms yet</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                            Create one with the + button
                        </p>
                    </div>
                ) : (
                    <div className="content-wrap page-enter" style={{ paddingTop: 16, paddingBottom: 100 }}>
                        <p className="section-label" style={{ marginBottom: 12 }}>
                            Your Rooms ({rooms.length})
                        </p>
                        {rooms.map((room, i) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                animDelay={i * 0.05}
                                onClick={() =>
                                    navigate(`/rooms/${room.id}`, {
                                        state: { roomName: room.name, ownerId: room.owner_id },
                                    })
                                }
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* FAB */}
            <motion.button
                id="create-room-fab"
                style={{
                    position: 'fixed', right: 20, bottom: 24,
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: '#fff',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
                    zIndex: 20,
                }}
                onClick={() => setShowDialog(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Create new room"
            >
                <svg viewBox="0 0 24 24" fill="black" style={{ width: 26, height: 26 }}>
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
            </motion.button>

            {/* Create Room Dialog */}
            <AnimatePresence>
                {showDialog && (
                    <motion.div
                        className="overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={(e) => e.target === e.currentTarget && !creating && setShowDialog(false)}
                    >
                        <motion.div
                            className="modal-panel"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                        >
                            <h3 style={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700, fontSize: 18,
                                color: '#fff', textAlign: 'center', marginBottom: 20,
                            }}>
                                Create Room
                            </h3>

                            <input
                                id="room-name-input"
                                className="input-field"
                                placeholder="Room Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                autoFocus
                                style={{ marginBottom: 20 }}
                                aria-label="Room name"
                            />

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1 }}
                                    onClick={() => { setShowDialog(false); setRoomName(''); }}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    id="create-room-btn"
                                    className="btn btn-primary"
                                    style={{ flex: 1, height: 44 }}
                                    onClick={handleCreate}
                                    disabled={creating || !roomName.trim()}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {creating ? <div className="spinner spinner-sm spinner-dark" /> : 'Create'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
