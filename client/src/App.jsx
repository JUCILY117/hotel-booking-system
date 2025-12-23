import { Navigate, Route, Routes } from "react-router-dom";
import AccountLayout from "./components/account/AccountLayout";
import AdminLayout from "./components/admin/AdminLayout";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyBookingsTab from "./pages/account/MyBookingsTab";
import MyPaymentsTab from "./pages/account/MyPaymentsTab";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminCreateHotel from "./pages/admin/AdminCreateHotel";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHotelsPage from "./pages/admin/AdminHotelsPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminRoomsPage from "./pages/admin/AdminRoomsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HotelDetailPage from "./pages/HotelDetailPage";
import HotelsPage from "./pages/HotelsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaymentPage from "./pages/PaymentPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HotelsPage />} />
                <Route path="/hotels/:id" element={<HotelDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route
                    path="/payment/:bookingId"
                    element={
                        <ProtectedRoute>
                            <PaymentPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/account"
                    element={
                        <ProtectedRoute>
                            <AccountLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="bookings" replace />} />
                    <Route path="bookings" element={<MyBookingsTab />} />
                    <Route path="payments" element={<MyPaymentsTab />} />
                </Route>
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
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                </Route>
            </Routes>
        </Layout>
    );
}
