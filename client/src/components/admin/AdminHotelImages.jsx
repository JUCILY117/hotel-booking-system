import { ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { resolveMediaUrl } from "../../utils/media";

export default function AdminHotelImages({ hotel, onUpdate }) {
    const toast = useToast();
    const [uploading, setUploading] = useState(false);

    const uploadImages = async files => {
        if (!files.length) return;

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append("images", file);
        });

        setUploading(true);
        try {
            const res = await api.post(`/hotels/${hotel.id}/images`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Images uploaded");
            onUpdate(res.data);
        } catch {
            toast.error("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Hotel images</h3>

            {hotel.images?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {hotel.images.map((img, i) => (
                        <div
                            key={i}
                            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200 dark:bg-neutral-800"
                        >
                            <img src={resolveMediaUrl(img)} alt="" className="h-full w-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3">
                <label
                    className="
      inline-flex items-center gap-2
      cursor-pointer
      rounded-xl px-4 py-2
      text-sm font-medium
      bg-gray-100 dark:bg-neutral-800
      hover:bg-gray-200 dark:hover:bg-neutral-700
      transition
    "
                >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                    <span>{uploading ? "Uploading…" : "Upload images"}</span>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        hidden
                        disabled={uploading}
                        onChange={e => uploadImages(e.target.files)}
                    />
                </label>

                <span className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG • multiple allowed</span>
            </div>
        </div>
    );
}
