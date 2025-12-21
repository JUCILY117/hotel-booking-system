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
        return <div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatBox label="Total Bookings" value={stats.totalBookings} />
                        <StatBox label="Pending" value={stats.pendingBookings} />
                        <StatBox label="Confirmed" value={stats.confirmedBookings} />
                        <StatBox label="Cancelled" value={stats.cancelledBookings} />
                    </div>
                )}

                {/* Bookings */}
                <h2 className="text-2xl font-semibold mb-4">All Bookings</h2>

                <div className="bg-white border rounded">
                    <table className="w-full text-sm">
                        <thead className="border-b">
                            <tr className="text-left">
                                <th className="p-3">User</th>
                                <th className="p-3">Hotel</th>
                                <th className="p-3">Room</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} className="border-b last:border-0">
                                    <td className="p-3">{b.user.email}</td>
                                    <td className="p-3">{b.room.hotel.name}</td>
                                    <td className="p-3">{b.room.type}</td>
                                    <td className="p-3">{b.status}</td>
                                    <td className="p-3">₹{b.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="bg-white border rounded p-4">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    );
}
