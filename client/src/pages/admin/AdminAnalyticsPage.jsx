import { motion } from "framer-motion";
import { Banknote, CheckCircle, Clock, Download, Hotel, Trophy, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import api from "../../api/axios";
import ThemedTooltip from "../../components/charts/ThemedTooltip";

const TABS = [
    { key: "overview", label: "Overview" },
    { key: "revenue", label: "Revenue" },
    { key: "hotels", label: "Top Hotels" },
];

const DATE_RANGES = {
    "7d": 7,
    "30d": 30,
    all: null,
};

export default function AdminAnalyticsPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [rawRevenue, setRawRevenue] = useState([]);
    const [topHotels, setTopHotels] = useState([]);
    const [range, setRange] = useState("30d");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/admin/analytics/dashboard"),
            api.get("/admin/analytics/revenue-by-date"),
            api.get("/admin/analytics/top-hotels"),
        ])
            .then(([statsRes, revenueRes, hotelsRes]) => {
                setStats(statsRes.data);

                setRawRevenue(
                    Object.entries(revenueRes.data).map(([date, revenue]) => ({
                        date,
                        revenue,
                        ts: new Date(date).getTime(),
                    }))
                );

                setTopHotels(hotelsRes.data.sort((a, b) => b.bookings - a.bookings).slice(0, 5));
            })
            .finally(() => setLoading(false));
    }, []);

    const revenue = useMemo(() => {
        if (range === "all") return rawRevenue;
        const days = DATE_RANGES[range];
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        return rawRevenue.filter(r => r.ts >= cutoff);
    }, [rawRevenue, range]);

    if (loading) {
        return <div className="py-20 text-center text-gray-500 dark:text-gray-400">Loading analytics…</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Business insights & performance</p>
            </div>

            <div className="flex gap-1 border-b border-gray-200 dark:border-neutral-800">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
              px-4 py-2 text-sm font-medium
              transition
              ${
                  activeTab === tab.key
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                {activeTab === "overview" && <Overview stats={stats} />}
                {activeTab === "revenue" && <RevenueTab data={revenue} range={range} onRangeChange={setRange} />}
                {activeTab === "hotels" && <TopHotelsTab data={topHotels} />}
            </motion.div>
        </div>
    );
}

function Overview({ stats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPI icon={Hotel} label="Total bookings" value={stats.totalBookings} />
            <KPI icon={Clock} label="Pending" value={stats.pendingBookings} color="yellow" />
            <KPI icon={CheckCircle} label="Confirmed" value={stats.confirmedBookings} color="green" />
            <KPI icon={XCircle} label="Cancelled" value={stats.cancelledBookings} color="red" />
            <KPI icon={Banknote} label="Revenue" value={`₹${stats.totalRevenue}`} highlight />
        </div>
    );
}

function RevenueTab({ data, range, onRangeChange }) {
    return (
        <Surface
            title="Revenue over time"
            subtitle="Successful payments aggregated by date"
            exportData={data}
            exportName="revenue"
        >
            <div className="flex gap-2 mb-4">
                {Object.keys(DATE_RANGES).map(key => (
                    <RangeButton key={key} active={range === key} onClick={() => onRangeChange(key)}>
                        {key === "all" ? "All time" : `Last ${DATE_RANGES[key]} days`}
                    </RangeButton>
                ))}
            </div>

            <ChartContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip content={<ThemedTooltip formatter={v => `₹${v}`} />} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
            </ChartContainer>
        </Surface>
    );
}

function TopHotelsTab({ data }) {
    return (
        <Surface
            title="Top performing hotels"
            subtitle="Ranked by confirmed bookings"
            exportData={data}
            exportName="top-hotels"
        >
            <ChartContainer>
                <BarChart data={data} layout="vertical" margin={{ left: 12, right: 32 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={n => (n.length > 18 ? `${n.slice(0, 18)}…` : n)}
                    />
                    <Tooltip content={<ThemedTooltip formatter={v => `${v} bookings`} />} />
                    <Bar dataKey="bookings" fill="#10b981" radius={[0, 8, 8, 0]} barSize={18}>
                        <LabelList
                            dataKey="bookings"
                            position="right"
                            className="text-xs fill-gray-700 dark:fill-gray-200"
                        />
                    </Bar>
                </BarChart>
            </ChartContainer>

            <div className="flex gap-3 mt-4 text-sm">
                {data.map((h, i) => (
                    <div key={h.hotelId} className="flex items-center gap-2">
                        <Trophy
                            size={14}
                            className={i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-700"}
                        />
                        {h.name}
                    </div>
                ))}
            </div>
        </Surface>
    );
}

function Surface({ title, subtitle, exportData, exportName, children }) {
    const exportCSV = () => {
        const csv =
            Object.keys(exportData[0] || {}).join(",") +
            "\n" +
            exportData.map(row => Object.values(row).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${exportName}.csv`;
        a.click();
    };

    return (
        <div className="surface-elevated rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>

                {exportData?.length > 0 && (
                    <button
                        onClick={exportCSV}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                )}
            </div>

            {children}
        </div>
    );
}

function ChartContainer({ children }) {
    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );
}

function RangeButton({ active, children, ...props }) {
    return (
        <button
            {...props}
            className={`
        px-3 py-1.5 rounded-md text-xs font-medium transition
        ${
            active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
        }
      `}
        >
            {children}
        </button>
    );
}

function KPI({ icon: Icon, label, value, color, highlight }) {
    const colors = {
        green: "text-green-500",
        yellow: "text-yellow-500",
        red: "text-red-500",
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="surface-elevated rounded-xl border border-gray-200 dark:border-neutral-800 p-4"
        >
            <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={colors[color] || "text-blue-600 dark:text-blue-400"} />
                <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
            </div>
            <p className={`text-xl font-semibold ${highlight ? "text-blue-600 dark:text-blue-400" : ""}`}>{value}</p>
        </motion.div>
    );
}
