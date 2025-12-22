import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Download,
    FileText,
    Hotel,
    IndianRupee,
    Loader2,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";
import api from "../../api/axios";

const PAGE_SIZE = 6;

function methodIcon(payment) {
    if (payment.method === "CARD" && payment.cardBrand) {
        return <PaymentIcon type={payment.cardBrand.toLowerCase()} format="logo" width={28} />;
    }
    if (payment.method === "UPI") {
        return <img src="https://img.icons8.com/color/48/bhim.png" className="h-6 w-6" />;
    }
    if (payment.method === "PAYPAL") {
        return <img src="https://img.icons8.com/color/48/paypal.png" className="h-6 w-6" />;
    }
    return <CreditCard size={20} />;
}

function nights(checkIn, checkOut) {
    return (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
}

export default function MyPaymentsTab() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        api.get("/payments/me")
            .then(res => setPayments(res.data))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    const totalPages = Math.ceil(payments.length / PAGE_SIZE);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return payments.slice(start, start + PAGE_SIZE);
    }, [payments, page]);

    if (loading) {
        return (
            <div className="h-[40vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    if (selected) {
        const p = selected;
        const failed = p.status === "FAILED";

        return (
            <div className="space-y-4">
                <button
                    onClick={() => setSelected(null)}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <ArrowLeft size={14} />
                    Back to payments
                </button>

                <div className="surface-elevated rounded-2xl p-5 shadow-sm dark:bg-neutral-900">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {methodIcon(p)}
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    {p.method === "CARD" && p.cardBrand ? p.cardBrand : p.method}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(p.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Status */}
                            {failed ? (
                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                                    <XCircle size={14} /> Failed
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                                    <CheckCircle2 size={14} /> Paid
                                </span>
                            )}

                            {/* Invoice */}
                            {!failed && (
                                <a
                                    href={`${import.meta.env.VITE_API_BASE_URL}/api/payments/${p.id}/invoice`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                    inline-flex items-center gap-2
                    px-3 py-1.5 rounded-lg text-sm
                    border border-gray-200
                    text-gray-700
                    hover:bg-gray-50
                    transition
                    dark:border-white/10
                    dark:text-gray-300
                    dark:hover:bg-neutral-800
                "
                                >
                                    <FileText size={14} />
                                    Invoice
                                    <Download size={14} className="opacity-70" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
                        <Info label="Hotel" icon={Hotel}>
                            {p.booking.room.hotel.name}
                        </Info>
                        <Info label="Room type">{p.booking.room.type}</Info>
                        <Info label="Check-in">{new Date(p.booking.checkIn).toLocaleDateString()}</Info>
                        <Info label="Check-out">{new Date(p.booking.checkOut).toLocaleDateString()}</Info>
                        <Info label="Nights">{nights(p.booking.checkIn, p.booking.checkOut)}</Info>
                        <Info label="Amount">₹{p.amount}</Info>
                        <Info label="Booking status">{p.booking.status}</Info>
                        <Info label="Payment ID">{p.id}</Info>
                    </div>
                </div>
            </div>
        );
    }

    if (payments.length === 0) {
        return <div className="text-gray-600 dark:text-gray-400 text-center py-12">No payments yet</div>;
    }

    return (
        <div className="space-y-4">
            {paginated.map(p => {
                const failed = p.status === "FAILED";

                return (
                    <motion.button
                        key={p.id}
                        onClick={() => setSelected(p)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="
                            w-full text-left
                            surface-elevated rounded-2xl
                            border border-gray-200 dark:border-neutral-800
                            p-5
                            transition
                            hover:shadow-md
                            dark:bg-neutral-900
                        "
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {methodIcon(p)}
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        {p.booking.room.hotel.name}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end font-semibold text-gray-900 dark:text-gray-100">
                                    <IndianRupee size={14} />
                                    {p.amount}
                                </div>

                                {failed ? (
                                    <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 justify-end">
                                        <XCircle size={12} /> Failed
                                    </span>
                                ) : (
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 justify-end">
                                        <CheckCircle2 size={12} /> Paid
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.button>
                );
            })}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
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
    );
}

function Info({ label, children, icon: Icon }) {
    return (
        <div className="text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2 text-xs mb-0.5">
                {Icon && <Icon size={12} />}
                {label}
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100">{children}</div>
        </div>
    );
}
