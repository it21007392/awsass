import React, { useState, useEffect } from "react";
import { getDocs, collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase"; // Import Firestore

// Service functions to interact with Firestore
const EmployeeService = {
    getEmployees: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "employees"));
            const employees = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return employees;
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    },
    addEmployee: async (employee) => {
        try {
            await addDoc(collection(db, "employees"), employee);
        } catch (error) {
            console.error("Error adding employee:", error);
            throw error;
        }
    },
    updateEmployee: async (id, employee) => {
        try {
            const employeeRef = doc(db, "employees", id);
            await updateDoc(employeeRef, employee);
        } catch (error) {
            console.error("Error updating employee:", error);
            throw error;
        }
    },
    deleteEmployee: async (id) => {
        try {
            const employeeRef = doc(db, "employees", id);
            await deleteDoc(employeeRef);
        } catch (error) {
            console.error("Error deleting employee:", error);
            throw error;
        }
    },
};

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);

    // Fetch Employees
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await EmployeeService.getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError("Failed to fetch employees. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Departments
    const fetchDepartments = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "departments"));
            const departments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDepartments(departments);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    const handleEdit = async (employee) => {
        setSelectedEmployee(employee);
    };

    const handleDelete = async (id) => {
        try {
            await EmployeeService.deleteEmployee(id);
            fetchEmployees();
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    const clearSelection = () => {
        setSelectedEmployee(null);
    };

    return (
        <div className="w-full p-6 space-y-6 bg-gradient-to-r from-blue-900 to-blue-700 min-h-screen">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Employee Management</h1>
            <EmployeeForm
                onEmployeeAdded={fetchEmployees}
                selectedEmployee={selectedEmployee}
                clearSelection={clearSelection}
                departments={departments}
            />
            <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
                {loading ? (
                    <div className="text-center text-lg">Loading...</div>
                ) : error ? (
                    <div className="text-red-600 text-lg mb-5">{error}</div>
                ) : (
                    <EmployeeList
                        employees={employees}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        departments={departments}
                    />
                )}
            </div>
        </div>
    );
};

const EmployeeForm = ({ onEmployeeAdded, selectedEmployee, clearSelection, departments }) => {
    const [form, setForm] = useState({
        name: selectedEmployee ? selectedEmployee.name : "",
        empNo: selectedEmployee ? selectedEmployee.empNo : "",
        role: selectedEmployee ? selectedEmployee.role : "",
        salary: selectedEmployee ? selectedEmployee.salary : "",
        departmentId: selectedEmployee ? selectedEmployee.departmentId : "",
        departmentName: selectedEmployee ? selectedEmployee.departmentName : "",
        dateOfJoining: selectedEmployee ? selectedEmployee.dateOfJoining : "",
        epfNumber: selectedEmployee ? selectedEmployee.epfNumber : "",
        address: selectedEmployee ? selectedEmployee.address : "",
        gender: selectedEmployee ? selectedEmployee.gender : "",
        maritalStatus: selectedEmployee ? selectedEmployee.maritalStatus : "",
        nationalityCode: selectedEmployee ? selectedEmployee.nationalityCode : "",
        mobile: selectedEmployee ? selectedEmployee.mobile : "",
        bank: selectedEmployee ? selectedEmployee.bank : "",
        bankAccNo: selectedEmployee ? selectedEmployee.bankAccNo : "",
    });

          // Watch for changes in selectedEmployee and update the form state
    useEffect(() => {
        if (selectedEmployee) {
            setForm({
                name: selectedEmployee.name,
                empNo: selectedEmployee.empNo,
                role: selectedEmployee.role,
                salary: selectedEmployee.salary,
                departmentId: selectedEmployee.departmentId,
                departmentName: selectedEmployee.departmentName,
                dateOfJoining: selectedEmployee.dateOfJoining,
                epfNumber: selectedEmployee.epfNumber,
                address: selectedEmployee.address,
                gender: selectedEmployee.gender,
                maritalStatus: selectedEmployee.maritalStatus,
                nationalityCode: selectedEmployee.nationalityCode,
                mobile: selectedEmployee.mobile,
                bank: selectedEmployee.bank,
                bankAccNo: selectedEmployee.bankAccNo,
            });
        }
    }, [selectedEmployee]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "departmentId") {
            const department = departments.find((dept) => dept.id === parseInt(value));
            setForm({
                ...form,
                departmentId: value,
                departmentName: department ? department.name : "",
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (selectedEmployee) {
                await EmployeeService.updateEmployee(selectedEmployee.id, { ...form });
            } else {
                await EmployeeService.addEmployee({ ...form });
            }
            onEmployeeAdded();
            clearSelection();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
                {selectedEmployee ? "Update Employee" : "Add Employee"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Employee Number */}
                <input
                    name="empNo"
                    placeholder="Employee Number"
                    value={form.empNo}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Role */}
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                >
                    <option value="">Select Role</option>
                    <option value="Manager">Manager</option>
                    <option value="Developer">Developer</option>
                    <option value="HR">HR</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Sales">Sales</option>
                </select>
                {/* Salary */}
                <input
                    name="salary"
                    placeholder="Salary"
                    value={form.salary}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Department */}
                <select
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                            {department.name}
                        </option>
                    ))}
                </select>
                {/* Date of Joining */}
                <input
                    name="dateOfJoining"
                    type="date"
                    value={form.dateOfJoining}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* EPF Number */}
                <input
                    name="epfNumber"
                    placeholder="EPF Number"
                    value={form.epfNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Address */}
                <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Gender */}
                <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                {/* Marital Status */}
                <select
                    name="maritalStatus"
                    value={form.maritalStatus}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                >
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                </select>
                {/* Nationality Code */}
                <input
                    name="nationalityCode"
                    placeholder="Nationality Code"
                    value={form.nationalityCode}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Mobile Number */}
                <input
                    name="mobile"
                    placeholder="Mobile Number"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Bank */}
                <input
                    name="bank"
                    placeholder="Bank"
                    value={form.bank}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {/* Bank Account Number */}
                <input
                    name="bankAccNo"
                    placeholder="Bank Account Number"
                    value={form.bankAccNo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
            </div>
            <button
                type="submit"
                className="mt-4 w-full p-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
            >
                {selectedEmployee ? "Update Employee" : "Add Employee"}
            </button>
        </form>
    );
};



