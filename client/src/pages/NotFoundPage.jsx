import { motion } from "framer-motion";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="
                    w-full max-w-md
                    surface-elevated
                    rounded-2xl
                    border border-gray-200 dark:border-neutral-800
                    p-8
                    text-center
                    shadow-lg
                "
            >
                <div className="flex justify-center mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                        <SearchX size={28} className="text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">404</h1>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Page not found</p>

                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    The page you’re looking for doesn’t exist or may have been moved.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="
                            inline-flex items-center justify-center gap-2
                            rounded-xl px-4 py-2.5
                            bg-blue-600 text-white
                            text-sm font-medium
                            hover:bg-blue-700
                            active:scale-[0.98]
                            transition
                        "
                    >
                        <Home size={16} />
                        Go home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="
                            inline-flex items-center justify-center gap-2
                            rounded-xl px-4 py-2.5
                            border border-gray-300 dark:border-neutral-700
                            text-sm font-medium
                            text-gray-700 dark:text-gray-300
                            hover:bg-gray-100 dark:hover:bg-neutral-800
                            active:scale-[0.98]
                            transition
                        "
                    >
                        <ArrowLeft size={16} />
                        Go back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
