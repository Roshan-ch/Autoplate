import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  RectangleEllipsis,
  History,
  LogOut,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../App";
import logo from "../assets/logo.png";

const DashboardLayout = ({ children }) => {
  // Access authentication context
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  // State for managing sidebar visibility (for mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State for managing dark mode
  const [darkMode, setDarkMode] = useState(false);

  // useEffect hook to check local storage for dark mode preference on component mount
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Function to toggle the sidebar (for mobile)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    // Store dark mode preference in local storage
    localStorage.setItem("darkMode", newDarkMode.toString());
    // Toggle dark mode class on the root element
    document.documentElement.classList.toggle("dark");
  };

  // Function to handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // If user is not authenticated, return null (do not render the layout)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 flex ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-4">
          <img src={logo} alt="Logo" className="h-8 mb-4 dark:invert" />
        </div>
        <nav className="flex-1">
          <Link
            to="/user"
            className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <LayoutDashboard className="mr-3" size={20} />
            Dashboard
          </Link>
          <Link
            to="/parking-lot"
            className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <RectangleEllipsis className="mr-3" size={20} />
            Number Plate
          </Link>
          <Link
            to="/history"
            className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <History className="mr-3" size={20} />
            History
          </Link>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Button to toggle the mobile sidebar */}
            <button
              onClick={toggleSidebar}
              className="mr-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:text-gray-900 dark:focus:text-gray-100 md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            <Link to="/user" className="md:hidden">
              <img src={logo} alt="Logo" className="h-8 dark:invert" />
            </Link>
          </div>
          <div className="flex items-center">
            {/* Dark mode toggle button */}
            <button
              onClick={toggleDarkMode}
              className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              <LogOut className="mr-2" size={20} />
              Logout
            </button>
          </div>
        </header>

        {/* Mobile sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg md:hidden
            transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            transition-transform duration-300 ease-in-out
          `}
        >
          <div className="p-4 border-b">
            <img src={logo} alt="Logo" className="h-8 mb-4 dark:invert" />
          </div>
          <nav className="mt-5">
            <Link
              to="/user"
              className="block py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <LayoutDashboard className="inline-block mr-3" size={20} />
              Dashboard
            </Link>
            <Link
              to="/parking-lot"
              className="block py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <RectangleEllipsis className="inline-block mr-3" size={20} />
              Number Plate
            </Link>
            <Link
              to="/history"
              className="block py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <History className="inline-block mr-3" size={20} />
              History
            </Link>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
