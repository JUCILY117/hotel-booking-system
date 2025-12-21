import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg border">
                <h1 className="text-2xl font-semibold mb-4">Login</h1>

                {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

                <div className="mb-3">
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm mb-1">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded text-sm">
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-sm mt-4 text-center">
                    No account?{" "}
                    <Link to="/register" className="underline">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}
