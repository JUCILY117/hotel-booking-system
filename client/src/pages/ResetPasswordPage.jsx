import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const token = params.get("token");

    const toast = useToast();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [tokenInvalid, setTokenInvalid] = useState(false);

    useEffect(() => {
        if (!token) {
            setTokenInvalid(true);
            setChecking(false);
            return;
        }

        api.get("/auth/verify-reset-token", { params: { token } })
            .then(() => {
                setChecking(false);
            })
            .catch(() => {
                setTokenInvalid(true);
                setChecking(false);
            });
    }, [token]);

    const handleSubmit = async e => {
        e.preventDefault();

        if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", { token, password });
            toast.success("Password reset successful");
            navigate("/login");
        } catch (err) {
            setTokenInvalid(true);
            toast.error(err?.response?.data?.message || "Invalid or expired token");
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 bg-gray-50 dark:bg-neutral-950">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-elevated rounded-2xl p-6 text-center max-w-md border border-gray-200 dark:border-neutral-800"
                >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Invalid reset link</h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        This password reset link is invalid or incomplete.
                    </p>

                    <Link
                        to="/forgot-password"
                        className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Request a new reset link
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (tokenInvalid) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
                <div className="surface-elevated rounded-2xl p-6 text-center max-w-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reset link expired</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        This password reset link is no longer valid.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-6">
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-md surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-lg"
            >
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Reset password</h1>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Choose a new password for your account</p>

                <PasswordField placeholder="New password" value={password} onChange={setPassword} />

                <PasswordField placeholder="Confirm password" value={confirm} onChange={setConfirm} />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 transition"
                >
                    {loading ? "Resetting..." : "Reset password"}
                    {!loading && <ArrowRight size={18} />}
                </button>

                <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-5">
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Back to login
                    </Link>
                </p>
            </motion.form>
        </div>
    );
}

function PasswordField({ placeholder, value, onChange }) {
    const [show, setShow] = useState(false);

    return (
        <div className="mb-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-blue-500/40 transition">
                <Lock size={18} className="text-gray-400" />
                <input
                    type={show ? "text" : "password"}
                    required
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}
