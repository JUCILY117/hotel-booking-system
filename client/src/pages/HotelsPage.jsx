import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function HotelsPage() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/hotels")
            .then(res => setHotels(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading hotels...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-semibold mb-6">Hotels</h1>

            {hotels.length === 0 && <p className="text-gray-600">No hotels available.</p>}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hotels.map(hotel => (
                    <Link
                        key={hotel.id}
                        to={`/hotels/${hotel.id}`}
                        className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow transition"
                    >
                        <h2 className="text-xl font-medium mb-1">{hotel.name}</h2>
                        <p className="text-sm text-gray-600 mb-2">{hotel.location}</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{hotel.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
