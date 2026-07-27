import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import axios from "axios";
import { useAuth } from "../App";

const LogIn = () => {
  // State variables for form inputs, messages, loading state, OTP status, and user ID
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Function to handle the login process (email/password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Make an API call to the login endpoint
      const response = await apiClient.post("/auth/login/", {
        email,
        password,
      });

      // Check if OTP was sent successfully
      if (response.data.otp_sent) {
        setIsOtpSent(true);
        setUserId(response.data.user_id);
        setMessage(
          "OTP sent successfully! Please check your SMS for the verification code."
        );
      } else {
        setMessage("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      // Handle different types of errors
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400 || error.response.status === 401) {
          setMessage("Invalid email or password.");
        } else if (error.response.data && error.response.data.error) {
          setMessage(error.response.data.error);
        } else {
          setMessage("An unexpected error occurred during login.");
        }
      } else {
        setMessage("An unexpected error occurred during login.");
      }
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle OTP verification
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Make an API call to verify the OTP
      const response = await apiClient.post("/auth/verify-otp/", {
        user_id: userId,
        otp_code: otpCode,
      });

      // Extract user data from the response
      const { access_token, refresh_token, full_name, role } = response.data;
      setMessage("Login successful!");

      // Store tokens and user info in local storage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("fullName", full_name);
      localStorage.setItem("role", role);

      // Call the login function from the AuthContext
      login(access_token, refresh_token, full_name, role);

      // Redirect based on user role after a delay
      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "http://localhost:8000/admin";
        } else {
          navigate("/user");
        }
      }, 2000);
    } catch (error) {
      // Handle OTP verification errors
      if (axios.isAxiosError(error) && error.response) {
        const backendError = error.response.data.error;
        if (
          backendError === "Invalid email or password." ||
          error.response.status === 400 ||
          error.response.status === 401
        ) {
          setMessage("Invalid OTP code.");
        } else if (backendError) {
          setMessage(backendError);
        } else {
          setMessage("An unexpected error occurred during OTP verification.");
        }
      } else {
        setMessage("An unexpected error occurred during OTP verification.");
      }
      console.error("OTP Verification Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isOtpSent
              ? "Enter the OTP sent to your phone number"
              : "Enter your email and password to login"}
          </p>
        </div>
        {/* Conditionally render the appropriate form based on OTP status */}
        <form
          className="mt-8 space-y-6"
          onSubmit={isOtpSent ? handleOtpVerification : handleLogin}
        >
          {!isOtpSent ? (
            // Render email and password fields
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          ) : (
            // Render OTP input field
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>
          )}
          {/* Display message to the user */}
          {message && (
            <div
              className={`mt-2 p-4 rounded-md ${
                message.includes("successful")
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading
                ? "Processing..."
                : isOtpSent
                ? "Verify OTP"
                : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
