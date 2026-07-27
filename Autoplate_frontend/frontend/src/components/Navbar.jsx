import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

function Navbar() {
  // State to manage the mobile menu's open/close state
  const [isOpen, setIsOpen] = useState(false);
  // Access the authentication context
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, the Navbar is not rendered
  if (isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          {/* Left side of the navbar: logo and navigation links */}
          <div className="flex space-x-7">
            {/* Logo */}
            <div>
              <Link to="/" className="flex items-center py-4 px-2">
                <img
                  src={logo}
                  alt="logo"
                  className="w-52 hover:scale-105 transition-all relative"
                />
              </Link>
            </div>
            {/* Navigation links (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="py-4 px-2 text-gray-500 hover:text-gray-900 transition duration-300"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="py-4 px-2 text-gray-500 hover:text-gray-900 transition duration-300"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="py-4 px-2 text-gray-500 hover:text-gray-900 transition duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
          {/* Right side of the navbar: login/signup buttons (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="py-2 px-2 font-medium text-gray-100 rounded hover:scale-105 hover:text-gray-900 transition duration-300 bg-blue-600"
            >
              Login
            </Link>
            {/* <Link
              to="/signup"
              className="py-2 px-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-400 transition duration-300"
            >
              Sign Up
            </Link> */}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="outline-none mobile-menu-button"
              onClick={() => setIsOpen(!isOpen)}
            >
              {/* Conditionally render Menu or X icon based on isOpen state */}
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu (conditionally rendered) */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <Link
          to="/"
          className="block py-2 px-4 text-sm hover:bg-gray-200 transition duration-300"
        >
          Home
        </Link>
        <Link
          to="/about"
          className="block py-2 px-4 text-sm hover:bg-gray-200 transition duration-300"
        >
          About Us
        </Link>
        <Link
          to="/contact"
          className="block py-2 px-4 text-sm hover:bg-gray-200 transition duration-300"
        >
          Contact
        </Link>
        <Link
          to="/login"
          className="block py-2 px-4 text-sm hover:bg-gray-200 transition duration-300"
        >
          Log In
        </Link>
        {/* <Link
          to="/signup"
          className="block py-2 px-4 text-sm hover:bg-gray-200 transition duration-300"
        >
          Sign Up
        </Link> */}
      </div>
    </nav>
  );
}

export default Navbar;
