import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function HotelDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [availability, setAvailability] = useState({});
    const [message, setMessage] = useState(null);

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
            setMessage("Select check-in and check-out dates");
            return;
        }

        setMessage(null);

        const res = await api.get(`/bookings/availability/${roomId}`, { params: { checkIn, checkOut } });

        setAvailability(prev => ({
            ...prev,
            [roomId]: res.data,
        }));
    };

    const bookRoom = async roomId => {
        if (!user) {
            setMessage("Login required to book");
            return;
        }

        try {
            const res = await api.post("/bookings", {
                roomId,
                checkIn,
                checkOut,
            });

            const bookingId = res.data.id;
            window.location.href = `/payment/${bookingId}`;
        } catch {
            setMessage("Booking failed");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading hotel...</div>;
    }

    if (!hotel) {
        return <div>Hotel not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-semibold mb-2">{hotel.name}</h1>
                <p className="text-gray-600 mb-4">{hotel.location}</p>
                <p className="mb-6">{hotel.description}</p>

                {hotel.images?.length > 0 && (
                    <div className="flex gap-4 mb-6">
                        {hotel.images.map((img, i) => (
                            <img
                                key={i}
                                src={`http://localhost:5000${img}`}
                                className="w-48 h-32 object-cover rounded"
                            />
                        ))}
                    </div>
                )}

                <div className="flex gap-4 mb-6">
                    <input
                        type="date"
                        value={checkIn}
                        onChange={e => setCheckIn(e.target.value)}
                        className="border px-3 py-2 rounded"
                    />
                    <input
                        type="date"
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                        className="border px-3 py-2 rounded"
                    />
                </div>

                {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}

                <h2 className="text-2xl font-semibold mb-4">Rooms</h2>

                <div className="grid gap-6 sm:grid-cols-2">
                    {rooms.map(room => {
                        const avail = availability[room.id];

                        return (
                            <div key={room.id} className="bg-white border rounded p-4">
                                <h3 className="font-medium">{room.type}</h3>
                                <p className="text-sm text-gray-600 mb-2">{room.description}</p>

                                <p className="text-sm">₹{room.pricePerNight} / night</p>

                                <button
                                    onClick={() => checkRoomAvailability(room.id)}
                                    className="mt-3 text-sm underline"
                                >
                                    Check availability
                                </button>

                                {avail && <div className="mt-2 text-sm">Available rooms: {avail.availableRooms}</div>}

                                {avail?.isAvailable && (
                                    <button
                                        onClick={() => bookRoom(room.id)}
                                        className="mt-3 block bg-black text-white px-3 py-2 text-sm rounded"
                                    >
                                        Book room
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
