import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminHotelsPage() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHotels = async () => {
        setLoading(true);
        const res = await api.get("/hotels/admin/all");
        setHotels(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const toggleHotel = async hotel => {
        if (hotel.isActive) {
            await api.delete(`/hotels/${hotel.id}`);
        } else {
            await api.patch(`/hotels/${hotel.id}/activate`);
        }
        fetchHotels();
    };

    if (loading) {
        return <div className="p-6">Loading hotels...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Hotels</h2>
                <Link to="/admin/hotels/new" className="underline">
                    Add hotel
                </Link>
            </div>

            <div className="space-y-3">
                {hotels.map(hotel => (
                    <div
                        key={hotel.id}
                        className={`border rounded p-4 flex justify-between ${!hotel.isActive ? "opacity-60" : ""}`}
                    >
                        <div>
                            <p className="font-medium">{hotel.name}</p>
                            <p className="text-sm text-gray-600">{hotel.location}</p>
                            <p className="text-xs mt-1">
                                Status:{" "}
                                <span className={hotel.isActive ? "text-green-600" : "text-red-600"}>
                                    {hotel.isActive ? "Active" : "Inactive"}
                                </span>
                            </p>
                        </div>

                        <div className="flex gap-4 text-sm items-center">
                            <Link to={`/admin/hotels/${hotel.id}`} className="underline">
                                Manage rooms
                            </Link>

                            <button onClick={() => toggleHotel(hotel)} className="underline">
                                {hotel.isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
