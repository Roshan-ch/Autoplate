import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../api/apiClient";

const ImmeExit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Extract plateNumber from the location state
  const { plateNumber } = location.state || {};
  // Loading state for fetching data
  const [isLoading, setIsLoading] = useState(true);
  // State to store fee details fetched from the API
  const [feeDetails, setFeeDetails] = useState(null);
  // State to manage confirmation process
  const [isConfirming, setIsConfirming] = useState(false);
  // State for error handling
  const [error, setError] = useState(null);
  // State for success messages
  const [success, setSuccess] = useState(null);

  // useEffect hook to fetch fee details when the component mounts or plateNumber changes
  useEffect(() => {
    // Redirect if no plateNumber is available
    if (!plateNumber) {
      setError("No plate number provided. Please try again.");
      setIsLoading(false);
      return;
    }
    const fetchFeeDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await apiClient.post(
          "/service/calculate-fee/",
          { plate_number: plateNumber },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFeeDetails(response.data);
      } catch (err) {
        console.error("Error fetching fee details:", err);
        setError("Failed to fetch fee details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeDetails();
  }, [plateNumber]);

  // Function to format date and time
  const formatDateTime = (dateString) => {
    return dateString
      ? format(parseISO(dateString), "MMM dd, yyyy HH:mm:ss")
      : "-";
  };

  // Function to handle the exit confirmation
  const handleConfirmExit = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      await apiClient.post(
        "/service/exit/",
        { plate_number: plateNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Vehicle exit confirmed successfully.");
      setTimeout(() => navigate("/parking-lot"), 2000);
    } catch (err) {
      console.error("Error confirming exit:", err);
      setError("Failed to confirm exit. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  // Function to handle printing of the receipt
  const handlePrint = () => {
    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Function to safely access fee details, return '-' if undefined
    const getFeeDetail = (value) => {
      return value !== undefined && value !== null ? value : "-";
    };

    // Create the receipt HTML with thermal printer formatting
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Parking Receipt</title>
          <style>
            @page {
              margin: 0;
              size: 80mm 200mm; /* Standard thermal paper width */
            }
            body {
              margin: 0;
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 72mm; /* Account for margins */
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .detail-label {
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0;">PARKING RECEIPT</h2>
            <p style="margin: 5px 0;">${getFeeDetail(
              feeDetails?.parking_lot_name
            )}</p>
          </div>
          
          <div class="detail-row">
            <span>Plate Number:</span>
            <span>${getFeeDetail(feeDetails?.plate_number)}</span>
          </div>
          <div class="detail-row">
            <span>Entry Time:</span>
            <span>${formatDateTime(feeDetails?.entry_time)}</span>
          </div>
          <div class="detail-row">
            <span>Exit Time:</span>
            <span>${formatDateTime(feeDetails?.current_time)}</span>
          </div>
          <div class="detail-row">
            <span>Duration:</span>
            <span>${getFeeDetail(feeDetails?.total_time_parked)}</span>
          </div>
          <div class="detail-row">
            <span>Rate/Hour:</span>
            <span>Rs. ${getFeeDetail(
              feeDetails?.rate_per_hour?.toFixed(2)
            )}</span>
          </div>
          <div class="detail-row" style="font-weight: bold; margin-top: 10px;">
            <span>Total Amount:</span>
            <span>Rs. ${getFeeDetail(
              feeDetails?.calculated_fee?.toFixed(2)
            )}</span>
          </div>
          
          <div class="footer">
            <p>Thank you for using our parking service!</p>
          </div>
        </body>
      </html>
    `;
    // Check if the Iframe content window exists
    if (iframe.contentWindow) {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(receiptHTML);
      iframe.contentWindow.document.close();

      // Wait for content to load before printing
      iframe.onload = () => {
        try {
          // Print the receipt
          iframe.contentWindow.print();

          // Remove the iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        } catch (error) {
          console.error("Printing failed:", error);
        }
      };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto pt-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !feeDetails) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto pt-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="mb-4">
                {error || "No fee details available. Please try again."}
              </p>
              <button
                onClick={() => navigate("/parking-lot")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Return
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Success state: Render exit confirmation details
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pt-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">
              Exit Confirmation
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="exitdetails">Plate Number</h3>
                  <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                    {feeDetails.plate_number}
                  </p>
                </div>
                <div>
                  <h3 className="exitdetails">Entry Time</h3>
                  <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                    {formatDateTime(feeDetails.entry_time)}
                  </p>
                </div>
                <div>
                  <h3 className="exitdetails">Current Time</h3>
                  <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                    {formatDateTime(feeDetails.current_time)}
                  </p>
                </div>
                <div>
                  <h3 className="exitdetails">Total Time Parked</h3>
                  <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                    {feeDetails.total_time_parked}
                  </p>
                </div>
                {feeDetails.calculated_fee !== undefined && (
                  <div>
                    <h3 className="exitdetails">Calculated Fee</h3>
                    <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                      Rs. {feeDetails.calculated_fee.toFixed(2)}
                    </p>
                  </div>
                )}
                {feeDetails.rate_per_hour !== undefined && (
                  <div>
                    <h3 className="exitdetails">Rate per Hour</h3>
                    <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                      Rs. {feeDetails.rate_per_hour.toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="exitdetails">Parking Lot</h3>
                  <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                    {feeDetails.parking_lot_name}
                  </p>
                </div>
              </div>
              {/* Add print button in the Exit confirmation section */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => navigate("/parking-lot")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:hover:bg-gray-600 dark:text-gray-100"
                >
                  Return
                </button>
                {/* Set confirm button to the right */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Print Receipt
                </button>
                {/* Add print button in the Exit confirmation section */}
                <button
                  onClick={handleConfirmExit}
                  disabled={isConfirming}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  {isConfirming ? "Confirming..." : "Confirm Exit"}
                </button>
              </div>
              {error && (
                <div
                  className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
                  role="alert"
                >
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}
              {success && (
                <div
                  className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
                  role="alert"
                >
                  <strong className="font-bold">Success:</strong>
                  <span className="block sm:inline"> {success}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImmeExit;
