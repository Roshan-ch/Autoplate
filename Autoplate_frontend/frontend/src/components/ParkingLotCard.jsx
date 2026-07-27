import React from "react";

const ParkingLotCard = ({ lot }) => {
  // Calculate the percentage of occupied parking spaces
  const percentage = Math.round((lot.occupied / lot.total) * 100);

  // Function to determine the color of the progress bar based on occupancy percentage
  const getColor = (percentage) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-400">
      <h3 className="text-lg font-semibold mb-2">{lot.name}</h3>
      <div className="w-full">
        {/* Progress bar container */}
        <div className="relative h-4 bg-gray-200 rounded-full shadow-inner overflow-hidden dark:bg-gray-300">
          {/* Progress bar */}
          <div
            className={`h-full ${getColor(
              percentage
            )} transition-all duration-500 ease-out rounded-full relative`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {/* Percentage text inside the progress bar */}
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
      {/* Display occupied and total spaces */}
      <div className="mt-2 flex justify-between text-sm">
        <span>Occupied: {lot.occupied}</span>
        <span>Total: {lot.total}</span>
      </div>
      {/* Display available spaces */}
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-800">
        Available: {lot.remaining}
      </div>
    </div>
  );
};

export default ParkingLotCard;
