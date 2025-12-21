import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="border-b bg-white">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link to="/" className="font-semibold text-lg">
                        Hotel Booking
                    </Link>

                    <div className="flex items-center gap-4 text-sm">
                        {user && user.role === "ADMIN" && (
                            <Link to="/admin" className="underline">
                                Admin
                            </Link>
                        )}

                        {!user && (
                            <>
                                <Link to="/login" className="underline">
                                    Login
                                </Link>
                                <Link to="/register" className="underline">
                                    Register
                                </Link>
                            </>
                        )}

                        {user && (
                            <>
                                <span className="text-gray-600">{user.email}</span>
                                <button onClick={logout} className="underline">
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-1">{children}</main>
        </div>
    );
}
