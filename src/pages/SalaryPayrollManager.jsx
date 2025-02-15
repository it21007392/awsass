import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Ensure Firebase is initialized
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

const salaryCollection = collection(db, "salaryCategories");
const payrollCollection = collection(db, "payrolls");
const employeesCollection = collection(db, "employees");

const SalaryPayrollManager = () => {
    const [categories, setCategories] = useState([]);
    const [payrolls, setPayrolls] = useState([]); // Added state to store payroll records
    const [form, setForm] = useState({ category_name: "", base_salary: "", percentage: "", deductions: "" });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [calculatedSalary, setCalculatedSalary] = useState(null);
    const [payrollForm, setPayrollForm] = useState({ empNo: "", payroll_date: "" });
    const [employees, setEmployees] = useState([]); // Added state for employee data

    // Fetch salary categories from Firestore
    useEffect(() => {
        const fetchCategories = async () => {
            const querySnapshot = await getDocs(salaryCollection);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(data);
        };
        fetchCategories();
    }, []);

    // Fetch payroll records from Firestore
    useEffect(() => {
        const fetchPayroll = async () => {
            const querySnapshot = await getDocs(payrollCollection);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayrolls(data);
        };
        fetchPayroll();
    }, []);

    // Fetch employee data from Firestore
    useEffect(() => {
        const fetchEmployees = async () => {
            const querySnapshot = await getDocs(employeesCollection);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEmployees(data);
        };
        fetchEmployees();
    }, []);

    // Handle input changes for form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Add a new salary category
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const { category_name, base_salary, percentage, deductions } = form;
        const formula = `${base_salary} + (${base_salary} * ${percentage}) - ${deductions}`;
        try {
            await addDoc(salaryCollection, { category_name, formula });
            setForm({ category_name: "", base_salary: "", percentage: "", deductions: "" });
            const querySnapshot = await getDocs(salaryCollection);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(data);
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    // Handle salary calculation
    const handleCalculateSalary = async () => {
        const selectedEmployee = employees.find(emp => emp.empNo === payrollForm.empNo);
        if (selectedEmployee && selectedCategory) {
            const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
            if (selectedCategoryData) {
                const baseSalary = selectedEmployee.salary || 0;
                const formula = selectedCategoryData.formula.replace(/base_salary/g, baseSalary);
                const calculatedSalary = eval(formula); // Evaluate the formula
                setCalculatedSalary(calculatedSalary);
            }
        }
    };

    // Add payroll record
    const handleAddPayroll = async () => {
        try {
            await addDoc(payrollCollection, {
                empNo: payrollForm.empNo,
                category_name: categories.find(cat => cat.id === selectedCategory).category_name,
                calculated_salary: calculatedSalary,
                payroll_date: payrollForm.payroll_date,
            });
            alert("Payroll record added successfully.");
            const querySnapshot = await getDocs(payrollCollection);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayrolls(data);
        } catch (error) {
            console.error("Error adding payroll record:", error);
        }
    };

    // Delete payroll record
    const handleDeletePayroll = async (payrollId) => {
        try {
            const payrollDoc = doc(db, "payrolls", payrollId);
            await deleteDoc(payrollDoc);
            alert("Payroll record deleted successfully.");
            const querySnapshot = await getDocs(payrollCollection);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayrolls(data);
        } catch (error) {
            console.error("Error deleting payroll record:", error);
        }
    };

    // Delete salary category
    const handleDeleteCategory = async (categoryId) => {
        try {
            const categoryDoc = doc(db, "salaryCategories", categoryId);
            await deleteDoc(categoryDoc);
            alert("Salary category deleted successfully.");
            const querySnapshot = await getDocs(salaryCollection);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(data);
        } catch (error) {
            console.error("Error deleting salary category:", error);
        }
    };

    // Format date to remove time
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-r from-blue-900 to-blue-700 ">
            {/* Salary Manager */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Add Category Form */}
                <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Add Salary Category</h3>
                    <form onSubmit={handleAddCategory}>
                        <input
                            name="category_name"
                            placeholder="Category Name"
                            value={form.category_name}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 border rounded-lg mb-4"
                        />
                        <input
                            name="base_salary"
                            placeholder="Base Salary"
                            value={form.base_salary}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 border rounded-lg mb-4"
                        />
                        <input
                            name="percentage"
                            placeholder="Percentage (e.g., 0.2)"
                            value={form.percentage}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 border rounded-lg mb-4"
                        />
                        <input
                            name="deductions"
                            placeholder="Deductions"
                            value={form.deductions}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 border rounded-lg mb-4"
                        />
                        <button className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
                            Add Category
                        </button>
                    </form>
                </div>
    
                {/* Categories Table */}
                <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Categories</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">Category Name</th>
                                    <th className="border border-gray-300 px-4 py-2">Formula</th>
                                    <th className="border border-gray-300 px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="text-center">
                                        <td className="border border-gray-300 px-4 py-2">{cat.category_name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{cat.formula}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
    
            {/* Payroll Section */}
            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                {/* Payroll Form */}
                <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Add Payroll Record</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddPayroll();
                        }}
                    >
                        <input
                            name="empNo"
                            placeholder="Employee Number"
                            value={payrollForm.empNo}
                            onChange={(e) =>
                                setPayrollForm({ ...payrollForm, empNo: e.target.value })
                            }
                            required
                            className="w-full p-3 border rounded-lg mb-4"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-3 border rounded-lg mb-4"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                        <div className="relative mb-6">
    <input
        id="payroll_date"
        name="payroll_date"
        type="date"
        value={payrollForm.payroll_date}
        onChange={(e) =>
            setPayrollForm({ ...payrollForm, payroll_date: e.target.value })
        }
        required
        className="w-full p-3 pt-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
        placeholder=" "
    />
    <label
        htmlFor="payroll_date"
        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
            payrollForm.payroll_date ? "-translate-y-3 scale-75" : ""
        }`}
    >
        Payroll Date
    </label>
</div>

                        <button
                            type="button"
                            onClick={handleCalculateSalary}
                            className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 mb-4"
                        >
                            Calculate Salary
                        </button>
                        <div className="text-center">
                            {calculatedSalary !== null && (
                                <p className="text-lg font-bold">
                                    Calculated Salary: LKR.{calculatedSalary}
                                </p>
                            )}
                        </div>
                        <button className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Add Payroll
                        </button>
                    </form>
                </div>

                {/* Payroll Table */}
                <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Payroll Records</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">Employee No</th>
                                    <th className="border border-gray-300 px-4 py-2">Employee Name</th>
                                    <th className="border border-gray-300 px-4 py-2">Category</th>
                                    <th className="border border-gray-300 px-4 py-2">Calculated Salary</th>
                                    <th className="border border-gray-300 px-4 py-2">Payroll Date</th>
                                    <th className="border border-gray-300 px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrolls.map((payroll) => {
                                    const employee = employees.find(emp => emp.empNo === payroll.empNo); // Find the employee by empNo
                                    return (
                                        <tr key={payroll.id} className="text-center">
                                            <td className="border border-gray-300 px-4 py-2">{payroll.empNo}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                {employee ? employee.name : "N/A"} {/* Display employee name or N/A if not found */}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">{payroll.category_name}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                {payroll.calculated_salary}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                {formatDate(payroll.payroll_date)}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <button
                                                    onClick={() => handleDeletePayroll(payroll.id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
        </div>
    );
};

export default SalaryPayrollManager;
