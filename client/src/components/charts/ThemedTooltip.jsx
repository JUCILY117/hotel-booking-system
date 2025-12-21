export default function ThemedTooltip({ active, payload, label, formatter }) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div
            className="
        rounded-lg px-3 py-2 text-sm
        border
        bg-white text-gray-900 border-gray-200
        dark:bg-neutral-900 dark:text-gray-100 dark:border-neutral-700
        shadow-lg
      "
        >
            {label && <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>}

            {payload.map((entry, i) => (
                <div key={i} className="flex justify-between gap-4">
                    <span className="font-medium">{entry.name}</span>
                    <span className="font-semibold">{formatter ? formatter(entry.value) : entry.value}</span>
                </div>
            ))}
        </div>
    );
}
