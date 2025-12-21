import { Building2, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "../../api/axios";
import AdminHotelImages from "../../components/admin/AdminHotelImages";
import { useToast } from "../../context/ToastContext";

export default function AdminCreateHotel() {
    const toast = useToast();

    const [createdHotel, setCreatedHotel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [amenityInput, setAmenityInput] = useState("");

    const [form, setForm] = useState({
        name: "",
        location: "",
        description: "",
        amenities: [],
    });

    const addAmenity = () => {
        if (!amenityInput.trim()) return;
        setForm(f => ({
            ...f,
            amenities: [...f.amenities, amenityInput.trim()],
        }));
        setAmenityInput("");
    };

    const submit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/hotels", form);
            setCreatedHotel(res.data);
            toast.success("Hotel created. Add images below.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create hotel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <form
                onSubmit={submit}
                className="
          surface-elevated rounded-2xl
          border border-gray-200 dark:border-neutral-800
          p-6 space-y-5
        "
            >
                <h1 className="text-lg font-semibold">Create hotel</h1>

                <Field
                    icon={Building2}
                    label="Hotel name"
                    value={form.name}
                    onChange={v => setForm({ ...form, name: v })}
                    disabled={!!createdHotel}
                />

                <Field
                    icon={MapPin}
                    label="Location"
                    value={form.location}
                    onChange={v => setForm({ ...form, location: v })}
                    disabled={!!createdHotel}
                />

                <Field
                    label="Description"
                    textarea
                    value={form.description}
                    onChange={v => setForm({ ...form, description: v })}
                    disabled={!!createdHotel}
                />

                <div>
                    <label className="text-sm font-medium">Amenities</label>
                    <div className="flex gap-2 mt-2">
                        <input
                            value={amenityInput}
                            onChange={e => setAmenityInput(e.target.value)}
                            placeholder="e.g. Free Wi-Fi"
                            className="flex-1 input"
                            disabled={!!createdHotel}
                        />
                        <button type="button" onClick={addAmenity} className="btn-secondary" disabled={!!createdHotel}>
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {form.amenities.map((a, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 text-sm"
                            >
                                {a}
                                {!createdHotel && (
                                    <button
                                        onClick={() =>
                                            setForm(f => ({
                                                ...f,
                                                amenities: f.amenities.filter((_, x) => x !== i),
                                            }))
                                        }
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {!createdHotel && (
                    <button
                        disabled={loading}
                        className="
              w-full rounded-xl py-2.5
              bg-blue-600 text-white font-medium
              hover:bg-blue-700
              disabled:opacity-60
            "
                    >
                        {loading ? "Creating…" : "Create hotel"}
                    </button>
                )}
            </form>

            {createdHotel && <AdminHotelImages hotel={createdHotel} onUpdate={setCreatedHotel} />}
        </div>
    );
}

function Field({ icon: Icon, label, value, onChange, textarea, disabled }) {
    const Comp = textarea ? "textarea" : "input";

    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <div className="mt-1 flex gap-2 input">
                {Icon && <Icon size={16} className="text-gray-400 mt-1" />}
                <Comp
                    required
                    disabled={disabled}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={textarea ? 3 : undefined}
                    className="flex-1 bg-transparent outline-none resize-none"
                />
            </div>
        </div>
    );
}
