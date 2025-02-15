import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Make sure Firebase is initialized
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

// Firestore collections for leave requests, employees, and departments
const leaveRequestsCollection = collection(db, "leaveRequests");
const employeesCollection = collection(db, "employees");
const departmentsCollection = collection(db, "departments");

const LeaveManagement = () => {
    // Service Functions
    const getLeaveRequests = async () => {
        const querySnapshot = await getDocs(leaveRequestsCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addLeaveRequest = async (leaveRequest) => {
        await addDoc(leaveRequestsCollection, leaveRequest);
    };

    const updateLeaveStatus = async (id, status) => {
        const leaveRequestDoc = doc(db, "leaveRequests", id);
        await updateDoc(leaveRequestDoc, { status });
    };

    const deleteLeaveRequest = async (id) => {
        const leaveRequestDoc = doc(db, "leaveRequests", id);
        await deleteDoc(leaveRequestDoc);
    };

    const getEmployeeNameByEmpNo = async (empNo) => {
        const q = query(employeesCollection, where("empNo", "==", empNo));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data().name; // Assuming 'name' field exists in employee document
        }
        return null; // Return null if no employee is found
    };

    const getDepartmentNameById = async (departmentId) => {
        const q = query(departmentsCollection, where("departmentId", "==", departmentId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data().departmentName; // Assuming 'departmentName' field exists in department document
        }
        return null; // Return null if no department is found
    };

    // Component State
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employeesMap, setEmployeesMap] = useState({}); // Cache employee names by empNo
    const [departmentsMap, setDepartmentsMap] = useState({}); // Cache department names by departmentId
    const [form, setForm] = useState({
        empNo: "",
        leaveType: "Sick Leave",
        startDate: "",
        endDate: "",
        reason: "",
        departmentId: "", // Add departmentId field
    });

    // Fetch leave requests from Firestore
    const fetchLeaveRequests = async () => {
        const data = await getLeaveRequests();
        setLeaveRequests(data);
    };

    // Fetch employee and department data on initial mount
    const fetchEmployeeAndDepartmentData = async () => {
        const employeeSnapshot = await getDocs(employeesCollection);
        const employeeNames = {};
        employeeSnapshot.forEach(doc => {
            const data = doc.data();
            employeeNames[data.empNo] = data.name; // Map empNo to name
        });
        setEmployeesMap(employeeNames);

        const departmentSnapshot = await getDocs(departmentsCollection);
        const departmentNames = {};
        departmentSnapshot.forEach(doc => {
            const data = doc.data();
            departmentNames[data.departmentId] = data.departmentName; // Map departmentId to departmentName
        });
        setDepartmentsMap(departmentNames);
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const employeeName = await getEmployeeNameByEmpNo(form.empNo); // Get employee name by empNo
        const departmentName = await getDepartmentNameById(form.departmentId); // Get department name by departmentId

        if (employeeName && departmentName) {
            const newLeaveRequest = { 
                ...form, 
                name: employeeName, 
                department: departmentName, 
                status: "Pending" 
            };
            await addLeaveRequest(newLeaveRequest);
            setForm({ empNo: "", leaveType: "Sick Leave", startDate: "", endDate: "", reason: "", departmentId: "" });
            fetchLeaveRequests();
        } else {
            alert("Employee or Department not found!");
        }
    };

    // Handle status update
    const handleStatusUpdate = async (id, status) => {
        await updateLeaveStatus(id, status);
        fetchLeaveRequests();
    };

    // Handle delete request
    const handleDeleteRequest = async (id) => {
        await deleteLeaveRequest(id);
        fetchLeaveRequests();
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchLeaveRequests();
        fetchEmployeeAndDepartmentData(); // Fetch employee and department data to build maps
    }, []);

    // Format date to exclude time
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Format as "MM/DD/YYYY"
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-r from-blue-900 to-blue-700">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">Leave Management</h1>

                {/* Leave Request Form */}
                <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <label className="block mb-2">Employee Number</label>
                    <input
                        name="empNo"
                        placeholder="Employee Number"
                        value={form.empNo}
                        onChange={(e) => setForm({ ...form, empNo: e.target.value })}
                        required
                        className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block mb-2">Leave Type</label>
                    <select
                        name="leaveType"
                        value={form.leaveType}
                        onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                        className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Earned Leave">Earned Leave</option>
                    </select>

                    <label className="block mb-2">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        required
                        className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block mb-2">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        required
                        className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block mb-2">Reason</label>
                    <textarea
                        name="reason"
                        placeholder="Reason"
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block mb-2">Department</label>
                    <select
                        name="departmentId"
                        value={form.departmentId}
                        onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                        required
                        className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Department</option>
                        {Object.keys(departmentsMap).map((id) => (
                            <option key={id} value={id}>{departmentsMap[id]}</option>
                        ))}
                    </select>

                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700">
                            Request Leave
                        </button>
                    </div>
                </form>

                {/* Leave Requests Table */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">Event Records</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="p-3 text-left font-semibold">Employee</th>
                                    <th className="p-3 text-left font-semibold">Leave Type</th>
                                    <th className="p-3 text-left font-semibold">Start Date</th>
                                    <th className="p-3 text-left font-semibold">End Date</th>
                                    <th className="p-3 text-left font-semibold">Status</th>
                                    <th className="p-3 text-left font-semibold">Department</th>
                                    <th className="p-3 text-left font-semibold">Reason</th>
                                    <th className="p-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map((req) => (
                                    <tr key={req.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
                                        <td className="p-3 border-b border-gray-200">{req.name}</td>
                                        <td className="p-3 border-b border-gray-200">{req.leaveType}</td>
                                        <td className="p-3 border-b border-gray-200">{formatDate(req.startDate)}</td>
                                        <td className="p-3 border-b border-gray-200">{formatDate(req.endDate)}</td>
                                        <td className="p-3 border-b border-gray-200">{req.status}</td>
                                        <td className="p-3 border-b border-gray-200">{req.department}</td>
                                        <td className="p-3 border-b border-gray-200">{req.reason}</td>
                                        <td className="p-3 border-b border-gray-200 text-center">
                                            {req.status === "Pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, "Approved")}
                                                        className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, "Rejected")}
                                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDeleteRequest(req.id)}
                                                className="bg-red-700 text-white px-4 py-2 rounded ml-2 hover:bg-red-800"
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
            </div>
        </div>
    );
};

export default LeaveManagement;