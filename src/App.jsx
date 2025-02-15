import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { Navigate } from "react-router-dom";


const App = () => (
    <Router>
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/departments" element={<DepartmentsPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/leave" element={<LeaveManagement />} />
                    <Route path="/event" element={<CompanyEvents />} />
                    <Route path="/benifits" element={<EmployeeBenefits />} />
                    <Route path="/salary-manager" element={<SalaryPayrollManager />} />
                    <Route path="/training" element={<EmployeeTraining />} />
                    <Route path="/talent" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    </Router>
);

export default App;
