import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const slides = [
    {
        image: "/images/hotel-1.jpg",
        title: "Book stays effortlessly",
        subtitle: "Discover hotels in seconds",
    },
    {
        image: "/images/hotel-2.jpg",
        title: "Smart & secure bookings",
        subtitle: "Your comfort, our priority",
    },
    {
        image: "/images/hotel-3.jpg",
        title: "Travel made simple",
        subtitle: "Plan, book, relax",
    },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setActiveSlide(i => (i + 1) % slides.length), 4500);
        return () => clearInterval(id);
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/auth/register", { name, email, password });
            toast.success("Account created successfully");
            navigate("/login");
        } catch {
            toast.error("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-2 bg-gray-50 dark:bg-neutral-950 transition-colors">
            <div className="hidden lg:flex items-center justify-center p-6">
                <div className="relative w-full max-w-[480px] h-[480px] rounded-3xl overflow-hidden shadow-lg">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={activeSlide}
                            src={slides[activeSlide].image}
                            alt=""
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />

                    <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                        <div className="max-w-sm backdrop-blur-[2px]">
                            <h2 className="text-2xl font-semibold mb-1 leading-tight">{slides[activeSlide].title}</h2>
                            <p className="text-sm text-white/90">{slides[activeSlide].subtitle}</p>
                        </div>

                        <div className="flex gap-2 mt-4">
                            {slides.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 w-6 rounded-full transition-all ${
                                        i === activeSlide ? "bg-white" : "bg-white/40"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-6">
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="
      w-full max-w-md
      surface-elevated
      rounded-2xl
      border border-gray-200 dark:border-neutral-800
      p-6
      shadow-lg
      flex flex-col justify-center
    "
                    style={{ minHeight: "480px" }}
                >
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Create account</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get started with hotel bookings</p>

                        <Field icon={User} placeholder="Your name" value={name} onChange={setName} type="text" />
                        <Field icon={Mail} placeholder="Email address" value={email} onChange={setEmail} type="email" />
                        <PasswordField icon={Lock} placeholder="••••••••" value={password} onChange={setPassword} />

                        <button
                            type="submit"
                            disabled={loading}
                            className="
          mt-4 w-full
          inline-flex items-center justify-center gap-2
          rounded-xl py-3
          bg-blue-600 text-white font-semibold
          hover:bg-blue-700 active:scale-[0.98]
          disabled:opacity-60
          transition
        "
                        >
                            {loading ? <LoaderSpinner /> : "Create account"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.form>
            </div>
        </div>
    );
}

function Field({ icon: Icon, placeholder, value, onChange, type }) {
    return (
        <div className="mb-3">
            <div
                className="
          flex items-center gap-2
          px-3 py-2.5 rounded-xl
          border border-gray-300 dark:border-neutral-700
          bg-white dark:bg-neutral-900
          focus-within:ring-2 focus-within:ring-blue-500/40
          transition
        "
            >
                <Icon size={18} className="text-gray-400" />
                <input
                    type={type}
                    required
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    className="
            flex-1 bg-transparent outline-none
            text-sm text-gray-900 dark:text-gray-100
            placeholder:text-gray-400
          "
                />
            </div>
        </div>
    );
}

function PasswordField({ icon: Icon, placeholder, value, onChange }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="mb-3 relative">
            <div
                className="
          flex items-center gap-2
          px-3 py-2.5 rounded-xl
          border border-gray-300 dark:border-neutral-700
          bg-white dark:bg-neutral-900
          focus-within:ring-2 focus-within:ring-blue-500/40
          transition
        "
            >
                <Icon size={18} className="text-gray-400" />
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    className="
            flex-1 bg-transparent outline-none
            text-sm text-gray-900 dark:text-gray-100
            placeholder:text-gray-400
          "
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

function LoaderSpinner() {
    return (
        <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="loading"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
    );
}
