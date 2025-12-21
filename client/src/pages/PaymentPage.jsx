import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

export default function PaymentPage() {
    const { bookingId } = useParams();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        api.get("/bookings/me")
            .then(res => {
                const b = res.data.find(x => x.id === bookingId);
                setBooking(b || null);
            })
            .finally(() => setLoading(false));
    }, [bookingId]);

    const pay = async () => {
        setPaying(true);
        setMessage(null);

        try {
            const res = await api.post("/payments", {
                bookingId,
                method: "CARD",
            });
            setMessage(res.data.message);
            setBooking(res.data.booking);
        } catch (err) {
            setMessage("Payment failed or already attempted");
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading payment...</div>;
    }

    if (!booking) {
        return <div className="min-h-screen flex items-center justify-center">Booking not found.</div>;
    }

    if (booking.status === "CONFIRMED") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="border p-6 rounded text-center">
                    <h1 className="text-xl mb-2">Booking Confirmed</h1>
                    <p className="mb-4">Your booking is confirmed.</p>
                    <Link to="/" className="underline">
                        Go to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="border p-6 rounded w-full max-w-sm">
                <h1 className="text-xl mb-4">Complete Payment</h1>

                <p className="text-sm mb-2">Hotel: {booking.room.hotel.name}</p>
                <p className="text-sm mb-2">Room: {booking.room.type}</p>
                <p className="text-sm mb-4">Amount: ₹{booking.totalPrice}</p>

                <button onClick={pay} disabled={paying} className="w-full bg-black text-white py-2 rounded text-sm">
                    {paying ? "Processing..." : "Pay now"}
                </button>

                {message && <p className="mt-4 text-sm">{message}</p>}
            </div>
        </div>
    );
}
