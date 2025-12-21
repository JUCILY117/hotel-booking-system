import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Hotel, IndianRupee, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function PaymentPage() {
    const { bookingId } = useParams();
    const toast = useToast();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        api.get("/bookings/me")
            .then(res => {
                setBooking(res.data.find(b => b.id === bookingId) || null);
            })
            .finally(() => setLoading(false));
    }, [bookingId]);

    const pay = async () => {
        if (paying) return;

        setPaying(true);

        try {
            await sleep(1800);

            const res = await api.post("/payments", {
                bookingId,
                method: "CARD",
            });

            toast.success("Payment successful");
            setBooking(res.data.booking);
        } catch {
            toast.error("Payment failed or already attempted");
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center text-gray-600 dark:text-gray-400">
                Booking not found
            </div>
        );
    }

    if (booking.status === "CONFIRMED") {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface-elevated rounded-2xl p-6 max-w-sm w-full text-center"
                >
                    <CheckCircle2 className="mx-auto text-green-500 mb-3" size={36} />
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Booking confirmed</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Payment completed successfully</p>

                    <Link
                        to="/"
                        className="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Go to home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-elevated rounded-2xl w-full max-w-md"
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-3 border-b border-gray-200 dark:border-neutral-800">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complete payment</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Step 3 of 3 · Secure checkout</p>
                </div>

                <div className="px-5 py-4 space-y-3 text-sm">
                    <Row icon={Hotel} label="Hotel">
                        {booking.room.hotel.name}
                    </Row>
                    <Row icon={Hotel} label="Room">
                        {booking.room.type}
                    </Row>

                    <div className="h-px bg-gray-200 dark:bg-neutral-800" />

                    <Row icon={IndianRupee} label="Total amount" bold>
                        ₹{booking.totalPrice}
                    </Row>
                </div>

                <div className="px-5 py-3 border-t border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CreditCard size={16} />
                        <span>Card payment</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Lock size={12} />
                        Secured & encrypted
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <button
                        onClick={pay}
                        disabled={paying}
                        className="
                            w-full mt-3
                            inline-flex items-center justify-center gap-2
                            rounded-xl py-2.5
                            bg-blue-600 text-white font-medium
                            hover:bg-blue-700
                            active:scale-[0.98]
                            disabled:opacity-70
                            transition
                        "
                    >
                        {paying ? (
                            <>
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="inline-flex"
                                >
                                    <Loader2 size={18} />
                                </motion.span>
                                Processing payment…
                            </>
                        ) : (
                            <>
                                <CreditCard size={18} />
                                Pay ₹{booking.totalPrice}
                            </>
                        )}
                    </button>

                    <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 text-center">
                        Do not refresh or close the page while payment is processing
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

function Row({ icon: Icon, label, children, bold }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Icon size={14} />
                <span>{label}</span>
            </div>
            <span className={`${bold ? "font-semibold" : ""} text-gray-900 dark:text-gray-100`}>{children}</span>
        </div>
    );
}
