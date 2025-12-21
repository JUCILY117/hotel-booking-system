import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminCreateHotel() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        location: "",
        description: "",
    });

    const submit = async e => {
        e.preventDefault();
        await api.post("/hotels", form);
        navigate("/admin/hotels");
    };

    return (
        <form onSubmit={submit} className="max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Hotel</h2>

            {["name", "location", "description"].map(f => (
                <input
                    key={f}
                    placeholder={f}
                    value={form[f]}
                    onChange={e => setForm({ ...form, [f]: e.target.value })}
                    className="border p-2 w-full mb-3"
                    required
                />
            ))}

            <button className="bg-black text-white px-4 py-2 rounded">Create</button>
        </form>
    );
}
