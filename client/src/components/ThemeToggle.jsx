import { motion } from "framer-motion";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const options = [
    { value: "light", Icon: Sun },
    { value: "system", Icon: Laptop },
    { value: "dark", Icon: Moon },
];

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="relative flex items-center rounded-full bg-gray-100 dark:bg-neutral-800 p-1">
            {options.map(({ value, Icon }) => {
                const active = theme === value;

                return (
                    <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className="relative z-10 p-2"
                        aria-label={`Set ${value} theme`}
                    >
                        {active && (
                            <motion.div
                                layoutId="theme-indicator"
                                className="absolute inset-0 rounded-full bg-white dark:bg-neutral-900 shadow"
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                        )}

                        <Icon size={16} className="relative text-gray-700 dark:text-gray-200" />
                    </button>
                );
            })}
        </div>
    );
}
