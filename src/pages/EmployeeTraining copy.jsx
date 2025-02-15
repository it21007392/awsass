import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/employee-training";
const EMPLOYEE_API_URL = "http://localhost:5000/employees";

const EmployeeTraining = () => {
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

    const fetchTrainings = async () => {
        const response = await axios.get(API_URL);
        setTrainings(response.data);
    };

    const fetchEmployees = async () => {
        const response = await axios.get(EMPLOYEE_API_URL);
        setEmployees(response.data);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        await axios.post(API_URL, form);
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

    const handleTrainingDelete = async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        fetchTrainings();
    };

    useEffect(() => {
        fetchTrainings();
        fetchEmployees();
    }, []);

    return (
        <div className="flex min-h-screen p-6 bg-gray-100">
            {/* Form Container */}
            <div className="w-1/2 p-6 bg-white shadow rounded" style={{ height: "80vh" }}>
                <h1 className="text-xl font-bold mb-4">Add Training</h1>
                <form onSubmit={handleFormSubmit}>
                    <label className="block mb-2">Employee Number (empNo)</label>
                    <input
                        type="text"
                        name="empNo"
                        value={form.empNo}
                        onChange={(e) => setForm({ ...form, empNo: e.target.value })}
                        className="border p-2 w-full mb-3"
                        required
                    />

                    <label className="block mb-2">Training Name</label>
                    <input
                        type="text"
                        name="trainingName"
                        value={form.trainingName}
                        onChange={(e) => setForm({ ...form, trainingName: e.target.value })}
                        className="border p-2 w-full mb-3"
                        required
                    />

                    <label className="block mb-2">Trainer</label>
                    <input
                        type="text"
                        name="trainer"
                        value={form.trainer}
                        onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                        className="border p-2 w-full mb-3"
                        required
                    />

                    <label className="block mb-2">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="border p-2 w-full mb-3"
                        required
                    />

                    <label className="block mb-2">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="border p-2 w-full mb-3"
                        required
                    />

                    <label className="block mb-2">Status</label>
                    <input
                        type="text"
                        name="status"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="border p-2 w-full mb-6"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded w-full"
                    >
                        Add Training
                    </button>
                </form>
            </div>

            {/* Table Container */}
            <div className="w-1/2 p-6 bg-white shadow rounded ml-6 overflow-y-auto" style={{ height: "80vh" }}>
                <h1 className="text-xl font-bold mb-4">Trainings</h1>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Employee No</th>
                            <th className="border p-2">Training Name</th>
                            <th className="border p-2">Trainer</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainings.map((training) => (
                            <tr key={training.id} className="border-t">
                                <td className="border p-2">{training.empNo}</td>
                                <td className="border p-2">{training.trainingName}</td>
                                <td className="border p-2">{training.trainer}</td>
                                <td className="border p-2">{training.status}</td>
                                <td className="border p-2 text-center">
                                    <button
                                        onClick={() => handleTrainingDelete(training.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
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

export default EmployeeTraining;
