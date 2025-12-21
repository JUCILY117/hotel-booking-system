import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get("/admin/analytics/dashboard"), api.get("/bookings/admin/all")])
            .then(([statsRes, bookingsRes]) => {
                setStats(statsRes.data);
                setBookings(bookingsRes.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-20 text-gray-500">Loading dashboard…</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overview of bookings and activity</p>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={CalendarCheck} label="Total bookings" value={stats.totalBookings} />
                    <StatCard icon={Clock} label="Pending" value={stats.pendingBookings} tone="yellow" />
                    <StatCard icon={CheckCircle2} label="Confirmed" value={stats.confirmedBookings} tone="green" />
                    <StatCard icon={XCircle} label="Cancelled" value={stats.cancelledBookings} tone="red" />
                </div>
            )}

            <div className="surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-neutral-800">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent bookings</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-800">
                            <tr>
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Hotel</th>
                                <th className="px-5 py-3 font-medium">Room</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bookings.map(b => (
                                <tr
                                    key={b.id}
                                    className="border-b last:border-0 border-gray-200 dark:border-neutral-800"
                                >
                                    <td className="px-5 py-3 text-gray-900 dark:text-gray-100">{b.user.email}</td>
                                    <td className="px-5 py-3">{b.room.hotel.name}</td>
                                    <td className="px-5 py-3">{b.room.type}</td>
                                    <td className="px-5 py-3">
                                        <StatusBadge status={b.status} />
                                    </td>
                                    <td className="px-5 py-3 font-medium">₹{b.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, tone }) {
    const tones = {
        green: "text-green-600 dark:text-green-400",
        yellow: "text-yellow-600 dark:text-yellow-400",
        red: "text-red-600 dark:text-red-400",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800 p-4"
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className={tones[tone] || "text-blue-600 dark:text-blue-400"} />
                <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        CANCELLED: "bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-gray-400",
    };

    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
}
