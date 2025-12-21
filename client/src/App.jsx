import { Route, Routes } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminCreateHotel from "./pages/admin/AdminCreateHotel";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHotelsPage from "./pages/admin/AdminHotelsPage";
import AdminRoomsPage from "./pages/admin/AdminRoomsPage";
import HotelDetailPage from "./pages/HotelDetailPage";
import HotelsPage from "./pages/HotelsPage";
import LoginPage from "./pages/LoginPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import PaymentPage from "./pages/PaymentPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HotelsPage />} />
                <Route path="/hotels/:id" element={<HotelDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/payment/:bookingId" element={<PaymentPage />} />
                <Route path="/bookings" element={<MyBookingsPage />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="hotels" element={<AdminHotelsPage />} />
                    <Route path="hotels/new" element={<AdminCreateHotel />} />
                    <Route path="hotels/:hotelId" element={<AdminRoomsPage />} />
                    <Route path="bookings" element={<AdminBookingsPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                </Route>
            </Routes>
        </Layout>
    );
}
