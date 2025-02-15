import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase"; // Import Firebase auth
import Sidebar from "./components/Sidebar";
import EmployeesPage from "./pages/EmployeesPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import AttendancePage from "./pages/AttendancePage";
import Dashboard from "./pages/Dashbord";
import LeaveManagement from "./pages/LeaveManagement";
import CompanyEvents from "./pages/CompanyEvents";
import EmployeeBenefits from "./pages/EmployeeBenefits";
import SalaryPayrollManager from "./pages/SalaryPayrollManager";
import EmployeeTraining from "./pages/EmployeeTraining";
import CreateAccountPage from "./pages/CreateAccountPage";
import LoginSignupPage from "./pages/LoginSignupPage";

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Authentication listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        
        return () => unsubscribe(); // Cleanup the listener on unmount
    }, []);

    // Page refresh warning handler
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = ""; // Triggers the browser's confirmation dialog
        };

        // Add event listener for refresh or close tab
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // Protected Route component
    const ProtectedRoute = ({ children }) => {
        if (loading) {
            return <div className="flex items-center justify-center h-screen">Loading...</div>;
        }
        
        if (!user) {
            return <Navigate to="/login" />;
        }

        return children;
    };

    return (
        <Router basename="/E2E-HRMS">
            <div className="flex h-screen">
                {user && <Sidebar />}
                <div className={`${user ? 'flex-1 overflow-auto' : 'w-full'}`}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={!user ? <LoginSignupPage /> : <Navigate to="/" />} />
                        <Route path="/create-account" element={!user ? <CreateAccountPage /> : <Navigate to="/" />} />

                        {/* Protected routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/employees" element={
                            <ProtectedRoute>
                                <EmployeesPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/departments" element={
                            <ProtectedRoute>
                                <DepartmentsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/attendance" element={
                            <ProtectedRoute>
                                <AttendancePage />
                            </ProtectedRoute>
                        } />
                        <Route path="/leave" element={
                            <ProtectedRoute>
                                <LeaveManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/event" element={
                            <ProtectedRoute>
                                <CompanyEvents />
                            </ProtectedRoute>
                        } />
                        <Route path="/benifits" element={
                            <ProtectedRoute>
                                <EmployeeBenefits />
                            </ProtectedRoute>
                        } />
                        <Route path="/salary-manager" element={
                            <ProtectedRoute>
                                <SalaryPayrollManager />
                            </ProtectedRoute>
                        } />
                        <Route path="/training" element={
                            <ProtectedRoute>
                                <EmployeeTraining />
                            </ProtectedRoute>
                        } />
                        <Route path="/talent" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/loginsignup" element={
                            <ProtectedRoute>
                                <LoginSignupPage />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;