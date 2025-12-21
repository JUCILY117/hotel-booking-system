import Skeleton from "./Skeleton";

export default function HotelDetailSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
            <Skeleton className="h-8 w-1/2" />

            <Skeleton className="h-4 w-1/3" />

            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="w-48 h-32 rounded-lg" />
                ))}
            </div>

            <div className="flex gap-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="surface-elevated rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-3"
                    >
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-9 w-32 mt-2" />
                    </div>
                ))}
            </div>
        </div>
    );
}
