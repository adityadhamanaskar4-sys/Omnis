'use client';

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Delete, DoorOpen, ExternalLink, LoaderCircle, LogOut, Plus, RefreshCcw, Trash } from 'lucide-react';
import Popup from '../components/Popup';

const AUTH_BASE_URL = 'http://localhost:5000/auth';
const ROOM_BASE_URL = 'http://localhost:5000/room';

type PopupState = {
    type: 'success' | 'error';
    message: string;
} | null;

type RoomRecord = {
    _id: string;
    name: string;
    isPublic: boolean;
    inviteCode: string;
    createdAt?: string;
    updatedAt?: string;
};

type RoomMembership = {
    _id: string;
    role: 'owner' | 'editor' | 'viewer';
    roomId: RoomRecord;
    joinedAt?: string;
};

const emptyCreateForm = {
    name: '',
    isPublic: true,
};

const emptyJoinForm = {
    roomId: '',
};

const formatDate = (value?: string) => {
    if (!value) {
        return 'Recently';
    }

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
};

export default function App() {
    const router = useRouter();
    const [popup, setPopup] = useState<PopupState>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState<'create' | 'join' | 'logout' | null>(null);
    const [rooms, setRooms] = useState<RoomMembership[]>([]);
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [joinForm, setJoinForm] = useState(emptyJoinForm);

    useEffect(() => {
        let mounted = true;

        const loadRooms = async () => {
            try {
                setIsLoadingRooms(true);
                const response = await axios.get(ROOM_BASE_URL, { withCredentials: true });

                if (mounted) {
                    setRooms(Array.isArray(response.data) ? response.data : []);
                }
            } catch (error) {
                if (mounted) {
                    const message = axios.isAxiosError(error)
                        ? error.response?.data?.message || 'Unable to load rooms.'
                        : 'Unable to load rooms.';
                    setPopup({ type: 'error', message });
                }
            } finally {
                if (mounted) {
                    setIsLoadingRooms(false);
                }
            }
        };

        const verifySession = async () => {
            try {
                await axios.get(`${AUTH_BASE_URL}/session`, { withCredentials: true });
                await loadRooms();
            } catch {
                if (mounted) {
                    setPopup({
                        type: 'error',
                        message: 'Login to continue',
                    });
                    router.replace('/');
                }
            } finally {
                if (mounted) {
                    setIsCheckingSession(false);
                }
            }
        };

        void verifySession();

        return () => {
            mounted = false;
        };
    }, [router]);

    const refreshRooms = async () => {
        try {
            setIsLoadingRooms(true);
            const response = await axios.get(ROOM_BASE_URL, { withCredentials: true });
            setRooms(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Unable to load rooms.'
                : 'Unable to load rooms.';
            setPopup({ type: 'error', message });
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const openRoom = (roomId: string) => {
        router.push(`/rooms?roomId=${roomId}`);
    };

    const copyRoomId = async (roomId: string) => {
        try {
            await navigator.clipboard.writeText(roomId);
            setPopup({
                type: 'success',
                message: 'Room id copied to clipboard.',
            });
        } catch {
            setPopup({
                type: 'error',
                message: 'Unable to copy room id.',
            });
        }
    };
    const deleteRoom=async (roomId:string)=>{
        try{
            await axios.delete(`${ROOM_BASE_URL}/${roomId}`,{withCredentials:true});
            await refreshRooms();
        }catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Unable to load rooms.'
                : 'Unable to load rooms.';
            setPopup({ type: 'error', message });
        } finally {
            setIsLoadingRooms(false);
        }
    }
    const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!createForm.name.trim()) {
            setPopup({ type: 'error', message: 'Room name is required.' });
            return;
        }

        try {
            setIsSubmitting('create');
            const response = await axios.post(
                ROOM_BASE_URL,
                {
                    name: createForm.name.trim(),
                    isPublic: createForm.isPublic,
                },
                { withCredentials: true }
            );

            setCreateForm(emptyCreateForm);
            setPopup({
                type: 'success',
                message: response.data?.message || 'Room created successfully.',
            });
            await refreshRooms();

            if (response.data?._id) {
                openRoom(response.data._id);
            }
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Unable to create room.'
                : 'Unable to create room.';
            setPopup({ type: 'error', message });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const roomId = joinForm.roomId.trim();

        if (!roomId) {
            setPopup({ type: 'error', message: 'Room id is required.' });
            return;
        }

        try {
            setIsSubmitting('join');
            const response = await axios.post(
                `${ROOM_BASE_URL}/${roomId}/join`,
                {},
                { withCredentials: true }
            );

            setJoinForm(emptyJoinForm);
            setPopup({
                type: 'success',
                message: response.data?.message || 'Joined room successfully.',
            });
            await refreshRooms();
            openRoom(roomId);
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Unable to join room.'
                : 'Unable to join room.';
            setPopup({ type: 'error', message });
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleLogout = async () => {
        try {
            setIsSubmitting('logout');
            await axios.post(`${AUTH_BASE_URL}/logout`, {}, { withCredentials: true });
            router.replace('/');
        } catch {
            setPopup({
                type: 'error',
                message: 'Unable to log out. Please try again.',
            });
        } finally {
            setIsSubmitting(null);
        }
    };

    if (isCheckingSession) {
        return (
            <main className="flex min-h-screen items-center justify-center px-6 py-10">
                <section className="app-card w-full max-w-3xl rounded-[2rem] px-6 py-8 md:px-10 md:py-12">
                    <div className="flex items-center gap-3 text-sm font-medium text-[color:var(--muted)]">
                        <LoaderCircle className="h-4 w-4 animate-spin text-[color:var(--accent)]" />
                        Verifying session...
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
            <section className="app-card w-full max-w-6xl rounded-[2rem] px-6 py-8 md:px-10 md:py-12">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Dashboard</p>
                        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your rooms</h1>
                        <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                            Create a new room, join by id, or open any room you already belong to. Everything uses the same red-and-neutral theme as the rest of Omnis.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={refreshRooms}
                            disabled={isLoadingRooms}
                            className="app-button-secondary px-5 py-3 text-sm"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            {isLoadingRooms ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isSubmitting === 'logout'}
                            className="app-button-secondary px-5 py-3 text-sm"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {isSubmitting === 'logout' ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                    <div className="space-y-4">
                        <div className="app-surface rounded-[1.5rem] p-5 md:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Current rooms</p>
                                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                                        Rooms loaded from <span className="font-medium text-[color:var(--foreground)]">GET /room</span>.
                                    </p>
                                </div>
                                <span className="app-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                                    {rooms.length} total
                                </span>
                            </div>

                            <div className="mt-5">
                                {isLoadingRooms ? (
                                    <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-5 text-sm text-[color:var(--muted)]">
                                        Loading rooms...
                                    </div>
                                ) : rooms.length === 0 ? (
                                    <div className="rounded-[1.25rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-[color:var(--muted)]">
                                        No rooms yet. Create one on the right or join by id.
                                    </div>
                                ) : (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {rooms.map((membership) => {
                                            const room = membership.roomId;

                                            return (
                                                <article key={membership._id} className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-sm">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h2 className="text-lg font-semibold tracking-tight">{room.name}</h2>
                                                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                                                                {membership.role} • {room.isPublic ? 'Public' : 'Private'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyRoomId(room._id)}
                                                            className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-2 text-[color:var(--muted)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteRoom(room._id)}
                                                            className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-2 text-[color:var(--muted)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                                                        >
                                                            <Trash className='h-4 w-4'/>
                                                        </button>
                                                    </div>

                                                    <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Room ID</span>
                                                            <span className="font-medium text-[color:var(--foreground)]">{room._id}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Invite code</span>
                                                            <span className="font-medium text-[color:var(--foreground)]">{room.inviteCode}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Joined</span>
                                                            <span className="font-medium text-[color:var(--foreground)]">{formatDate(membership.joinedAt)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <Link href={`/rooms?roomId=${room._id}`} className="app-button-primary px-4 py-2.5 text-sm">
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Open room
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openRoom(room._id)}
                                                            className="app-button-secondary px-4 py-2.5 text-sm"
                                                        >
                                                            <DoorOpen className="mr-2 h-4 w-4" />
                                                            Focus board
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleCreateRoom} className="app-surface rounded-[1.5rem] p-5 md:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Create room</p>
                                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                                        Creates a new room through <span className="font-medium text-[color:var(--foreground)]">POST /room</span>.
                                    </p>
                                </div>
                                <Plus className="h-5 w-5 text-[color:var(--accent)]" />
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="room-name" className="app-label block text-sm font-medium">Room name</label>
                                    <input
                                        id="room-name"
                                        type="text"
                                        className="app-input"
                                        placeholder="Design sprint"
                                        value={createForm.name}
                                        onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
                                    />
                                </div>

                                <label className="flex items-center justify-between gap-4 rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3">
                                    <div>
                                        <span className="block text-sm font-medium">Public room</span>
                                        <span className="block text-xs text-[color:var(--muted)]">Allow other signed-in users to join with the room id.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={createForm.isPublic}
                                        onChange={(event) => setCreateForm({ ...createForm, isPublic: event.target.checked })}
                                        className="h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                                    />
                                </label>

                                <button type="submit" disabled={isSubmitting === 'create'} className="app-button-primary w-full px-5 py-3 text-sm">
                                    {isSubmitting === 'create' ? 'Creating...' : 'Create room'}
                                </button>
                            </div>
                        </form>

                        <form onSubmit={handleJoinRoom} className="app-surface rounded-[1.5rem] p-5 md:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Join room</p>
                                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                                        Join a room directly through <span className="font-medium text-[color:var(--foreground)]">POST /room/:id/join</span>.
                                    </p>
                                </div>
                                <DoorOpen className="h-5 w-5 text-[color:var(--accent)]" />
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="room-id" className="app-label block text-sm font-medium">Room id</label>
                                    <input
                                        id="room-id"
                                        type="text"
                                        className="app-input"
                                        placeholder="68b..."
                                        value={joinForm.roomId}
                                        onChange={(event) => setJoinForm({ roomId: event.target.value })}
                                    />
                                </div>

                                <button type="submit" disabled={isSubmitting === 'join'} className="app-button-secondary w-full px-5 py-3 text-sm">
                                    {isSubmitting === 'join' ? 'Joining...' : 'Join room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
        </main>
    );
}
