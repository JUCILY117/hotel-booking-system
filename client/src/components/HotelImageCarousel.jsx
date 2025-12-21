import { motion } from "framer-motion";
import { useState } from "react";

export default function HotelImageCarousel({ images }) {
    const [active, setActive] = useState(0);

    return (
        <div className="space-y-3">
            <motion.div
                key={active}
                initial={{ opacity: 0.9, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="
          relative
          h-[320px] sm:h-[360px]
          overflow-hidden
          rounded-2xl
          border border-gray-200 dark:border-neutral-800
          bg-gray-100 dark:bg-neutral-900
        "
            >
                <img
                    src={images[active]}
                    className="
            h-full w-full
            object-cover
            select-none
          "
                    draggable={false}
                />
            </motion.div>

            <div className="flex gap-3 overflow-x-auto">
                {images.map((img, i) => {
                    const isActive = i === active;

                    return (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`
                relative
                h-14 w-20 sm:h-16 sm:w-24
                shrink-0
                overflow-hidden
                rounded-lg
                border
                transition
                ${
                    isActive
                        ? "border-blue-500 ring-2 ring-blue-500/40"
                        : "border-gray-200 dark:border-neutral-700 hover:opacity-80"
                }
              `}
                        >
                            <img src={img} className="h-full w-full object-cover" draggable={false} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
