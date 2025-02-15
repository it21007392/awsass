import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Ensure Firebase is initialized
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

// Define Firestore collections
const trainingCollection = collection(db, "employeeTraining");
const employeesCollection = collection(db, "employees");

const EmployeeTraining = () => {
    // Service Functions
    const getTrainings = async () => {
        const querySnapshot = await getDocs(trainingCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const getEmployees = async () => {
        const querySnapshot = await getDocs(employeesCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addTraining = async (training) => {
        await addDoc(trainingCollection, training);
    };

    const deleteTraining = async (id) => {
        const trainingDoc = doc(db, "employeeTraining", id);
        await deleteDoc(trainingDoc);
    };

    // Component State
    const [trainings, setTrainings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        empNo: "",
        trainingName: "",
        trainer: "",
        startDate: "",
        endDate: "",
        status: "",
    });

    // Fetch data
    const fetchTrainings = async () => {
        const data = await getTrainings();
        setTrainings(data);
    };

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        await addTraining(form);
        setForm({
            empNo: "",
            trainingName: "",
            trainer: "",
            startDate: "",
            endDate: "",
            status: "",
        });
        fetchTrainings();
    };

    // Handle training deletion
    const handleTrainingDelete = async (id) => {
        await deleteTraining(id);
        fetchTrainings();
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchTrainings();
        fetchEmployees();
    }, []);

    return (
        <div className="w-full p-6 space-y-6 bg-gradient-to-r from-blue-900 to-blue-700 min-h-screen">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Employee Training Management</h1>

            {/* Training Form */}
            <form
                onSubmit={handleFormSubmit}
                className="bg-white p-6 rounded-xl shadow-lg mb-6 max-w-4xl mx-auto"
            >
                <h3 className="text-xl font-bold text-gray-700 mb-4">Add Training</h3>
                <input
                    name="empNo"
                    placeholder="Employee Number"
                    value={form.empNo}
                    onChange={(e) => setForm({ ...form, empNo: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="trainingName"
                    placeholder="Training Name"
                    value={form.trainingName}
                    onChange={(e) => setForm({ ...form, trainingName: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="trainer"
                    placeholder="Trainer"
                    value={form.trainer}
                    onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
<div className="relative mb-6">
    <input
        id="startDate"
        type="date"
        name="startDate"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        required
        className="w-full p-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
        placeholder=" "
    />
    <label
        htmlFor="startDate"
        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
            form.startDate ? "-translate-y-3 scale-75" : ""
        }`}
    >
        Start Date
    </label>
</div>

<div className="relative mb-6">
    <input
        id="endDate"
        type="date"
        name="endDate"
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        required
        className="w-full p-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
        placeholder=" "
    />
    <label
        htmlFor="endDate"
        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
            form.endDate ? "-translate-y-3 scale-75" : ""
        }`}
    >
        End Date
    </label>
</div>

                <input
                    name="status"
                    placeholder="Status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700"
                >
                    Add Training
                </button>
            </form>

            {/* Trainings Record Table Container */}
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Training Record</h3>
                <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-200">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="p-3 text-left font-semibold">Employee No.</th>
                                <th className="p-3 text-left font-semibold">Employee Name</th>
                                <th className="p-3 text-left font-semibold">Training Name</th>
                                <th className="p-3 text-left font-semibold">Status</th>
                                <th className="p-3 text-left font-semibold">Trainer</th>
                                <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainings.map((training) => {
                                const employee = employees.find(emp => emp.empNo === training.empNo);
                                return (
                                    <tr
                                        key={training.id}
                                        className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200"
                                    >
                                        <td className="p-3 border-b border-gray-200">{training.empNo}</td>
                                        <td className="p-3 border-b border-gray-200">{employee ? employee.name : "Unknown"}</td>
                                        <td className="p-3 border-b border-gray-200">{training.trainingName}</td>
                                        <td className="p-3 border-b border-gray-200">{training.status}</td>
                                        <td className="p-3 border-b border-gray-200">{training.trainer}</td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleTrainingDelete(training.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-300"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeTraining;
