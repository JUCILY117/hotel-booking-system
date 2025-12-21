import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import HotelCardSkeleton from "../components/HotelCardSkeleton";
import { resolveMediaUrl } from "../utils/media";

export default function HotelsPage() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 6;

    useEffect(() => {
        setLoading(true);

        api.get("/hotels", {
            params: {
                page,
                limit: LIMIT,
                ...(debouncedQuery && { q: debouncedQuery }),
            },
        })
            .then(res => {
                setHotels(res.data.data);
                setTotalPages(res.data.totalPages);
            })
            .finally(() => setLoading(false));
    }, [page, debouncedQuery]);

    useEffect(() => {
        if (!loading) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [page, loading]);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQuery(query.trim());
            setPage(1);
        }, 300);

        return () => clearTimeout(t);
    }, [query]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Hotels</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Browse and book from available properties
                    </p>
                </div>

                {!loading && hotels.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                        {debouncedQuery ? `No results found for “${debouncedQuery}”.` : "No hotels available."}
                    </p>
                )}

                <div className="mb-6 max-w-md">
                    <div
                        className="
      flex items-center gap-2
      px-3 py-2 rounded-xl
      border border-gray-300 dark:border-neutral-700
      bg-white dark:bg-neutral-900
      focus-within:ring-2 focus-within:ring-blue-500/40
      transition
    "
                    >
                        <Search size={18} className="text-gray-500 dark:text-gray-400" />

                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search hotels or locations"
                            className="
        flex-1 bg-transparent outline-none
        text-sm text-gray-900 dark:text-gray-100
        placeholder:text-gray-400
      "
                        />

                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {debouncedQuery && !loading && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Showing results for “{debouncedQuery}”
                        </p>
                    )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)
                        : hotels.map(hotel => {
                              const coverImage = resolveMediaUrl(hotel.images?.[0]) || null;

                              return (
                                  <Link
                                      key={hotel.id}
                                      to={`/hotels/${hotel.id}`}
                                      className="
                      group relative
                      surface-elevated rounded-xl overflow-hidden
                      border border-gray-200 dark:border-neutral-800
                      transition
                      hover:-translate-y-1 hover:shadow-xl
                      dark:hover:shadow-black/40
                      focus:outline-none focus:ring-2 focus:ring-blue-500/40
                    "
                                  >
                                      <div className="relative h-44 overflow-hidden bg-gray-200 dark:bg-neutral-800">
                                          {coverImage ? (
                                              <>
                                                  <img
                                                      src={coverImage}
                                                      alt={hotel.name}
                                                      className="
                              h-full w-full object-cover
                              transition-transform duration-300
                              group-hover:scale-[1.06]
                            "
                                                  />
                                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                              </>
                                          ) : (
                                              <div
                                                  className="
                            h-full w-full bg-gradient-to-br
                            from-gray-300 to-gray-200
                            dark:from-neutral-800 dark:to-neutral-700
                          "
                                              />
                                          )}
                                      </div>

                                      <div className="p-4 space-y-2">
                                          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                              {hotel.name}
                                          </h2>

                                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                              <MapPin size={14} />
                                              <span>{hotel.location}</span>
                                          </div>

                                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                              {hotel.description}
                                          </p>

                                          <div
                                              className="
                          mt-3 inline-flex items-center gap-1.5
                          text-sm font-medium text-blue-600 dark:text-blue-400
                          opacity-0 group-hover:opacity-100
                          transition-opacity
                        "
                                          >
                                              View details
                                              <ArrowRight size={14} />
                                          </div>
                                      </div>
                                  </Link>
                              );
                          })}
                </div>
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="
        p-2 rounded-md border
        border-gray-300 dark:border-neutral-700
        disabled:opacity-40
        hover:bg-gray-100 dark:hover:bg-neutral-800
        transition
      "
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="
        p-2 rounded-md border
        border-gray-300 dark:border-neutral-700
        disabled:opacity-40
        hover:bg-gray-100 dark:hover:bg-neutral-800
        transition
      "
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
