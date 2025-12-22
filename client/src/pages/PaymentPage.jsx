import { Check, CheckCircle2, Hotel, IndianRupee, Loader2, Lock, Plus, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function detectCardBrand(num) {
    if (/^4/.test(num)) return "VISA";
    if (/^5[1-5]/.test(num)) return "MASTERCARD";
    if (/^3[47]/.test(num)) return "AMEX";
    return null;
}

function formatCardNumber(v) {
    return v
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
}

function formatExpiry(v) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)} / ${d.slice(2)}`;
}

const vpaRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PaymentPage() {
    const { bookingId } = useParams();
    const toast = useToast();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState("CARD");

    const [cardNumber, setCardNumber] = useState("");
    const [cardBrand, setCardBrand] = useState(null);
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardTouched, setCardTouched] = useState(false);

    const [upiId, setUpiId] = useState("");
    const [upiVerified, setUpiVerified] = useState(false);

    const [paypalEmail, setPaypalEmail] = useState("");
    const [paypalAdded, setPaypalAdded] = useState(false);

    useEffect(() => {
        api.get("/bookings/me")
            .then(res => setBooking(res.data.find(b => b.id === bookingId) || null))
            .finally(() => setLoading(false));
    }, [bookingId]);

    useEffect(() => {
        if (!cardNumber) {
            setCardBrand(null);
            return;
        }
        const t = setTimeout(() => {
            setCardBrand(detectCardBrand(cardNumber.replace(/\s/g, "")));
            setCardTouched(true);
        }, 300);
        return () => clearTimeout(t);
    }, [cardNumber]);

    const cardValid = cardBrand && cardNumber.replace(/\s/g, "").length >= 15 && expiry.length === 7 && cvv.length >= 3;

    useEffect(() => {
        if (!vpaRegex.test(upiId)) {
            setUpiVerified(false);
            return;
        }
        const t = setTimeout(() => setUpiVerified(true), 800);
        return () => clearTimeout(t);
    }, [upiId]);

    const canPay = useMemo(() => {
        if (paymentMethod === "CARD") return cardValid;
        if (paymentMethod === "UPI") return upiVerified;
        if (paymentMethod === "PAYPAL") return paypalAdded;
        return false;
    }, [paymentMethod, cardValid, upiVerified, paypalAdded]);

    const pay = async () => {
        if (!canPay || paying) return;
        setPaying(true);
        try {
            await sleep(1500);
            await api.post("/payments", {
                bookingId,
                method: paymentMethod,
                cardBrand: paymentMethod === "CARD" ? cardBrand : null,
            });
            toast.success("Payment successful");
            setBooking(b => ({ ...b, status: "CONFIRMED" }));
        } catch {
            toast.error("Payment failed");
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    if (!booking) {
        return <div className="h-[60vh] flex items-center justify-center">Booking not found</div>;
    }

    if (booking.status === "CONFIRMED") {
        return (
            <div className="h-[60vh] flex items-center justify-center px-4">
                <div className="text-center space-y-2">
                    <CheckCircle2 size={44} className="mx-auto text-green-500" />

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Payment confirmed successfully
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400">Your booking has been completed</p>

                    <a
                        href="/"
                        className="inline-block mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Go back to home
                    </a>
                </div>
            </div>
        );
    }

    const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24);

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
            <div
                className="
          surface-elevated rounded-2xl w-full max-w-md
          shadow-sm
          dark:bg-neutral-900
          dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        "
            >
                <div className="px-5 py-4 space-y-3 text-sm">
                    <Row icon={Hotel} label="Hotel">
                        {booking.room.hotel.name}
                    </Row>
                    <Row icon={Hotel} label="Room">
                        {booking.room.type}
                    </Row>
                    <Row icon={Hotel} label="Nights">
                        {nights}
                    </Row>
                    <Row icon={IndianRupee} label="Total" bold>
                        ₹{booking.totalPrice}
                    </Row>
                </div>

                <div className="mx-5 h-px bg-gray-200 dark:bg-white/5" />

                <div className="px-5 py-3 grid grid-cols-3 gap-2">
                    {[
                        { k: "CARD", icon: "https://img.icons8.com/color/48/bank-card-back-side.png", t: "Card" },
                        { k: "UPI", icon: "https://img.icons8.com/color/48/bhim.png", t: "UPI" },
                        { k: "PAYPAL", icon: "https://img.icons8.com/color/48/paypal.png", t: "PayPal" },
                    ].map(m => (
                        <button
                            key={m.k}
                            onClick={() => setPaymentMethod(m.k)}
                            className={`
                rounded-xl px-3 py-2 text-sm flex gap-2 justify-center items-center transition
                ${
                    paymentMethod === m.k
                        ? `
                    bg-blue-50 text-blue-700 shadow-sm
                    hover:shadow
                    dark:bg-neutral-800
                    dark:text-blue-300
                    dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]
                  `
                        : `
                    text-gray-700 hover:bg-gray-50
                    dark:text-gray-400 dark:hover:bg-neutral-800/60
                  `
                }
              `}
                        >
                            <img src={m.icon} className="h-5 w-5" />
                            {m.t}
                        </button>
                    ))}
                </div>

                {paymentMethod === "CARD" && (
                    <div className="px-5 space-y-3 text-xs">
                        <div className="flex gap-2">
                            <PaymentIcon type="visa" width={28} />
                            <PaymentIcon type="mastercard" width={28} />
                            <PaymentIcon type="amex" width={28} />
                        </div>

                        <div className="relative">
                            <input
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                placeholder="0000 0000 0000 0000"
                                className={`
                  w-full rounded-xl px-3 py-2 pr-10
                  bg-transparent text-gray-900 placeholder:text-gray-400
                  border border-gray-300 focus:outline-none focus:border-blue-500
                  dark:bg-neutral-900 dark:text-gray-100 dark:placeholder:text-gray-500
                  dark:border-white/10 dark:focus:border-blue-400
                  ${cardTouched && !cardBrand ? "border-red-500 dark:border-red-400" : ""}
                  ${cardBrand ? "border-green-500 dark:border-green-400" : ""}
                `}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {cardTouched && !cardBrand && <XCircle size={16} className="text-red-500" />}
                                {cardBrand && <PaymentIcon type={cardBrand.toLowerCase()} format="logo" width={40} />}
                            </div>
                        </div>

                        {cardTouched && !cardBrand && <p className="text-red-500">Unsupported card</p>}

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                value={expiry}
                                onChange={e => setExpiry(formatExpiry(e.target.value))}
                                placeholder="mm / yy"
                                className="rounded-xl px-3 py-2 bg-transparent text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500 dark:bg-neutral-900 dark:text-gray-100 dark:border-white/10 dark:focus:border-blue-400"
                            />
                            <input
                                value={cvv}
                                onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="cvv"
                                className="rounded-xl px-3 py-2 bg-transparent text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500 dark:bg-neutral-900 dark:text-gray-100 dark:border-white/10 dark:focus:border-blue-400"
                            />
                        </div>
                    </div>
                )}

                {paymentMethod === "UPI" && (
                    <div className="px-5 space-y-3 text-xs">
                        <input
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            placeholder="example@upi"
                            className="w-full rounded-xl px-3 py-2 bg-transparent text-gray-900 border border-gray-300 dark:bg-neutral-900 dark:text-gray-100 dark:border-white/10"
                        />
                        <div className="flex gap-4">
                            <img src="https://img.icons8.com/color/48/google-pay.png" className="h-6 w-6" />
                            <img src="https://img.icons8.com/color/48/phone-pe.png" className="h-6 w-6" />
                            <img src="https://img.icons8.com/color/48/paytm.png" className="h-6 w-6" />
                        </div>
                        {upiVerified && <p className="text-green-600 dark:text-green-400">UPI verified</p>}
                    </div>
                )}

                {paymentMethod === "PAYPAL" && (
                    <div className="px-5 space-y-3 text-xs">
                        {!paypalAdded ? (
                            <div className="flex gap-2">
                                <input
                                    value={paypalEmail}
                                    onChange={e => setPaypalEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="flex-1 rounded-xl px-3 py-2 bg-transparent text-gray-900 border border-gray-300 dark:bg-neutral-900 dark:text-gray-100 dark:border-white/10"
                                />
                                <button
                                    onClick={() => emailRegex.test(paypalEmail) && setPaypalAdded(true)}
                                    className="rounded-xl px-3 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-50 dark:bg-neutral-800">
                                <img src="https://img.icons8.com/color/48/paypal.png" className="h-5 w-5" />
                                <span className="text-sm">{paypalEmail}</span>
                                <Check size={16} className="text-green-500 ml-auto" />
                            </div>
                        )}
                    </div>
                )}

                <div className="px-5 pb-5 mt-4">
                    <button
                        onClick={pay}
                        disabled={!canPay || paying}
                        className={`
              w-full rounded-xl py-2.5 font-medium transition
              ${
                  canPay
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }
            `}
                    >
                        {paying ? <Loader2 className="animate-spin mx-auto" /> : `Pay ₹${booking.totalPrice}`}
                    </button>

                    <p className="mt-2 flex justify-center gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                        <Lock size={12} /> Secured · Trusted checkout
                    </p>
                </div>
            </div>
        </div>
    );
}

function Row({ icon: Icon, label, children, bold }) {
    return (
        <div className="flex justify-between">
            <span className="flex gap-2 text-gray-600 dark:text-gray-400">
                <Icon size={14} /> {label}
            </span>
            <span className={`${bold ? "font-semibold" : ""} text-gray-900 dark:text-gray-100`}>{children}</span>
        </div>
    );
}
