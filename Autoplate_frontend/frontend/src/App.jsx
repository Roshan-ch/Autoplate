import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LogIn from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserPage from "./pages/UserPage";
import HistoryPage from "./pages/HistoryPage";
import ParkingLotPage from "./pages/ParkingLotPage";
import ImmeExit from "./pages/ImmeExit";
import apiClient from "./api/apiClient";

// Create AuthContext for managing authentication state
const AuthContext = createContext(null);

// Custom hook for using AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Placeholder component for Admin page
const AdminPage = () => <div>Admin Page</div>;

function App() {
  // State to manage authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token") // Initialize based on token presence
  );

  // useEffect hook to check for token on component mount and set authentication state
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true); // If token exists, user is authenticated
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set authorization header
    } else {
      setIsAuthenticated(false); // No token, user is not authenticated
      delete apiClient.defaults.headers.common["Authorization"]; // Remove authorization header
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to log in the user and store authentication tokens
  const login = (token, refreshToken, fullName) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("fullName", fullName);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set authorization header
    setIsAuthenticated(true); // Update authentication state
  };

  // Function to log out the user and clear tokens
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      // Attempt to logout via API if a refresh token exists
      if (refreshToken) {
        await apiClient.post(
          "/auth/logout",
          { refresh_token: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear all localStorage items and headers regardless of API success/failure
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("fullName");
      delete apiClient.defaults.headers.common["Authorization"];
      document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsAuthenticated(false); // Update state to not authenticated
    }
  };

  // Handle logout on page unload or custom "logout" event
  useEffect(() => {
    // Function to handle logout before the window unloads
    const handleBeforeUnload = () => {
      if (isAuthenticated) {
        logout();
      }
    };

    // Function to handle logout when a "logout" event is dispatched
    const handleLogout = () => {
      logout();
    };

    // Add event listeners for 'beforeunload' and custom 'logout' events
    window.addEventListener("beforeunload", handleBeforeUnload); // Log out on page close
    window.addEventListener("logout", handleLogout); // Log out on custom event

    // Clean up event listeners when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("logout", handleLogout);
    };
  }, [isAuthenticated]); // Effect runs when isAuthenticated changes

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {/* Show Navbar only when not authenticated */}
          {!isAuthenticated && <Navbar />}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LogIn />} />
            {/* <Route path="/signup" element={<SignUp />} /> */}

            {/* Protected routes */}
            <Route
              path="/admin"
              element={
                isAuthenticated ? <AdminPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/user"
              element={
                isAuthenticated ? <UserPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/history"
              element={
                isAuthenticated ? <HistoryPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/parking-lot"
              element={
                isAuthenticated ? <ParkingLotPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/imme-exit"
              element={
                isAuthenticated ? <ImmeExit /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
