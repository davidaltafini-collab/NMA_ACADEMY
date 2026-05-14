import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DashboardLayout from "./components/layout/DashboardLayout";
import AccountDashboard from "./pages/dashboard/AccountDashboard";
import MyCourses from "./pages/dashboard/MyCourses";
import CoursePlayer from "./pages/dashboard/CoursePlayer";
import BillingProfile from "./pages/dashboard/BillingProfile";
import DevicesSessions from "./pages/dashboard/DevicesSessions";
import CourseDetail from "./pages/CourseDetail";
import Checkout from "./pages/checkout/Checkout";
import PaymentPending from "./pages/checkout/PaymentPending";
import PaymentSuccess from "./pages/checkout/PaymentSuccess";
import PaymentFailed from "./pages/checkout/PaymentFailed";

import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./components/layout/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseForm from "./pages/admin/AdminCourseForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminEmailCampaigns from "./pages/admin/AdminEmailCampaigns";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
        </Route>
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Checkout & Payment */}
        <Route path="/checkout/:courseSlug" element={<Checkout />} />
        <Route path="/payment/pending" element={<PaymentPending />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<AccountDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="billing" element={<BillingProfile />} />
          <Route path="devices" element={<DevicesSessions />} />
        </Route>

        {/* Course Player (No Sidebar, Immersive) — uses course slug */}
        <Route path="/course/:slug" element={<CoursePlayer />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/new" element={<AdminCourseForm />} />
            <Route path="courses/:courseId/edit" element={<AdminCourseForm />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId" element={<AdminUserDetail />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="email-campaigns" element={<AdminEmailCampaigns />} />
          </Route>
        </Route>

      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
