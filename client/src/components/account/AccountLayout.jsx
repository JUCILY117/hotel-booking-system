import { motion } from "framer-motion";
import { CalendarCheck, CreditCard, User } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
    {
        label: "My bookings",
        to: "/account/bookings",
        icon: CalendarCheck,
    },
    {
        label: "My payments",
        to: "/account/payments",
        icon: CreditCard,
    },
];

export default function AccountLayout() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex bg-gray-50 dark:bg-neutral-950 transition-colors rounded-2xl overflow-hidden shadow-lg">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="p-5 border-b border-gray-200 dark:border-neutral-800 flex items-center gap-2">
                    <User size={16} className="text-gray-600 dark:text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                        My account
                    </h2>
                </div>

                <nav className="p-3 space-y-1 text-sm">
                    {navItems.map(({ label, to, icon: Icon }) => (
                        <NavItem key={to} to={to} icon={Icon}>
                            {label}
                        </NavItem>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-6">
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="surface-elevated rounded-2xl p-6 min-h-full"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}

function NavItem({ to, icon: Icon, children }) {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `
                flex items-center gap-2.5
                px-3 py-2 rounded-lg transition
                ${
                    isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-gray-100"
                }
            `
            }
        >
            <Icon size={16} />
            <span>{children}</span>
        </NavLink>
    );
}
