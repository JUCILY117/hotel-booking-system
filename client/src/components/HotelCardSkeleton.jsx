import Skeleton from "./Skeleton";

export default function HotelCardSkeleton() {
    return (
        <div className="surface-elevated rounded-xl border border-gray-200 dark:border-neutral-800 p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />

            <Skeleton className="h-4 w-1/2" />

            <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}
