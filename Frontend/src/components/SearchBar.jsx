import React, { useState,useCallback } from "react";
import opencage from "opencage-api-client";
import MapView from "./MapView";
import AudioRecorder from "./AudioRecorder";

//const API_KEY = "YOUR_OPENCAGE_API_KEY"; // Replace with your API key
const API_KEY = import.meta.env.VITE_GEOCODER_API_KEY;

function SearchBar() {
  const [query, setQuery] = useState("");
  const [processVoiceCommandFn, setProcessVoiceCommandFn] = useState(null);
  //const [result, setResult] = useState(null);
  const [position, setPosition] = useState([20, 78]); // Default: India (lat, lng)
  
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await opencage.geocode({ q: query, key: API_KEY });
      if (response.results.length > 0) {
        const location = response.results[0];
        setPosition([location.geometry.lat, location.geometry.lng]); // Update position
      } else {
        console.log("No results found");
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
    }
  };
  const handleVoiceCommand = useCallback(
    async (data) => {
      if (processVoiceCommandFn) {
        console.log("Executing voice command:", data);
        await processVoiceCommandFn(data);
      } else {
        console.warn("Voice command processor not yet initialized");
      }
    },
    [processVoiceCommandFn]
  );
  

  return (
  


    <div className="relative w-screen h-screen">
      {/* Map Component */}
      <MapView position={position} setProcessVoiceCommand={setProcessVoiceCommandFn}  />

      {/* Search Bar (Top Left Corner) */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md flex items-center w-full max-w-md z-50">
        <form onSubmit={handleSearch} className="flex w-full">
          {/* Input Field */}
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 px-3"
          />

          {/* Search Button */}
          <button type="submit" className="text-gray-500 hover:text-gray-700 px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          
          <AudioRecorder onTranscription={handleVoiceCommand} />

          {/* Directions Button (New Arrow Icon) */}
          <button type="button" className="text-gray-500 hover:text-gray-700 px-3">
            <svg class="w-5 h-5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600 transition-colors duration-200"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" 
              viewBox="0 0 14 10">
              <path stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default SearchBar;