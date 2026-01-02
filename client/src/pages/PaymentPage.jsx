import { Check, CheckCircle2, Hotel, IndianRupee, Loader2, Lock, Plus, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function detectCardBrand(num) {
    if (/^655590/.test(num)) return null;
    if (/^4/.test(num)) return "VISA";
    if (/^5[1-5]/.test(num)) return "MASTERCARD";
    if (/^2(?:2[2-9]|[3-6]\d|7[01]|720)/.test(num)) return "MASTERCARD";
    if (/^3[47]/.test(num)) return "AMEX";
    if (/^6(?:011|5)/.test(num)) return "DISCOVER";
    if (/^6(?:011|5|198)/.test(num)) return "DISCOVER";
    if (/^3(?:0[0-5]|[68][0-9])/.test(num)) return "DINERS";
    if (/^35(2[89]|[3-8][0-9])/.test(num)) return "JCB";
    if (/^62/.test(num)) return "UNIONPAY";
    return null;
}

function luhnCheck(num) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i]);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

function formatCardNumber(v, brand) {
    const clean = v.replace(/\D/g, "");
    let max = 16;
    if (brand === "AMEX") max = 15;
    if (brand === "UNIONPAY") max = 19;
    const sliced = clean.slice(0, max);
    if (brand === "AMEX") {
        return sliced.replace(/(\d{4})(\d{6})?(\d{5})?/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
    } else if (brand === "UNIONPAY") {
        return sliced.replace(/(.{4})/g, "$1 ").trim();
    }
    return sliced.replace(/(.{4})/g, "$1 ").trim();
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
    const [detectingBrand, setDetectingBrand] = useState(false);
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardTouched, setCardTouched] = useState(false);

    const [upiId, setUpiId] = useState("");
    const [upiVerifying, setUpiVerifying] = useState(false);
    const [upiVerified, setUpiVerified] = useState(false);

    const [paypalEmail, setPaypalEmail] = useState("");
    const [paypalAdding, setPaypalAdding] = useState(false);
    const [paypalAdded, setPaypalAdded] = useState(false);

    useEffect(() => {
        api.get("/bookings/me")
            .then(res => setBooking(res.data.find(b => b.id === bookingId) || null))
            .finally(() => setLoading(false));
    }, [bookingId]);

    useEffect(() => {
        const clean = cardNumber.replace(/\s/g, "");
        if (clean.length < 4) {
            setCardBrand(null);
            setDetectingBrand(false);
            return;
        }
        setDetectingBrand(true);
        const t = setTimeout(() => {
            setCardBrand(detectCardBrand(clean));
            setDetectingBrand(false);
            setCardTouched(true);
        }, 600);
        return () => clearTimeout(t);
    }, [cardNumber]);

    const cardValid = useMemo(() => {
        if (!cardBrand) return false;

        const num = cardNumber.replace(/\s/g, "");

        const validLengths = {
            VISA: [13, 16],
            MASTERCARD: [16],
            AMEX: [15],
            DISCOVER: [16],
            DINERS: [14, 16],
            JCB: [16],
            UNIONPAY: [16, 19],
            BCCARD: [16],
        };
        if (!validLengths[cardBrand]?.includes(num.length)) return false;

        if (!luhnCheck(num)) return false;

        const [mm, yy] = expiry.split(" / ").map(Number);
        if (!mm || !yy || mm < 1 || mm > 12) return false;
        const now = new Date();
        const exp = new Date(2000 + yy, mm - 1, 1);
        if (exp < new Date(now.getFullYear(), now.getMonth(), 1)) return false;

        const cvvLength = cardBrand === "AMEX" ? 4 : 3;
        if (cvv.length !== cvvLength) return false;

        return true;
    }, [cardBrand, cardNumber, expiry, cvv]);

    useEffect(() => {
        if (!vpaRegex.test(upiId)) {
            setUpiVerified(false);
            setUpiVerifying(false);
            return;
        }
        setUpiVerifying(true);
        const t = setTimeout(() => {
            setUpiVerifying(false);
            setUpiVerified(true);
        }, 900);
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
            <div className="surface-elevated rounded-2xl w-full max-w-md shadow-sm dark:bg-neutral-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
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
                            className={`rounded-xl px-3 py-2 text-sm flex gap-2 justify-center items-center transition ${
                                paymentMethod === m.k
                                    ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-neutral-800 dark:text-blue-300"
                                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800/60"
                            }`}
                        >
                            <img src={m.icon} className="h-5 w-5" />
                            {m.t}
                        </button>
                    ))}
                </div>

                {paymentMethod === "CARD" && (
                    <div className="px-5 space-y-3 text-xs">
                        <div className="text-gray-500 dark:text-gray-400">
                            Use demo cards for testing payments.{" "}
                            <a
                                href="https://github.com/JUCILY117/hotel-booking-system?tab=readme-ov-file#-test-cards-mock-payments"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                See test card list
                            </a>
                            .
                        </div>
                        <div className="relative">
                            <input
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value, cardBrand))}
                                placeholder="0000 0000 0000 0000"
                                className={`w-full rounded-xl px-3 py-2 pr-12 bg-transparent border text-gray-900 placeholder:text-gray-400 focus:outline-none
                                    dark:text-gray-100 dark:placeholder:text-gray-500
                                    ${cardTouched && cardBrand === null ? "border-red-500 dark:border-red-400" : ""}
                                    ${
                                        cardBrand
                                            ? "border-green-500 dark:border-green-400"
                                            : "border-gray-300 dark:border-white/10"
                                    }
                                `}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {detectingBrand && <Loader2 size={16} className="animate-spin" />}
                                {!detectingBrand && cardBrand && (
                                    <PaymentIcon type={cardBrand.toLowerCase()} format="logo" width={36} />
                                )}
                                {cardTouched && !cardBrand && !detectingBrand && (
                                    <XCircle size={16} className="text-red-500" />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                value={expiry}
                                onChange={e => setExpiry(formatExpiry(e.target.value))}
                                placeholder="mm / yy"
                                className="rounded-xl px-3 py-2 bg-transparent border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:border-white/10 dark:placeholder:text-gray-500"
                            />
                            <input
                                value={cvv}
                                onChange={e =>
                                    setCvv(e.target.value.replace(/\D/g, "").slice(0, cardBrand === "AMEX" ? 4 : 3))
                                }
                                placeholder="cvv"
                                className="rounded-xl px-3 py-2 bg-transparent border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:border-white/10 dark:placeholder:text-gray-500"
                            />
                        </div>
                        <div className="flex gap-2 mb-2 justify-start">
                            {["VISA", "MASTERCARD", "AMEX", "DISCOVER", "DINERS", "JCB", "UNIONPAY"].map(brand => (
                                <PaymentIcon
                                    key={brand}
                                    type={brand.toLowerCase()}
                                    format="flatRounded"
                                    width={30}
                                    className="opacity-70 pl-1"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {paymentMethod === "UPI" && (
                    <div className="px-5 space-y-3 text-xs">
                        <input
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            placeholder="example@upi"
                            className="w-full rounded-xl px-3 py-2 bg-transparent border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:border-white/10 dark:placeholder:text-gray-500"
                        />
                        {upiVerifying && (
                            <p className="flex items-center gap-1 text-blue-500">
                                <Loader2 size={12} className="animate-spin" /> Verifying UPI
                            </p>
                        )}
                        {upiVerified && <p className="text-green-500">UPI verified</p>}
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
                                    className="flex-1 rounded-xl px-3 py-2 bg-transparent border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:border-white/10 dark:placeholder:text-gray-500"
                                />
                                <button
                                    onClick={async () => {
                                        if (!emailRegex.test(paypalEmail)) return;
                                        setPaypalAdding(true);
                                        await sleep(800);
                                        setPaypalAdding(false);
                                        setPaypalAdded(true);
                                    }}
                                    className="rounded-xl px-3 bg-gray-100 dark:bg-neutral-800"
                                >
                                    {paypalAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-50 dark:bg-neutral-800">
                                <img src="https://img.icons8.com/color/48/paypal.png" className="h-5 w-5" />
                                <span>{paypalEmail}</span>
                                <Check size={16} className="text-green-500 ml-auto" />
                            </div>
                        )}
                    </div>
                )}

                <div className="px-5 pb-5 mt-4">
                    <button
                        onClick={pay}
                        disabled={!canPay || paying}
                        className={`w-full rounded-xl py-2.5 font-medium transition ${
                            canPay ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-400 cursor-not-allowed"
                        }`}
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
