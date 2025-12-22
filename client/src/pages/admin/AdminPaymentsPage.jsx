import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Hotel,
    IndianRupee,
    Loader2,
    User,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";
import api from "../../api/axios";

function formatDate(date) {
    return new Date(date).toLocaleString();
}

function PaymentMethodIcon({ method, cardBrand }) {
    if (method === "CARD") {
        if (cardBrand === "VISA") {
            return <PaymentIcon type="visa" format="logo" width={28} />;
        }
        if (cardBrand === "MASTERCARD") {
            return <PaymentIcon type="mastercard" format="logo" width={28} />;
        }
        if (cardBrand === "AMEX") {
            return <PaymentIcon type="amex" format="logo" width={28} />;
        }

        return <img src="https://img.icons8.com/color/48/bank-card-back-side.png" className="h-6 w-6" alt="Card" />;
    }

    if (method === "UPI") {
        return <img src="https://img.icons8.com/color/48/bhim.png" className="h-6 w-6" alt="UPI" />;
    }

    if (method === "PAYPAL") {
        return <img src="https://img.icons8.com/color/48/paypal.png" className="h-6 w-6" alt="PayPal" />;
    }

    return <CreditCard size={20} />;
}

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const PAGE_SIZE = 4;
    const [page, setPage] = useState(1);

    useEffect(() => {
        api.get("/payments/admin/all")
            .then(res => setPayments(res.data))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.ceil(payments.length / PAGE_SIZE);

    const paginatedPayments = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return payments.slice(start, start + PAGE_SIZE);
    }, [payments, page]);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Payments</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">All customer payment transactions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedPayments.map(payment => {
                    const isFailed = payment.status === "FAILED";

                    return (
                        <div
                            key={payment.id}
                            className="
                                surface-elevated rounded-2xl p-4
                                transition
                                hover:shadow-md
                                dark:bg-neutral-900
                                dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
                            "
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <PaymentMethodIcon method={payment.method} cardBrand={payment.cardBrand} />
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {payment.method === "CARD" && payment.cardBrand
                                            ? payment.cardBrand
                                            : payment.method}
                                    </span>
                                </div>

                                {isFailed ? (
                                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
                                        <XCircle size={14} />
                                        Failed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                                        <CheckCircle2 size={14} />
                                        Paid
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                <IndianRupee size={18} />
                                {payment.amount}
                            </div>

                            <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <User size={14} />
                                    {payment.booking.user.name} ({payment.booking.user.email})
                                </div>

                                <div className="flex items-center gap-2">
                                    <Hotel size={14} />
                                    {payment.booking.room.hotel.name} · {payment.booking.room.type}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    {formatDate(payment.createdAt)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border text-gray-600 dark:text-gray-400 disabled:opacity-40"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border text-gray-600 dark:text-gray-400 disabled:opacity-40"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {payments.length === 0 && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12">No payments found</div>
            )}
        </div>
    );
}
