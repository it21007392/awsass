// DepartmentsPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// DepartmentService
const DepartmentService = {
    getDepartments: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "departments"));
            return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    },
    addDepartment: async (department) => {
        try {
            await addDoc(collection(db, "departments"), department);
        } catch (error) {
            console.error("Error adding department:", error);
            throw error;
        }
    },
    deleteDepartment: async (id) => {
        try {
            await deleteDoc(doc(db, "departments", id));
        } catch (error) {
            console.error("Error deleting department:", error);
            throw error;
        }
    },
};

// DepartmentForm Component
const DepartmentForm = ({ onDepartmentAdded }) => {
    const [form, setForm] = useState({ dname: "", description: "" });

    const handleChange = (e) => {
        const { name, value } = e.target; // Use 'name' to match state property name
        setForm({ ...form, [name]: value }); // Update the state with the correct name property
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await DepartmentService.addDepartment(form);
        setForm({ dname: "", description: "" });
        onDepartmentAdded(); // Trigger a refresh of the department list
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg mb-6 max-w-4xl mx-auto"
        >
            <h3 className="text-xl font-bold text-gray-700 mb-4">Add Department</h3>
            <input
                name="dname" // Corrected name attribute
                placeholder="Name"
                value={form.dname}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700"
            >
                Add Department
            </button>
        </form>
    );
};


const DepartmentList = ({ departments, onDeleteDepartment }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Departments</h3>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-md overflow-hidden">
                <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="p-3 text-left font-semibold">Name</th>
                        <th className="p-3 text-left font-semibold">Description</th>
                        <th className="p-3 text-left font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((department) => (
                        <tr
                            key={department.id}
                            className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200"
                        >
                            <td className="p-3 border-b border-gray-200">
                                {department.dname}
                            </td>
                            <td className="p-3 border-b border-gray-200">
                                {department.description}
                            </td>
                            <td className="p-3 border-b border-gray-200">
                                <button
                                    onClick={() => onDeleteDepartment(department.id)}
                                    className="text-red-600 hover:text-red-800"
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

// Main DepartmentsPage Component
const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await DepartmentService.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError("Failed to fetch departments. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await DepartmentService.deleteDepartment(id);
            setDepartments((prevDepartments) =>
                prevDepartments.filter((department) => department.id !== id)
            );
        } catch (err) {
            console.error("Error deleting department:", err);
            setError("Failed to delete department. Please try again later.");
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    return (
        <div className="w-full p-6 space-y-6 bg-gradient-to-r from-blue-900 to-blue-700 min-h-screen">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Department Management</h1>
            <DepartmentForm onDepartmentAdded={fetchDepartments} />
            {loading ? (
                <div className="text-center text-lg text-white">Loading...</div>
            ) : error ? (
                <div className="text-red-600 text-lg mb-5">{error}</div>
            ) : (
                <DepartmentList
                    departments={departments}
                    onDeleteDepartment={handleDeleteDepartment}
                />
            )}
        </div>
    );
};

export default DepartmentsPage;
