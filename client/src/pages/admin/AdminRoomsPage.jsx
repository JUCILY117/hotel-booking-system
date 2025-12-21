import { motion } from "framer-motion";
import { BedDouble, IndianRupee, Plus, Power, Users, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

export default function AdminRoomsPage() {
    const { hotelId } = useParams();
    const toast = useToast();

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

        try {
            await api.post("/rooms", {
                ...form,
                hotelId,
                pricePerNight: Number(form.pricePerNight),
                maxGuests: Number(form.maxGuests),
                totalRooms: Number(form.totalRooms),
            });

            toast.success("Room added");
            setForm({
                type: "",
                description: "",
                pricePerNight: "",
                maxGuests: "",
                totalRooms: "",
            });
            fetchRooms();
        } catch {
            toast.error("Failed to create room");
        }
    };

    const toggleRoom = async room => {
        try {
            if (room.isActive) {
                await api.delete(`/rooms/${room.id}`);
            } else {
                await api.patch(`/rooms/${room.id}/activate`);
            }
            fetchRooms();
        } catch {
            toast.error("Unable to update room");
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-gray-500">Loading rooms…</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Rooms</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage room types and availability</p>
            </div>

            <form
                onSubmit={createRoom}
                className="
          surface-elevated rounded-2xl
          border border-gray-200 dark:border-neutral-800
          p-5 space-y-4
        "
            >
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Add new room</h2>

                <div className="grid sm:grid-cols-2 gap-3">
                    <Field
                        icon={BedDouble}
                        placeholder="Room type (e.g. Deluxe)"
                        value={form.type}
                        onChange={v => setForm({ ...form, type: v })}
                    />

                    <Field
                        icon={IndianRupee}
                        type="number"
                        placeholder="Price per night"
                        value={form.pricePerNight}
                        onChange={v => setForm({ ...form, pricePerNight: v })}
                    />

                    <Field
                        icon={Users}
                        type="number"
                        placeholder="Max guests"
                        value={form.maxGuests}
                        onChange={v => setForm({ ...form, maxGuests: v })}
                    />

                    <Field
                        icon={Warehouse}
                        type="number"
                        placeholder="Total rooms"
                        value={form.totalRooms}
                        onChange={v => setForm({ ...form, totalRooms: v })}
                    />
                </div>

                <Field
                    placeholder="Short description"
                    value={form.description}
                    onChange={v => setForm({ ...form, description: v })}
                />

                <button
                    className="
            inline-flex items-center gap-2
            rounded-xl px-4 py-2
            bg-blue-600 text-white text-sm font-medium
            hover:bg-blue-700 active:scale-[0.98]
            transition
          "
                >
                    <Plus size={16} />
                    Add room
                </button>
            </form>

            <div className="space-y-4">
                {rooms.map(room => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="
              surface-elevated rounded-2xl
              border border-gray-200 dark:border-neutral-800
              p-5
            "
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{room.type}</h3>
                                    <StatusBadge active={room.isActive} />
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400">{room.description}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    <span>₹{room.pricePerNight} / night</span>
                                    <span>{room.maxGuests} guests</span>
                                    <span>{room.totalRooms} rooms</span>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleRoom(room)}
                                className={`
                  inline-flex items-center gap-1.5
                  rounded-md px-3 py-1.5 text-sm font-medium
                  transition
                  ${
                      room.isActive
                          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  }
                `}
                            >
                                <Power size={14} />
                                {room.isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function Field({ icon: Icon, value, onChange, placeholder, type = "text" }) {
    return (
        <div className="flex gap-2 items-center input">
            {Icon && <Icon size={16} className="text-gray-400" />}
            <input
                required
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm"
            />
        </div>
    );
}

function StatusBadge({ active }) {
    return (
        <span
            className={`
        px-2 py-0.5 rounded-full text-xs font-medium
        ${
            active
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
        }
      `}
        >
            {active ? "Active" : "Inactive"}
        </span>
    );
}
