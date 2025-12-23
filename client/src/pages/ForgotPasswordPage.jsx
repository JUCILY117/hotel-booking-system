import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function ForgotPasswordPage() {
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
            toast.success("If the email exists, a reset link has been sent");
        } catch {
            toast.error("Unable to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-6">
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-md surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-lg"
            >
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Forgot password</h1>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                    Enter your email and we’ll send you a reset link
                </p>

                {!sent ? (
                    <>
                        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 transition"
                        >
                            {loading ? "Sending..." : "Send reset link"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </>
                ) : (
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                        Check your inbox for a password reset link.
                    </div>
                )}

                <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-5">
                    Remembered your password?{" "}
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Back to login
                    </Link>
                </p>
            </motion.form>
        </div>
    );
}

function Field({ icon: Icon, placeholder, value, onChange, type }) {
    return (
        <div className="mb-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-blue-500/40 transition">
                <Icon size={18} className="text-gray-400" />
                <input
                    type={type}
                    required
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}
