import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

export default function AdminRoomsPage() {
    const { hotelId } = useParams();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        type: "",
        description: "",
        pricePerNight: "",
        maxGuests: "",
        totalRooms: "",
    });

    const fetchRooms = async () => {
        setLoading(true);
        const res = await api.get(`/rooms/admin/hotel/${hotelId}`);
        setRooms(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, [hotelId]);

    const createRoom = async e => {
        e.preventDefault();

        await api.post("/rooms", {
            ...form,
            hotelId,
            pricePerNight: Number(form.pricePerNight),
            maxGuests: Number(form.maxGuests),
            totalRooms: Number(form.totalRooms),
        });

        setForm({
            type: "",
            description: "",
            pricePerNight: "",
            maxGuests: "",
            totalRooms: "",
        });

        fetchRooms();
    };

    const toggleRoom = async room => {
        if (room.isActive) {
            await api.delete(`/rooms/${room.id}`);
        } else {
            await api.patch(`/rooms/${room.id}/activate`);
        }
        fetchRooms();
    };

    if (loading) {
        return <div className="p-6">Loading rooms...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Rooms</h2>

            <form onSubmit={createRoom} className="mb-6 max-w-md">
                <input
                    placeholder="Type"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="border p-2 w-full mb-2"
                    required
                />

                <input
                    placeholder="Description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="border p-2 w-full mb-2"
                    required
                />

                <input
                    type="number"
                    placeholder="Price per night"
                    value={form.pricePerNight}
                    onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
                    className="border p-2 w-full mb-2"
                    required
                />

                <input
                    type="number"
                    placeholder="Max guests"
                    value={form.maxGuests}
                    onChange={e => setForm({ ...form, maxGuests: e.target.value })}
                    className="border p-2 w-full mb-2"
                    required
                />

                <input
                    type="number"
                    placeholder="Total rooms"
                    value={form.totalRooms}
                    onChange={e => setForm({ ...form, totalRooms: e.target.value })}
                    className="border p-2 w-full mb-3"
                    required
                />

                <button className="bg-black text-white px-4 py-2 rounded">Add room</button>
            </form>

            <div className="space-y-3">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={`border p-4 flex justify-between rounded ${!room.isActive ? "opacity-60" : ""}`}
                    >
                        <div>
                            <p className="font-medium">{room.type}</p>
                            <p className="text-sm text-gray-600">₹{room.pricePerNight} / night</p>
                            <p className="text-xs mt-1">
                                Status:{" "}
                                <span className={room.isActive ? "text-green-600" : "text-red-600"}>
                                    {room.isActive ? "Active" : "Inactive"}
                                </span>
                            </p>
                        </div>

                        <button onClick={() => toggleRoom(room)} className="underline text-sm">
                            {room.isActive ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
