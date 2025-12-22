import { motion } from "framer-motion";
import { LogOut, Shield, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 transition-colors">
            <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
                        <img src="/logo.png" alt="Ezy Motel logo" className="h-8 w-auto" />
                        <span className="text-lg font-semibold tracking-tight">Ezy Motel</span>
                    </Link>

                    <div className="flex items-center gap-2 text-sm">
                        {user && (
                            <>
                                <NavItem to="/account" icon={UserRound}>
                                    My account
                                </NavItem>

                                {user.role === "ADMIN" && (
                                    <NavItem to="/admin" icon={Shield}>
                                        Admin
                                    </NavItem>
                                )}
                            </>
                        )}

                        <ThemeToggle />

                        {!user ? (
                            <>
                                <NavItem to="/login">Login</NavItem>

                                <Link
                                    to="/register"
                                    className="
                    px-3 py-1.5 rounded-md
                    bg-blue-600 text-white
                    hover:bg-blue-700
                    dark:bg-blue-500 dark:hover:bg-blue-600
                    transition
                  "
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:block text-gray-500 dark:text-gray-400">{user.email}</span>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={logout}
                                    className="
                    p-2 rounded-full
                    text-gray-600 hover:text-gray-900 hover:bg-gray-100
                    dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-neutral-800
                    transition
                  "
                                    aria-label="Logout"
                                >
                                    <LogOut size={18} />
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">{children}</main>
        </div>
    );
}

function NavItem({ to, icon: Icon, children }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `
        inline-flex items-center gap-1.5
        px-2.5 py-1.5 rounded-md
        transition
        ${
            isActive
                ? "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-neutral-800"
        }
      `
            }
        >
            {Icon && <Icon size={16} />}
            {children}
        </NavLink>
    );
}
