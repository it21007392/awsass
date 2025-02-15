import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Make sure Firebase is initialized
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

// Firebase service for attendance
const attendanceCollection = collection(db, "attendance");

const AttendanceService = {
    // Get all attendance records from Firebase
    getAllAttendance: async () => {
        const querySnapshot = await getDocs(attendanceCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Add an attendance record to Firebase
    addAttendance: async (attendance) => {
        await addDoc(attendanceCollection, attendance);
    },

    // Delete an attendance record from Firebase
    deleteAttendance: async (id) => {
        const docRef = doc(db, "attendance", id);
        await deleteDoc(docRef);
    },
};

// Helper function to format date
const formatDate = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(date).toLocaleDateString("en-GB", options);
};

// AttendanceForm Component
const AttendanceForm = ({ onAttendanceAdded }) => {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        employee_id: "",
        date: "",
        status: "Present",
    });

    // Fetch employees from Firebase
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "employees"));
                const employeesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setEmployees(employeesList);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await AttendanceService.addAttendance(form);
        setForm({ employee_id: "", date: "", status: "Present" });
        onAttendanceAdded();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg mb-6 max-w-4xl mx-auto transition-all duration-300"
        >
            <h3 className="text-xl font-bold text-gray-700 mb-4">Add Attendance</h3>
            <select
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                        {employee.empNo}
                    </option>
                ))}
            </select>
            <div className="relative">
                <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 pt-5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder=" "
                    />
                    <label
                        htmlFor="date"
                        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
                            form.date ? "-translate-y-3 scale-75" : ""
                        }`}
                    >
                        Date
                    </label>
                </div>

            <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
            </select>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700"
            >
                Add Attendance
            </button>
        </form>
    );
};

// AttendanceList Component
const AttendanceList = ({ attendance, employees, onDeleteAttendance }) => {
    const getEmployeeNameById = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.empNo : "Unknown Employee";
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto mb-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Attendance Records</h3>
            <div className="overflow-x-auto">
                <table className="w-full table-auto text-gray-700 rounded-lg">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="p-3 text-left">Employee</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map((record) => (
                            <tr
                                key={record.id}
                                className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200"
                            >
                                <td className="p-3 border-b border-gray-200">
                                    {getEmployeeNameById(record.employee_id)}
                                </td>
                                <td className="p-3 border-b border-gray-200">{formatDate(record.date)}</td>
                                <td className="p-3 border-b border-gray-200">{record.status}</td>
                                <td className="p-3 border-b border-gray-200">
                                    <button
                                        className="text-red-600 font-bold"
                                        onClick={() => onDeleteAttendance(record.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Main AttendancePage Component
const AttendancePage = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);

    const fetchAttendance = async () => {
        const data = await AttendanceService.getAllAttendance();
        setAttendance(data);
    };

    const fetchEmployees = async () => {
        const querySnapshot = await getDocs(collection(db, "employees"));
        const employeesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmployees(employeesList);
    };

    const handleDeleteAttendance = async (id) => {
        try {
            await AttendanceService.deleteAttendance(id);
            setAttendance((prev) => prev.filter((record) => record.id !== id));
        } catch (error) {
            console.error("Error deleting attendance record:", error);
        }
    };

    useEffect(() => {
        fetchAttendance();
        fetchEmployees();
    }, []);

    return (
        <div className="w-full p-6 space-y-6 bg-gradient-to-r from-blue-900 to-blue-700 min-h-screen">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Attendance Management</h1>
            <AttendanceForm onAttendanceAdded={fetchAttendance} />
            <AttendanceList
                attendance={attendance}
                employees={employees}
                onDeleteAttendance={handleDeleteAttendance}
            />
        </div>
    );
};

export default AttendancePage;
