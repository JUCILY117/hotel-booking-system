import { motion } from "framer-motion";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Hotel,
    IndianRupee,
    Loader2,
    MapPin,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 3;

export default function MyBookingsTab() {
    const toast = useToast();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    const [page, setPage] = useState(1);

    useEffect(() => {
        api.get("/bookings/me")
            .then(res => setBookings(res.data))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    const cancelBooking = async id => {
        setCancellingId(id);
        try {
            await api.delete(`/bookings/${id}`);
            toast.success("Booking cancelled");

            setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: "CANCELLED" } : b)));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Unable to cancel booking");
        } finally {
            setCancellingId(null);
        }
    };

    const totalPages = Math.ceil(bookings.length / PAGE_SIZE);

    const paginatedBookings = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return bookings.slice(start, start + PAGE_SIZE);
    }, [bookings, page]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center text-gray-600 dark:text-gray-400">
                You have no bookings yet
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-neutral-950 transition-colors">
            <div className="max-w-4xl mx-auto px-6 py-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">My bookings</h1>

                <div className="space-y-4">
                    {paginatedBookings.map(booking => {
                        const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24);

                        const isCancelled = booking.status === "CANCELLED";
                        const isPending = booking.status === "PENDING";

                        return (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="
                                    surface-elevated rounded-2xl
                                    border border-gray-200 dark:border-neutral-800
                                    p-5
                                "
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                                            {booking.room.hotel.name}
                                        </h2>

                                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin size={14} />
                                            {booking.room.hotel.location}
                                        </div>
                                    </div>

                                    <StatusBadge status={booking.status} />
                                </div>

                                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                                    <InfoRow icon={Hotel} label="Room">
                                        {booking.room.type}
                                    </InfoRow>

                                    <InfoRow icon={Calendar} label="Dates">
                                        {new Date(booking.checkIn).toLocaleDateString()} →{" "}
                                        {new Date(booking.checkOut).toLocaleDateString()}
                                    </InfoRow>

                                    <InfoRow icon={Calendar} label="Nights">
                                        {nights}
                                    </InfoRow>

                                    <InfoRow icon={IndianRupee} label="Total">
                                        ₹{booking.totalPrice}
                                    </InfoRow>
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-4">
                                    {isPending && (
                                        <Link
                                            to={`/payment/${booking.id}`}
                                            className="
                                                inline-flex items-center gap-2
                                                text-sm font-medium
                                                text-blue-600 dark:text-blue-400
                                                hover:underline
                                            "
                                        >
                                            <CreditCard size={14} />
                                            Complete payment
                                        </Link>
                                    )}

                                    {!isCancelled ? (
                                        <button
                                            onClick={() => cancelBooking(booking.id)}
                                            disabled={cancellingId === booking.id}
                                            className="
                                                inline-flex items-center gap-2
                                                text-sm font-medium
                                                text-red-600 dark:text-red-400
                                                hover:underline
                                                disabled:opacity-50
                                            "
                                        >
                                            {cancellingId === booking.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <XCircle size={14} />
                                            )}
                                            Cancel booking
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Booking cancelled
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="
                                p-2 rounded-lg
                                border border-gray-200
                                text-gray-600
                                hover:bg-gray-50
                                disabled:opacity-40
                                dark:border-white/10
                                dark:text-gray-400
                                dark:hover:bg-neutral-800
                            "
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="
                                p-2 rounded-lg
                                border border-gray-200
                                text-gray-600
                                hover:bg-gray-50
                                disabled:opacity-40
                                dark:border-white/10
                                dark:text-gray-400
                                dark:hover:bg-neutral-800
                            "
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        CANCELLED: "bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-gray-400",
        PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };

    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
}

function InfoRow({ icon: Icon, label, children }) {
    return (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Icon size={14} />
            <span className="min-w-[70px]">{label}:</span>
            <span className="text-gray-900 dark:text-gray-100">{children}</span>
        </div>
    );
}
