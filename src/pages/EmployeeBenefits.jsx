import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Ensure Firebase is initialized
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

const benefitsCollection = collection(db, "employeeBenefits");
const employeesCollection = collection(db, "employees");

const EmployeeBenefits = () => {
    // Service Functions
    const getBenefits = async () => {
        const querySnapshot = await getDocs(benefitsCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const getEmployees = async () => {
        const querySnapshot = await getDocs(employeesCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const addBenefit = async (benefit) => {
        await addDoc(benefitsCollection, benefit);
    };

    const deleteBenefit = async (id) => {
        const benefitDoc = doc(db, "employeeBenefits", id);
        await deleteDoc(benefitDoc);
    };

    // Component State
    const [benefits, setBenefits] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        empNo: "",
        benefitType: "",
        amount: "",
        dateGranted: "",
        expiryDate: "",
    });

    // Fetch data
    const fetchBenefits = async () => {
        const data = await getBenefits();
        setBenefits(data);
    };

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        await addBenefit(form);
        setForm({ empNo: "", benefitType: "", amount: "", dateGranted: "", expiryDate: "" });
        fetchBenefits();
    };

    // Handle benefit deletion
    const handleBenefitDelete = async (id) => {
        await deleteBenefit(id);
        fetchBenefits();
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchBenefits();
        fetchEmployees();
    }, []);

    return (
        <div className="w-full p-6 space-y-6 bg-gradient-to-r from-blue-900 to-blue-700 min-h-screen">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Employee Benefits Management</h1>

            {/* Benefit Form */}
            <form
                onSubmit={handleFormSubmit}
                className="bg-white p-6 rounded-xl shadow-lg mb-6 max-w-4xl mx-auto"
            >
                <h3 className="text-xl font-bold text-gray-700 mb-4">Add Benefit</h3>
                <input
                    name="empNo"
                    placeholder="Employee Number"
                    value={form.empNo}
                    onChange={(e) => setForm({ ...form, empNo: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    name="benefitType"
                    placeholder="Benefit Type"
                    value={form.benefitType}
                    onChange={(e) => setForm({ ...form, benefitType: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="number"
                    placeholder="Amount"
                    name="amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
               <div className="relative mb-6">
    <input
        id="dateGranted"
        type="date"
        name="dateGranted"
        value={form.dateGranted}
        onChange={(e) => setForm({ ...form, dateGranted: e.target.value })}
        required
        className="w-full p-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
        placeholder=" "
    />
    <label
        htmlFor="dateGranted"
        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
            form.dateGranted ? "-translate-y-3 scale-75" : ""
        }`}
    >
        Date Granted
    </label>
</div>

<div className="relative mb-6">
    <input
        id="expiryDate"
        type="date"
        name="expiryDate"
        value={form.expiryDate}
        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
        required
        className="w-full p-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
        placeholder=" "
    />
    <label
        htmlFor="expiryDate"
        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
            form.expiryDate ? "-translate-y-3 scale-75" : ""
        }`}
    >
        Expiry Date
    </label>
</div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700"
                >
                    Add Benefit
                </button>
            </form>

            {/* Benefits Record Table Container */}
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Benefit Record</h3>
                <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-200">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="p-3 text-left font-semibold">Employee No.</th>
                                <th className="p-3 text-left font-semibold">Employee Name</th>
                                <th className="p-3 text-left font-semibold">Benefit Type</th>
                                <th className="p-3 text-left font-semibold">Amount</th>
                                <th className="p-3 text-left font-semibold">Date Granted</th>
                                <th className="p-3 text-left font-semibold">Expiry Date</th>
                                <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {benefits.map((benefit) => {
                                const employee = employees.find(emp => emp.empNo === benefit.empNo);
                                return (
                                    <tr
                                        key={benefit.id}
                                        className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200"
                                    >
                                        <td className="p-3 border-b border-gray-200">{benefit.empNo}</td>
                                        <td className="p-3 border-b border-gray-200">{employee ? employee.name : "Unknown"}</td>
                                        <td className="p-3 border-b border-gray-200">{benefit.benefitType}</td>
                                        <td className="p-3 border-b border-gray-200">{benefit.amount}</td>
                                        <td className="p-3 border-b border-gray-200">{new Date(benefit.dateGranted).toLocaleDateString()}</td>
                                        <td className="p-3 border-b border-gray-200">{new Date(benefit.expiryDate).toLocaleDateString()}</td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleBenefitDelete(benefit.id)}
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

export default EmployeeBenefits;
