import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CalendarPopover({ value, onSelect }) {
    const [current, setCurrent] = useState(value ? new Date(value) : new Date());

    const days = eachDayOfInterval({
        start: startOfMonth(current),
        end: endOfMonth(current),
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-64 rounded-xl border border-gray-200 dark:border-neutral-800
                 bg-white dark:bg-neutral-900 p-3 shadow-lg"
        >
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrent(subMonths(current, 1))}>
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium">{format(current, "MMMM yyyy")}</span>
                <button onClick={() => setCurrent(addMonths(current, 1))}>
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {days.map(day => {
                    const selected = value && isSameDay(new Date(value), day);

                    return (
                        <button
                            key={day}
                            onClick={() => onSelect(format(day, "yyyy-MM-dd"))}
                            className={`h-8 rounded-md transition
                ${selected ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-neutral-800"}`}
                        >
                            {format(day, "d")}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}
