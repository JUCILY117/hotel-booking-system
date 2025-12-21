import { Calendar } from "lucide-react";
import { useState } from "react";
import CalendarPopover from "./CalendarPopover";

export default function DateField({ label, value, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative flex flex-col gap-1">
            <label className="text-xs text-gray-500">{label}</label>

            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between gap-3
                   px-3 py-2 rounded-lg border
                   border-gray-300 dark:border-neutral-700
                   bg-white dark:bg-neutral-900
                   text-gray-900 dark:text-gray-100
                   hover:border-gray-400 dark:hover:border-neutral-500
                   transition"
            >
                <span className={value ? "" : "text-gray-400"}>{value || "Select date"}</span>
                <Calendar size={16} />
            </button>

            {open && (
                <div className="absolute top-full mt-2 z-50">
                    <CalendarPopover
                        value={value}
                        onSelect={date => {
                            onChange({ target: { value: date } });
                            setOpen(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
