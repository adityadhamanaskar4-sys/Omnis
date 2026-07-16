'use client'

import { useEffect, useState } from 'react';

type PopupProps = {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
};

export default function Popup({ type, message, onClose }: PopupProps) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (type !== 'success') {
            return;
        }

        const closeTimer = setTimeout(() => {
            setIsClosing(true);
        }, 5000);

        return () => clearTimeout(closeTimer);
    }, [type]);

    useEffect(() => {
        if (!isClosing) {
            return;
        }

        const finalizeCloseTimer = setTimeout(() => {
            onClose();
        }, 300);

        return () => clearTimeout(finalizeCloseTimer);
    }, [isClosing, onClose]);

    const handleClose = () => setIsClosing(true);

    const toastClassName =
        'w-full max-w-md rounded-2xl border bg-[color:var(--surface)] p-4 text-[color:var(--foreground)] shadow-2xl transition-all duration-300';

    if (type === 'error') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]" role="alert" aria-live="assertive">
                <div
                    className={`${toastClassName} border-[color:var(--accent)] text-[color:var(--foreground)] ${
                        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-[color:var(--foreground)]">{message}</p>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2 py-1 text-xs font-semibold text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-strong)]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed right-4 top-4 z-50 w-[90vw] max-w-sm" role="status" aria-live="polite">
            <div
                className={`${toastClassName} border-[color:var(--accent)] ${
                    isClosing ? 'translate-x-12 opacity-0' : 'translate-x-0 opacity-100'
                }`}
            >
                <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{message}</p>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2 py-1 text-xs font-semibold text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-strong)]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}