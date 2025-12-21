import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import DateField from "../components/DateField";
import HotelDetailSkeleton from "../components/HotelDetailSkeleton";
import HotelImageCarousel from "../components/HotelImageCarousel";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resolveMediaUrl } from "../utils/media";

export default function HotelDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [availability, setAvailability] = useState({});
    const toast = useToast();

    useEffect(() => {
        Promise.all([api.get(`/hotels/${id}`), api.get(`/rooms/hotel/${id}`)])
            .then(([hotelRes, roomsRes]) => {
                setHotel(hotelRes.data);
                setRooms(roomsRes.data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const checkRoomAvailability = async roomId => {
        if (!checkIn || !checkOut) {
            toast.info("Select check-in and check-out dates");
            return;
        }

        const res = await api.get(`/bookings/availability/${roomId}`, {
            params: { checkIn, checkOut },
        });

        setAvailability(prev => ({
            ...prev,
            [roomId]: res.data,
        }));
    };

    const bookRoom = async roomId => {
        if (!user) {
            toast.error("Login required to book");
            return;
        }

        try {
            const res = await api.post("/bookings", {
                roomId,
                checkIn,
                checkOut,
            });

            toast.success("Booking created. Redirecting…");
            window.location.href = `/payment/${res.data.id}`;
        } catch {
            toast.error("Booking failed");
        }
    };

    if (loading) return <HotelDetailSkeleton />;

    if (!hotel) {
        return <div className="text-center text-gray-600 dark:text-gray-400 py-20">Hotel not found</div>;
    }

    const images = hotel.images?.map(resolveMediaUrl) || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
            <div className="max-w-6xl mx-auto px-6 py-6 space-y-10">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{hotel.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{hotel.location}</p>
                </div>

                {images.length > 0 && <HotelImageCarousel images={images} />}

                <p className="text-gray-700 dark:text-gray-300 max-w-3xl">{hotel.description}</p>

                <div className="surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 flex flex-wrap gap-4">
                    <DateField label="Check-in" value={checkIn} onChange={e => setCheckIn(e.target.value)} />

                    <DateField label="Check-out" value={checkOut} onChange={e => setCheckOut(e.target.value)} />

                    {/* {message && <p className="w-full text-sm text-blue-600 dark:text-blue-400 mt-2">{message}</p>} */}
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Available rooms</h2>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {rooms.map(room => {
                            const avail = availability[room.id];

                            return (
                                <motion.div
                                    key={room.id}
                                    whileHover={{ y: -4 }}
                                    className="surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 flex flex-col"
                                >
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{room.type}</h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex-1">
                                        {room.description}
                                    </p>

                                    <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        ₹{room.pricePerNight}
                                        <span className="text-sm font-normal text-gray-500"> / night</span>
                                    </div>

                                    <button
                                        onClick={() => checkRoomAvailability(room.id)}
                                        className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Check availability
                                    </button>

                                    {avail && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Available rooms: {avail.availableRooms}
                                        </p>
                                    )}

                                    {avail?.isAvailable && (
                                        <button
                                            onClick={() => bookRoom(room.id)}
                                            className="mt-4 w-full rounded-xl py-2.5
                                 bg-blue-600 text-white font-medium
                                 hover:bg-blue-700 active:scale-[0.98]
                                 dark:bg-blue-500 dark:hover:bg-blue-600
                                 transition"
                                        >
                                            Book now
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
