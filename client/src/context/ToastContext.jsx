import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
};

const TOAST_DURATION = 3500;
const MAX_TOASTS = 4;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback(id => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const show = useCallback(
        (message, type = "info") => {
            const id = crypto.randomUUID();

            setToasts(prev => {
                const next = [...prev, { id, message, type }];
                return next.slice(-MAX_TOASTS);
            });

            setTimeout(() => remove(id), TOAST_DURATION);
        },
        [remove]
    );

    const api = {
        success: msg => show(msg, "success"),
        error: msg => show(msg, "error"),
        info: msg => show(msg, "info"),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastViewport toasts={toasts} onClose={remove} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used inside <ToastProvider />");
    }
    return ctx;
}

function ToastViewport({ toasts, onClose }) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] space-y-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(({ id, message, type }) => {
                    const Icon = icons[type];

                    return (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.96 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="
                pointer-events-auto
                flex items-start gap-3
                min-w-[280px] max-w-[360px]
                rounded-xl border
                border-gray-200 dark:border-neutral-800
                bg-white dark:bg-neutral-900
                px-4 py-3
                shadow-lg
              "
                        >
                            <Icon
                                size={20}
                                className={
                                    type === "success"
                                        ? "text-green-600 dark:text-green-400"
                                        : type === "error"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-blue-600 dark:text-blue-400"
                                }
                            />

                            <p className="flex-1 text-sm text-gray-900 dark:text-gray-100">{message}</p>

                            <button
                                onClick={() => onClose(id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                aria-label="Dismiss"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
