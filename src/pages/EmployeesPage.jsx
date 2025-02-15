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
        name: "",
        empNo: "",
        role: "",
        salary: "",
        departmentId: "",
        departmentName: "",
        dateOfJoining: "",
        epfNumber: "",
        address: "",
        gender: "",
        maritalStatus: "",
        nationalityCode: "",
        mobile: "",
        bank: "",
        bankAccNo: "",
        birthday: "",
        nicNumber: "",
    });
          // Watch for changes in selectedEmployee and update the form state
    useEffect(() => {
        if (selectedEmployee) {
            setForm({
                name: selectedEmployee.name,
                empNo: selectedEmployee.empNo,
                birthday: selectedEmployee.birthday, // Added birthday
                nicNumber: selectedEmployee.nicNumber, // Added nicNumber
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

        // If in edit mode, prevent changes to locked fields
        if (selectedEmployee && ['empNo', 'epfNumber', 'nicNumber'].includes(name)) {
            return;
        }

        if (name === "departmentId") {
            const department = departments.find((dept) => dept.id === parseInt(value));
            setForm({
                ...form,
                departmentId: value,
                departmentName: department ? department.dname : "",
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const [errors, setErrors] = useState({});
const [successMessage, setSuccessMessage] = useState("");

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // Only perform validation checks if this is a new employee (not in update mode)
        if (!selectedEmployee) {
            const querySnapshot = await getDocs(collection(db, "employees"));
            const employees = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            const errors = {};

            // Check for duplicates only when adding new employee
            if (employees.some(employee => employee.empNo === form.empNo)) {
                errors.empNo = "Employee Number already exists.";
            }
            if (employees.some(employee => employee.epfNumber === form.epfNumber)) {
                errors.epfNumber = "EPF Number already exists.";
            }
            if (employees.some(employee => employee.nicNumber === form.nicNumber)) {
                errors.nicNumber = "NIC Number already exists.";
            }

            if (Object.keys(errors).length > 0) {
                setErrors(errors);
                return;
            }
        }

        // Add or update employee
        if (selectedEmployee) {
            // In update mode, just update the employee without any validation
            await EmployeeService.updateEmployee(selectedEmployee.id, { ...form });
            setSuccessMessage("Employee updated successfully!");
        } else {
            // Adding new employee
            await EmployeeService.addEmployee({ ...form });
            setSuccessMessage("Employee added successfully!");
        }

        // Call the parent function (e.g., for refreshing employee list)
        onEmployeeAdded();

        // Clear the form fields and errors after successful submission
        clearSelection();
        setErrors({});
        setForm({
            name: "",
            empNo: "",
            role: "",
            salary: "",
            departmentId: "",
            departmentName: "",
            dateOfJoining: "",
            epfNumber: "",
            address: "",
            gender: "",
            maritalStatus: "",
            nationalityCode: "",
            mobile: "",
            bank: "",
            bankAccNo: "",
            birthday: "",
            nicNumber: "",
        });

        // Clear the success message after a certain time
        setTimeout(() => setSuccessMessage(""), 5000);

    } catch (error) {
        console.error("Error submitting form:", error);
        setErrors({ submit: "Failed to submit form. Please try again." });
    }
};
{/* Display Success Message */}
{successMessage && (
    <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
        {successMessage}
    </div>
)}

    
    


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
                    <div>
                        <input
                            name="empNo"
                            placeholder="Employee Number"
                            value={form.empNo}
                            onChange={handleChange}
                            required
                            className={`w-full p-3 border rounded-lg ${errors.empNo ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.empNo && <span className="text-red-500 text-sm">{errors.empNo}</span>}
                    </div>
                {/* Birthday */}
                    <div>
                        <input
                            name="birthday"
                            type="date"
                            placeholder="Birthday"
                            value={form.birthday}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* NIC Number */}
                    <div>
    <input
        name="nicNumber"
        placeholder="NIC Number"
        value={form.nicNumber}
        onChange={handleChange}
        className={`w-full p-3 border rounded-lg ${errors.nicNumber ? "border-red-500" : "border-gray-300"}`}
    />
    {errors.nicNumber && <span className="text-red-500 text-sm">{errors.nicNumber}</span>}
</div>
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
                            {department.dname}
                        </option>
                    ))}
                </select>
                <div className="relative">
    <input
        id="dateOfJoining"
        name="dateOfJoining"
        type="date"
        value={form.dateOfJoining}
        onChange={handleChange}
        required
        className="w-full p-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder=" "
    />
    <label
        htmlFor="dateOfJoining"
        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
            form.dateOfJoining ? "-translate-y-3 scale-75" : ""
        }`}
    >
        Date of Joining
    </label>
</div>
{/* EPF Number */}
<div>
    <input
        name="epfNumber"
        placeholder="EPF Number"
        value={form.epfNumber}
        onChange={handleChange}
        className={`w-full p-3 border rounded-lg ${errors.epfNumber ? "border-red-500" : "border-gray-300"}`}
    />
    {errors.epfNumber && <span className="text-red-500 text-sm">{errors.epfNumber}</span>}
</div>
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
                            EmpNo
                            <input
                                type="text"
                                placeholder="Search"
                                className="mt-1 p-1 w-full border rounded-md text-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </th>
                        <th className="p-3 text-left font-semibold">Birthday</th>
                        <th className="p-3 text-left font-semibold">NIC Number</th>

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
                                <td className="p-3 border-b">{employee.birthday}</td> {/* Display Birthday */}
                                <td className="p-3 border-b">{employee.nicNumber}</td> {/* Display NIC Number */}
                                <td className="p-3 border-b">{employee.role}</td>
                                <td className="p-3 border-b">{employee.salary}</td>
                                <td className="p-3 border-b">{department ? department.dname : "N/A"}</td>
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
