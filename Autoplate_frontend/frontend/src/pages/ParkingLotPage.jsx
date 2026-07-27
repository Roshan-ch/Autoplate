import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import DashboardLayout from "../components/DashboardLayout";
import { Car, Bike, Phone, UserRound } from "lucide-react";
import { useDebounce } from "use-debounce";

const ParkingLotPage = () => {
  // State variables using the useState hook
  const [detectedPlate, setDetectedPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("2-wheeler");
  const vehicleTypes = ["2-wheeler", "4-wheeler"];
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState("");
  const [isResident, setIsResident] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlateDetecting, setIsPlateDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]); // State for storing the list of similar vehicles
  const [processingExit, setProcessingExit] = useState(null); // State for storing the plate number currently being processed for exit
  const [hoveredVehicle, setHoveredVehicle] = useState(null); // State for storing the vehicle being hovered over in the similar vehicles list
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 }); // State for storing the position of the resident card popup
  const [vehicleStatus, setVehicleStatus] = useState("out"); // State for storing the vehicle status (in or out), default is "out"
  const [submitButtonEnabled, setSubmitButtonEnabled] = useState(false); // State to disable the submit button initially
  const similarVehiclesRef = useRef(null); // useRef for referencing the similar vehicles section
  const navigate = useNavigate(); // Hook for navigation

  // New state for video URL
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [videoProcessing, setVideoProcessing] = useState(false); // State to indicate video processing
  const [processingDelay, setProcessingDelay] = useState(8000); // State for processing delay
  const [videoReady, setVideoReady] = useState(false); // State to indicate if video is ready to play

  const SERVER_BASE_URL = "http://localhost:8000/"; // Define the base URL of the server

  const [debouncedPlate] = useDebounce(detectedPlate, 300); // Debounce the detected plate input for 300ms

  // useEffect hook to fetch data when the debounced plate changes
  useEffect(() => {
    const fetchInfo = async () => {
      if (debouncedPlate.trim()) {
        // Check if the debounced plate is not empty
        setIsLoading(true);
        setError(null);
        try {
          await fetchParkingLots();
          await fetchVehicleInfo();
          await fetchSimilarVehicles();
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to fetch data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsResident(null);
        setVehicleStatus("out");
        setSimilarVehicles([]);
      }
    };

    fetchInfo(); // Call the fetchInfo function
  }, [debouncedPlate]); // Run this effect when the debounced plate changes

  // Function to fetch the list of parking lots
  const fetchParkingLots = async () => {
    try {
      const response = await apiClient.get("/parking-lot/status/");
      setParkingLots(response.data);
      if (response.data.length > 0) {
        setSelectedParkingLot(response.data[0].parking_lot_id);
        setSubmitButtonEnabled(true);
      } else {
        setSubmitButtonEnabled(false);
      }
    } catch (err) {
      console.error("Error fetching parking lots:", err);
      setError("Failed to fetch parking lots. Please try again.");
      setTimeout(() => setError(null), 2000);
    }
  };

  // Function to fetch vehicle information
  const fetchVehicleInfo = async () => {
    try {
      const response = await apiClient.post(
        "/service/search-plates/",
        {
          plate_number: detectedPlate,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      ); // Make an API call to search for vehicle plates
      if (response.data) {
        // If data is returned
        setIsResident(response.data.is_resident);
        if (response.data.vehicle_type) {
          setVehicleType(response.data.vehicle_type);
        }
        setVehicleStatus(response.data.status || "out");
      } else {
        // If no data is returned
        setIsResident(false);
        setVehicleStatus("out");
      }
    } catch (err) {
      console.error("Error fetching vehicle info:", err);
      setIsResident(false);
      setVehicleStatus("out");
      if (err.response?.status === 404) {
        // setError(
        //   "No record found for this plate number. Please verify or add the vehicle."
        // );
      } else if (err.response?.status === 401) {
        setError("Authentication error. Please log in again.");
      } else {
        setError("Failed to fetch vehicle info. Please try again.");
      }
      setTimeout(() => setError(null), 3000);
    }
  };
  // Function to update vehicle type based on the first letter of the plate number
  const updateVehicleType = (plate) => {
    if (plate && plate.length > 0) {
      const firstLetter = plate.charAt(0).toUpperCase();
      if (firstLetter === "A") {
        setVehicleType("2-wheeler");
      } else if (["B", "G"].includes(firstLetter)) {
        setVehicleType("4-wheeler");
      }
    }
  };
  // Function to handle video selection
  const handleVideoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideoUrl(videoURL);
      setVideoProcessing(true); // Start video processing
      setVideoReady(false); // **RESET videoReady here**

      // Delay video playback until processing delay is complete
      setTimeout(() => {
        setVideoReady(true); // Signal that video can be played
        if (videoRef.current) {
          videoRef.current.src = videoURL;
          videoRef.current.play().catch((error) => {
            console.warn("Autoplay was prevented:", error);
          });
        }
        setVideoProcessing(false); // End video processing once playback starts
      }, processingDelay);

      processVideo(file); // Call the processVideo function
    }
  };

  // Function to process the video and send it to API
  const processVideo = async (file) => {
    setIsPlateDetecting(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await apiClient.post(
        "/service/upload-video/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Extract license plate from the detections object
      const licensePlate = response.data.detections.license_plate;
      setDetectedPlate(licensePlate);
      updateVehicleType(licensePlate);
      setSuccess(response.data.message);

      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error("Error processing video:", err);
      setError("Failed to process video. Please try again.");
    } finally {
      setIsPlateDetecting(false);
    }
  };

  // Function to handle video playback end
  const handleVideoEnded = () => {
    // You can add any logic here if needed when the video ends
    console.log("Video playback ended");
  };

  // Function to fetch similar vehicles
  const fetchSimilarVehicles = async () => {
    if (!detectedPlate) {
      // If no plate is detected
      console.log("Detected plate is empty, skipping similar vehicles fetch.");
      setSimilarVehicles([]);
      return;
    }

    try {
      const token = localStorage.getItem("access_token"); // Get the access token from local storage
      const response = await apiClient.post(
        "/service/search-similar/",
        { plate_number: detectedPlate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data.similar_vehicles)) {
        // If similar vehicles are found in the response
        setSimilarVehicles(response.data.similar_vehicles);
      } else {
        console.error("Unexpected response format:", response.data);
        setSimilarVehicles([]);
      }
    } catch (err) {
      console.error(
        "Error fetching similar vehicles:",
        err.response?.data || err.message
      );
      setError("Failed to fetch similar vehicles. Please try again.");
      setSimilarVehicles([]);
    }
  };
  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!detectedPlate.trim()) {
      // Check if the detected plate is empty
      setError("Please enter or capture a valid plate number.");
      setIsLoading(false);
      return;
    }

    const parkingLotId =
      selectedParkingLot || parkingLots[0]?.parking_lot_id || ""; // Get the selected parking lot ID
    try {
      const token = localStorage.getItem("access_token"); // Get the access token from local storage
      const response = await apiClient.post(
        "/service/finalize/",
        {
          finalized_plate_number: detectedPlate,
          vehicle_type: vehicleType,
          parking_lot_id: parkingLotId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) {
        // If there is an error in the response data
        throw new Error(response.data.error);
      }

      await fetchParkingLots(); // Fetch parking lots again to update the list
      setSuccess("Parking details successfully recorded.");
      resetForm(); // Reset the form
    } catch (err) {
      console.error("Error finalizing details:", err);
      setError(
        err.message ||
          (err.response?.status === 400
            ? "The vehicle is already in the parking lot or another error occurred."
            : "Failed to record parking details. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setDetectedPlate("");
    setVehicleType("2-wheeler");
    setIsResident(null);
    setSelectedParkingLot(parkingLots[0]?.parking_lot_id || "");
    setPreviewUrl(null);
    setSimilarVehicles([]);
    setVehicleStatus("out");
    setVideoUrl(null);
    setVideoReady(false);
  };

  // Function to handle a click on a similar vehicle
  const handleSimilarVehicleClick = (plateNumber) => {
    setDetectedPlate(plateNumber);
    fetchVehicleInfo();
  };

  // Function to handle vehicle exit
  const handleExit = (plateNumber) => {
    setProcessingExit(plateNumber);
    navigate("/imme-exit", { state: { plateNumber } });
  };

  // Function to handle mouse enter on a similar vehicle
  const handleMouseEnter = (event, vehicle) => {
    setHoveredVehicle(vehicle);
    calculateCardPosition(event);
  };

  // Function to calculate the position of the resident card
  const calculateCardPosition = (event) => {
    const offset = 10;
    let left = event.clientX + offset;
    let top = event.clientY + offset;

    // Adjust the position if the card would overflow the window
    if (left + 256 > window.innerWidth) {
      left = event.clientX - 256 - offset; // Adjust the left position
    }

    if (top + 200 > window.innerHeight) {
      top = event.clientY - 200 - offset; // Adjust the top position
    }

    setCardPosition({ top, left }); // Set the card position in state
  };

  // ResidentCard component to display resident information
  const ResidentCard = ({ vehicle }) => {
    if (!vehicle.resident_info) return null; // If there's no resident info, return null

    const photoUrl = vehicle.resident_info.photo
      ? `${SERVER_BASE_URL}${vehicle.resident_info.photo}`
      : null; // Construct the photo URL

    return (
      <div
        className="fixed z-50 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-400"
        style={{
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
          pointerEvents: "none",
        }}
      >
        <h3 className="text-lg font-semibold mb-2">Resident Card</h3>
        {photoUrl && (
          <img
            src={photoUrl || "/placeholder.svg"}
            alt="Resident"
            className="w-32 h-32 object-cover rounded-md mx-auto mb-2"
          />
        )}
        <p className="text-sm font-medium flex items-center">
          <UserRound className="w-4 h-4 mr-1" />
          {vehicle.resident_info.full_name}
        </p>
        <p className="text-sm text-gray-600 flex items-center mt-1">
          <Phone className="w-4 h-4 mr-1" />
          {vehicle.resident_info.phone_number}
        </p>
      </div>
    );
  };
  // useEffect hook to reset videoReady on component unmount
  useEffect(() => {
    return () => {
      setVideoReady(false); // Reset on unmount
    };
  }, []);
  // Render the component
  return (
    <DashboardLayout>
      {/* Form to handle parking lot entry */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Input section */}
            <div className="lg:w-1/3 space-y-6 w-full">
              {/* Detected Plate Number input */}
              <div>
                <label
                  htmlFor="detectedPlate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Detected Plate Number
                </label>
                <input
                  type="text"
                  id="detectedPlate"
                  value={detectedPlate}
                  onChange={(e) => {
                    setDetectedPlate(e.target.value);
                    updateVehicleType(e.target.value); // Update vehicle type on input change
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              {/* Vehicle Type select */}
              <div>
                <label
                  htmlFor="vehicleType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Vehicle Type
                </label>
                <select
                  id="vehicleType"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {/* Parking Lot select */}
              <div>
                <label
                  htmlFor="parkingLot"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Parking Lot
                </label>
                <select
                  id="parkingLot"
                  value={selectedParkingLot}
                  onChange={(e) => setSelectedParkingLot(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  {parkingLots.map((lot) => (
                    <option key={lot.parking_lot_id} value={lot.parking_lot_id}>
                      {lot.name} (Available: {lot.remaining})
                    </option>
                  ))}
                </select>
              </div>
              {/* Residency Status display */}
              <div>
                <label
                  htmlFor="residentStatus"
                  className="block text-sm font-medium dark:text-gray-200"
                >
                  Residency Status
                </label>
                {isResident === true && (
                  <p className="w-24 px-2 text-sm bg-blue-100 text-blue-800 text-center rounded-full mt-2">
                    Resident
                  </p>
                )}
                {isResident === false && (
                  <p className="w-28 px-2 text-sm bg-yellow-100 text-yellow-800 text-center rounded-full mt-2">
                    Non-Resident
                  </p>
                )}
                {isResident === null && (
                  <p className="w-28 px-2 text-sm bg-gray-200 text-gray-800 text-center rounded-full mt-2">
                    Status Pending...
                  </p>
                )}
              </div>
              {/* Enter/Exit button */}
              <div>
                {vehicleStatus === "in" ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleExit(detectedPlate);
                    }}
                    disabled={isLoading || processingExit === detectedPlate}
                    className={`w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      isLoading || processingExit === detectedPlate
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-md"
                    }`}
                  >
                    {processingExit === detectedPlate
                      ? "Processing..."
                      : "Exit"}
                  </button>
                ) : (
                  // If vehicle status is not "in", show the Enter Vehicle button
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      isPlateDetecting ||
                      !detectedPlate.trim() ||
                      !submitButtonEnabled
                    }
                    className="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading
                      ? "Processing..."
                      : isPlateDetecting
                      ? "Detecting Plate..."
                      : "Enter Vehicle"}
                  </button>
                )}
              </div>
            </div>
            {/* Video Upload and Preview section */}
            <div className="lg:w-2/3 flex flex-col gap-6 justify-center">
              {/* Video Upload */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Upload Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              {/* Video Preview */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Video Preview
                </label>
                <div
                  className="bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative"
                  style={{ height: "400px" }} // Preview height
                >
                  {videoUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        muted // Mute the video
                        autoPlay={videoReady} // Autoplay the video
                        onEnded={handleVideoEnded}
                        className="w-full h-full object-contain"
                      />
                      {videoProcessing && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No video selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Error and Success message section */}
          <div className="mt-4 w-full">
            {error && (
              <div
                className="p-4 bg-red-100 border border-red-400 text-red-700 rounded"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            {success && (
              <div
                className="p-4 bg-green-100 border border-green-400 text-green-700 rounded"
                role="alert"
              >
                <strong className="font-bold">Success:</strong>
                <span className="block sm:inline"> {success}</span>
              </div>
            )}
            {isPlateDetecting && (
              <div
                className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded"
                role="alert"
              >
                <strong className="font-bold">Detecting:</strong>
                <span className="block sm:inline">
                  {" "}
                  Detecting plate number...
                </span>
              </div>
            )}
          </div>
          {/* Similar Vehicles section */}
          <div
            className="mt-6 bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-700 w-full"
            ref={similarVehiclesRef}
          >
            <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b dark:text-gray-100 dark:bg-gray-700">
              Similar Vehicles
            </h2>
            <ul className="divide-y divide-gray-200">
              {similarVehicles.map((vehicle, index) => (
                <li
                  key={index}
                  onClick={() =>
                    handleSimilarVehicleClick(vehicle.plate_number)
                  }
                  onMouseEnter={(e) => handleMouseEnter(e, vehicle)}
                  onMouseLeave={() => setHoveredVehicle(null)}
                  className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer relative dark:hover:bg-gray-500"
                >
                  <div className="grid grid-cols-5 items-center gap-4">
                    <div className="flex items-center space-x-4 col-span-2">
                      <div className="flex-shrink-0">
                        {vehicle.vehicle_type.toLowerCase() === "2-wheeler" ? (
                          <Bike className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Car className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                          {vehicle.plate_number}
                        </p>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-50">
                          {vehicle.vehicle_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      {vehicle.is_resident ? (
                        <p className="px-2 inline-block text-sm bg-blue-100 text-blue-800 rounded-full">
                          Resident
                        </p>
                      ) : (
                        <p className="px-2 inline-block text-sm bg-yellow-100 text-yellow-800 rounded-full">
                          Non-Resident
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vehicle.status === "in"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vehicle.status === "in" ? "In" : "Out"}
                      </span>
                    </div>
                    <div className="text-center">
                      {vehicle.status === "in" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExit(vehicle.plate_number);
                          }}
                          disabled={processingExit === vehicle.plate_number}
                          className={`text-red-600 hover:bg-red-50 bg-red-100 rounded-lg px-3 py-1 font-semibold transition-all hover:scale-105 outline outline-2 outline-offset-0 outline-red-300 hover:outline-offset-4 hover:outline-red-400 ${
                            processingExit === vehicle.plate_number
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-md"
                          }`}
                        >
                          {processingExit === vehicle.plate_number
                            ? "Processing..."
                            : "Exit"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>

      {/* Display ResidentCard component when a vehicle is hovered */}
      {hoveredVehicle && <ResidentCard vehicle={hoveredVehicle} />}
    </DashboardLayout>
  );
};

export default ParkingLotPage;
