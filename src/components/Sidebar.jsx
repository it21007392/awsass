import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("/employees"); // Default selected item

    const handleToggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLinkClick = (path) => {
        setSelected(path);
    };

    return (
        <div className={`sidebar ${isOpen ? 'w-64' : 'w-16'} 
            lg:w-64 bg-gradient-to-b from-gray-800 to-black text-white h-screen p-6 shadow-lg flex flex-col transition-all duration-300`}>
            
            {/* Hamburger Menu for Mobile */}
            <div className="flex justify-between items-center">
                <button
                    onClick={handleToggleSidebar}
                    className="lg:hidden text-white focus:outline-none"
                >
                    <span className="block w-6 h-1 bg-white mb-2"></span>
                    <span className="block w-6 h-1 bg-white mb-2"></span>
                    <span className="block w-6 h-1 bg-white"></span>
                </button>
            </div>

            {/* Logo Section */}
            <div className={`text-center mb-10 ${isOpen ? '' : 'hidden'} lg:block`}>
                <Link to="/" className="text-xl font-semibold mt-2">
                    E2E
                </Link>
                <p className="text-lg font-semibold mt-2">HR Management</p>
            </div>

            {/* Navigation Links */}
            <nav className={`flex-grow ${isOpen ? '' : 'hidden'} lg:block`}>
                <ul className="space-y-2">
                    {[
                        { name: 'Employees', path: '/employees' },
                        { name: 'Departments', path: '/departments' },
                        { name: 'Attendance', path: '/attendance' },
                        { name: 'Leave', path: '/leave' },
                        { name: 'Company Events', path: '/event' },
                        { name: 'Employee Benefits', path: '/benifits' },
                        { name: 'Salary Calculator', path: '/salary-manager' },
                        { name: 'Training', path: '/training' },
                    ].map((link, index) => (
                        <li key={index}>
                            <Link
                                to={link.path}
                                onClick={() => handleLinkClick(link.path)}
                                className={`block py-3 px-4 
                                    ${selected === link.path ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'} 
                                    hover:bg-blue-500 hover:text-white hover:translate-x-2 rounded-md shadow-md transition-all duration-300 
                                    font-semibold`}  // Bold text and smoother hover effect
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                   {/*  Placeholder for upcoming features 
                    {[...Array(2)].map((_, index) => (
                        <li key={index}>
                            <Link
                                to="#"
                                className="block py-3 px-4 bg-gray-700 hover:bg-blue-500 hover:text-white hover:translate-x-2 rounded-md shadow-md transition-all duration-300 font-semibold"
                            >
                                Upcoming
                            </Link>
                        </li>
                    ))} */}
                </ul>
            </nav>

            {/* Footer Section */}
            <div className={`text-center text-sm text-gray-300 mt-4 ${isOpen ? '' : 'hidden'} lg:block`}>
                <p>&copy; 2024 HR Management</p>
                <p>All Rights Reserved</p>
            </div>
        </div>
    );
};

export default Sidebar;
