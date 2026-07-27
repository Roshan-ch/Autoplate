import React, { useRef, useEffect, useState } from "react";

const CameraFeed = ({ onCapture }) => {
  // useRef hook to hold references to the video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // useState hook to manage any errors that occur during camera access
  const [error, setError] = useState(null);

  // useEffect hook to handle camera initialization and cleanup
  useEffect(() => {
    let stream = null;

    // Function to start the camera and access the video stream
    const startCamera = async () => {
      try {
        // Access the user's camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // If the video element exists, set the stream as its source
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // If an error occurs, log it to the console and set the error state
        console.error("Error accessing camera:", err);
        setError("Unable to access camera. Please check your permissions.");
      }
    };

    // Call the startCamera function when the component mounts
    startCamera();

    // Cleanup function to stop the camera when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and unmount

  // Function to capture an image from the video stream
  const captureImage = () => {
    // Check if both video and canvas elements exist
    if (videoRef.current && canvasRef.current) {
      // Get the 2D rendering context of the canvas
      const context = canvasRef.current.getContext("2d");
      // If the context exists, draw the current frame of the video onto the canvas
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        // Convert the canvas content to a JPEG blob and pass it to the onCapture callback
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
          }
        }, "image/jpeg");
      }
    }
  };

  // If there's an error, display an error message
  if (error) {
    return (
      <div className="flex items-center justify-center h-48 bg-red-100 rounded-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-red-500 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Render the camera feed and capture button
  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Video element to display the camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-auto rounded-md"
        />
        {/* Canvas element to hold the captured image (hidden) */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      {/* Button to trigger the image capture */}
      <button
        type="button"
        onClick={captureImage}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Capture Image
      </button>
    </div>
  );
};

export default CameraFeed;
