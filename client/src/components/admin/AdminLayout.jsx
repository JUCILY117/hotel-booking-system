import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
    return (
        <div className="min-h-screen flex">
            <aside className="w-64 border-r bg-white p-4">
                <h2 className="font-semibold mb-4">Admin</h2>

                <nav className="flex flex-col gap-2 text-sm">
                    <Link to="/admin" className="underline">
                        Dashboard
                    </Link>
                    <Link to="/admin/hotels" className="underline">
                        Hotels
                    </Link>
                    <Link to="/admin/bookings" className="underline">
                        Bookings
                    </Link>
                    <Link to="/admin/analytics" className="underline">
                        Analytics
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 p-6 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
}
