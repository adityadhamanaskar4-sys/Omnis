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

    if (type === 'error') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4" role="alert" aria-live="assertive">
                <div
                    className={`w-full max-w-md rounded-lg border border-red-200 bg-white p-4 text-red-700 shadow-xl transition-all duration-300 dark:border-red-700 dark:bg-gray-900 dark:text-red-300 ${
                        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium">{message}</p>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
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
                className={`rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-lg transition-all duration-300 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 ${
                    isClosing ? 'translate-x-12 opacity-0' : 'translate-x-0 opacity-100'
                }`}
            >
                <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{message}</p>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}