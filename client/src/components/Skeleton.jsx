import { motion } from "framer-motion";

export default function Skeleton({ className }) {
    return (
        <div
            className={`relative overflow-hidden rounded-md
                  bg-gray-200 dark:bg-neutral-800 ${className}`}
        >
            <motion.div
                className="absolute inset-0
                   bg-gradient-to-r
                   from-transparent
                   via-white/60 dark:via-white/10
                   to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