const EmployeeList = ({ employees, onEdit, onDelete, departments }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    // Filter the employees based on search and dropdown filters
    const filteredEmployees = employees.filter((employee) => {
        const matchesSearchTerm =
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.epfNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment =
            !selectedDepartment || employee.department_name === selectedDepartment;
        const matchesRole = !selectedRole || employee.role === selectedRole;

        return matchesSearchTerm && matchesDepartment && matchesRole;
    });

    return (
        <div className="overflow-y-auto max-h-80 border border-gray-300 rounded-lg">
            <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="p-3 text-left font-semibold">Name</th>
                        <th className="p-3 text-left font-semibold">
                            Emp No
                            <input
                                type="text"
                                placeholder="Search"
                                className="mt-1 p-1 w-full border rounded-md text-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </th>
                        <th className="p-3 text-left font-semibold">
                            Role
                            <select
                                className="mt-1 p-1 w-full border rounded-md text-black"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="">Role</option>
                                <option value="Manager">Manager</option>
                                <option value="Developer">Developer</option>
                                <option value="HR">HR</option>
                                <option value="Accountant">Accountant</option>
                                <option value="Sales">Sales</option>
                            </select>
                        </th>
                        <th className="p-3 text-left font-semibold">Salary</th>
                        <th className="p-3 text-left font-semibold">Department</th>
                        <th className="p-3 text-left font-semibold">Date of Joining</th>
                        <th className="p-3 text-left font-semibold">EPF Number</th>
                        <th className="p-3 text-left font-semibold">Address</th>
                        <th className="p-3 text-left font-semibold">Gender</th>
                        <th className="p-3 text-left font-semibold">Marital Status</th>
                        <th className="p-3 text-left font-semibold">Mobile</th>
                        <th className="p-3 text-left font-semibold">Bank</th>
                        <th className="p-3 text-left font-semibold">Bank Acc No</th>
                        <th className="p-3 text-left font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEmployees.map((employee) => {
                        // Find the department name from the departments list
                        const department = departments.find((dept) => dept.id === employee.departmentId);
                        return (
                            <tr key={employee.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
                                <td className="p-3 border-b">{employee.name}</td>
                                <td className="p-3 border-b">{employee.empNo}</td>
                                <td className="p-3 border-b">{employee.role}</td>
                                <td className="p-3 border-b">{employee.salary}</td>
                                <td className="p-3 border-b">{department ? department.name : "N/A"}</td>
                                <td className="p-3 border-b">{employee.dateOfJoining}</td>
                                <td className="p-3 border-b">{employee.epfNumber}</td>
                                <td className="p-3 border-b">{employee.address}</td>
                                <td className="p-3 border-b">{employee.gender}</td>
                                <td className="p-3 border-b">{employee.maritalStatus}</td>
                                <td className="p-3 border-b">{employee.mobile}</td>
                                <td className="p-3 border-b">{employee.bank}</td>
                                <td className="p-3 border-b">{employee.bankAccNo}</td>
                                <td className="p-3 border-b">
                                    <button
                                        onClick={() => onEdit(employee)}  // onEdit sets the form data to this employee's details
                                        className="text-blue-500 hover:underline mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(employee.id)}
                                        className="text-red-500 hover:underline"
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
    );

};


export default EmployeesPage;
