import { motion } from "framer-motion";
import { Building2, ChevronLeft, ChevronRight, MapPin, Plus, Power, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const PAGE_SIZE = 5;

export default function AdminHotelsPage() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchHotels = async () => {
        setLoading(true);
        const res = await api.get("/hotels/admin/all");
        setHotels(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(hotels.length / PAGE_SIZE));
        if (page > totalPages) setPage(totalPages);
    }, [hotels, page]);

    const toggleHotel = async hotel => {
        if (hotel.isActive) {
            await api.delete(`/hotels/${hotel.id}`);
        } else {
            await api.patch(`/hotels/${hotel.id}/activate`);
        }
        fetchHotels();
    };

    const totalPages = Math.ceil(hotels.length / PAGE_SIZE);

    const paginatedHotels = hotels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (loading) {
        return <div className="py-20 text-center text-gray-500">Loading hotels…</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Hotels</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage properties and rooms</p>
                </div>

                <Link
                    to="/admin/hotels/new"
                    className="
            inline-flex items-center gap-2
            rounded-xl px-4 py-2
            bg-blue-600 text-white text-sm font-medium
            hover:bg-blue-700 transition
          "
                >
                    <Plus size={16} />
                    Add hotel
                </Link>
            </div>

            <div className="space-y-4">
                {paginatedHotels.map(hotel => (
                    <motion.div
                        key={hotel.id}
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
                                    <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
                                    <h2 className="font-medium text-gray-900 dark:text-gray-100">{hotel.name}</h2>
                                    <StatusBadge active={hotel.isActive} />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin size={14} />
                                    {hotel.location}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/admin/hotels/${hotel.id}`}
                                    className="
                    inline-flex items-center gap-1.5
                    rounded-md px-3 py-1.5
                    text-sm text-gray-700 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-neutral-800
                    transition
                  "
                                >
                                    <Settings size={14} />
                                    Rooms
                                </Link>

                                <button
                                    onClick={() => toggleHotel(hotel)}
                                    className={`
                    inline-flex items-center gap-1.5
                    rounded-md px-3 py-1.5 text-sm font-medium transition
                    ${
                        hotel.isActive
                            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }
                  `}
                                >
                                    <Power size={14} />
                                    {hotel.isActive ? "Deactivate" : "Activate"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="
              p-2 rounded-md border
              border-gray-300 dark:border-neutral-700
              disabled:opacity-40
              hover:bg-gray-100 dark:hover:bg-neutral-800
              transition
            "
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="
              p-2 rounded-md border
              border-gray-300 dark:border-neutral-700
              disabled:opacity-40
              hover:bg-gray-100 dark:hover:bg-neutral-800
              transition
            "
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
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
