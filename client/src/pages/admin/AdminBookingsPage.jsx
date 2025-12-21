import { motion } from "framer-motion";
import { Calendar, CheckCircle2, IndianRupee, Loader2, Mail, MapPin, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "CANCELLED"];

export default function AdminBookingsPage() {
    const toast = useToast();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("ALL");
    const [actionId, setActionId] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get("/bookings/admin/all", {
                params: status !== "ALL" ? { status } : {},
            });
            setBookings(res.data);
        } catch {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [status]);

    const confirmBooking = async id => {
        setActionId(id);
        try {
            await api.post(`/bookings/admin/confirm/${id}`);
            toast.success("Booking confirmed");
            fetchBookings();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Unable to confirm booking");
        } finally {
            setActionId(null);
        }
    };

    const cancelBooking = async id => {
        setActionId(id);
        try {
            await api.delete(`/bookings/admin/cancel/${id}`);
            toast.success("Booking cancelled");
            fetchBookings();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Unable to cancel booking");
        } finally {
            setActionId(null);
        }
    };

    if (loading) {
        return (
            <div className="py-24 flex justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Bookings</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage all bookings</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition
              ${
                  status === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }
            `}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {bookings.length === 0 ? (
                <div className="py-20 text-center text-gray-600 dark:text-gray-400">No bookings found</div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => {
                        const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24);

                        const pending = booking.status === "PENDING";

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
                                <div className="flex items-start justify-between gap-4">
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

                                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                    <InfoRow icon={Mail}>{booking.user.email}</InfoRow>

                                    <InfoRow icon={Calendar}>
                                        {new Date(booking.checkIn).toLocaleDateString()} →{" "}
                                        {new Date(booking.checkOut).toLocaleDateString()} ({nights} nights)
                                    </InfoRow>

                                    <InfoRow icon={IndianRupee}>₹{booking.totalPrice}</InfoRow>
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                    {pending && (
                                        <button
                                            disabled={actionId === booking.id}
                                            onClick={() => confirmBooking(booking.id)}
                                            className="
                        inline-flex items-center gap-2
                        rounded-md px-3 py-1.5
                        text-sm font-medium
                        text-green-600 dark:text-green-400
                        hover:bg-green-50 dark:hover:bg-green-900/20
                        transition
                      "
                                        >
                                            {actionId === booking.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={14} />
                                            )}
                                            Confirm
                                        </button>
                                    )}

                                    {booking.status !== "CANCELLED" && (
                                        <button
                                            disabled={actionId === booking.id}
                                            onClick={() => cancelBooking(booking.id)}
                                            className="
                        inline-flex items-center gap-2
                        rounded-md px-3 py-1.5
                        text-sm font-medium
                        text-red-600 dark:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-900/20
                        transition
                      "
                                        >
                                            {actionId === booking.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <XCircle size={14} />
                                            )}
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        CANCELLED: "bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-gray-400",
    };

    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
}

function InfoRow({ icon: Icon, children }) {
    return (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Icon size={14} />
            <span className="text-gray-900 dark:text-gray-100">{children}</span>
        </div>
    );
}
