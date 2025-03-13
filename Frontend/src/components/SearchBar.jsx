import React, { useState, useCallback, useEffect, useRef } from "react";
import opencage from "opencage-api-client";
import MapView from "./MapView";
import AudioRecorder from "./AudioRecorder";
import DirectionsSidebar from "./DirectionsSidebar";
import DirectionsInputSidebar from "./DirectionsInputSidebar";

const API_KEY = import.meta.env.VITE_GEOCODER_API_KEY;

function SearchBar() {
  const [query, setQuery] = useState("");
  const [processVoiceCommandFn, setProcessVoiceCommandFn] = useState(null);
  const [position, setPosition] = useState([20, 78]); // Default: India (lat, lng)
  const [showDirections, setShowDirections] = useState(false);
  const [directionsData, setDirectionsData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showDirectionsInput, setShowDirectionsInput] = useState(false);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  // Handle outside clicks to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "SDS"
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    
    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (query.length >= 3) {
        fetchSuggestions();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
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
    setShowSuggestions(false);
  };

  const inputRef = useRef(null);
  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.display_name);
    setPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setSuggestions([]);
    setShowSuggestions(false);
    // Remove focus from the input
    if (inputRef.current) {
      inputRef.current.blur();
    }
    // Force a re-render by setting a timeout
    setTimeout(() => {
      setShowSuggestions(false);
    }, 0);
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

  const toggleDirectionsSidebar = () => {
    setShowDirections(!showDirections);
  };

  const toggleDirectionsInputSidebar = () => {
    setShowDirectionsInput(!showDirectionsInput);
    // Close directions sidebar when opening input sidebar
    if (!showDirectionsInput && showDirections) {
      setShowDirections(false);
    }
  };

  const clearDirections = () => {
    if (processVoiceCommandFn) {
      processVoiceCommandFn({ command: "clear_directions" });
    }
    setDirectionsData(null);
    setShowDirections(false);
  };

  // Function to update directions data from MapView
  const updateDirectionsData = useCallback((data) => {
    setDirectionsData(data);
    setShowDirections(true);
  }, []);

  // Function to handle get directions request from DirectionsInputSidebar
  const handleGetDirections = async (data) => {
    if (processVoiceCommandFn) {
      await processVoiceCommandFn(data);
    }
  };

  return (
    <div className="relative w-screen h-screen">
      {/* Map Component */}
      <MapView 
        position={position} 
        setProcessVoiceCommand={setProcessVoiceCommandFn}
        updateDirectionsData={updateDirectionsData}
      />

      {/* Search Bar (Top Left Corner) */}
      <div ref={searchRef} className={`absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md flex items-center w-full max-w-md z-50 transition-opacity duration-300 ${
    (showDirectionsInput) ? "opacity-0 pointer-events-none" : "opacity-100"
  }`}>
        <form onSubmit={handleSearch} className="flex w-full">
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 px-3"
            onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          />

          {/* Search Button */}
          <button type="submit" className="text-gray-500 hover:text-gray-700 px-3" title="Search">
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

          {/* Directions Request Button - to open the directions input sidebar */}
          <button 
            type="button" 
            onClick={toggleDirectionsInputSidebar}
            className={`text-gray-500 hover:text-gray-700 px-3 ${showDirectionsInput ? 'text-blue-500' : ''}`}
            title="Get directions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-5 h-5 ${showDirectionsInput ? 'text-blue-500' : 'text-gray-500'}`}>
              <path fill-rule="evenodd" d="M13.9439774,2.73116957 L14.0855382,2.86385819 L21.1361418,9.91446183 C22.2879527,11.0662728 22.2879527,12.9337272 21.1361418,14.0855382 L14.0855382,21.1361418 C12.9337272,22.2879527 11.0662728,22.2879527 9.91446183,21.1361418 L2.86385819,14.0855382 C1.71204727,12.9337272 1.71204727,11.0662728 2.86385819,9.91446183 L9.91446183,2.86385819 C11.0202003,1.75811971 12.7854759,1.71389017 13.9439774,2.73116957 Z M11.3286754,4.27807176 L4.27807176,11.3286754 C3.90730941,11.6994377 3.90730941,12.3005623 4.27807176,12.6713246 L11.3286754,19.7219282 C11.6994377,20.0926906 12.3005623,20.0926906 12.6713246,19.7219282 L19.7219282,12.6713246 C20.0926906,12.3005623 20.0926906,11.6994377 19.7219282,11.3286754 L12.6864633,4.29321048 L12.6243321,4.23401232 C12.2514817,3.9066126 11.6827715,3.92397563 11.3286754,4.27807176 Z M13.6128994,9.20970461 L13.7071068,9.29289322 L15.7071068,11.2928932 C16.0675907,11.6533772 16.0953203,12.2206082 15.7902954,12.6128994 L15.7071068,12.7071068 L13.7071068,14.7071068 C13.3165825,15.0976311 12.6834175,15.0976311 12.2928932,14.7071068 C11.9324093,14.3466228 11.9046797,13.7793918 12.2097046,13.3871006 L12.2928932,13.2928932 L12.584,13 L10,13 L10,14 C10,14.5522847 9.55228475,15 9,15 C8.48716416,15 8.06449284,14.6139598 8.00672773,14.1166211 L8,14 L8,12 C8,11.4871642 8.38604019,11.0644928 8.88337887,11.0067277 L9,11 L12.585,11 L12.2928932,10.7071068 C11.9324093,10.3466228 11.9046797,9.77939176 12.2097046,9.38710056 L12.2928932,9.29289322 C12.6533772,8.93240926 13.2206082,8.90467972 13.6128994,9.20970461 Z" />
            </svg>
          </button>

          {/* Directions Toggle Button - only when directions exist*/}
          {directionsData && (
            <button 
              type="button" 
              onClick={toggleDirectionsSidebar}
              className={`text-gray-500 hover:text-gray-700 px-3 ${directionsData ? 'text-blue-500' : ''}`}
              // disabled={!directionsData}
              title={showDirections ? "Hide directions" : "Show directions"}
            >
              <svg 
                className={`w-5 h-5 ${directionsData ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400'} transition-colors duration-200`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none" 
                viewBox="0 0 14 10"
              >
                <path 
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M1 5h12m0 0L9 1m4 4L9 9" 
                />
              </svg>
            </button>
          )}

          {/* Clear Directions Button (only visible when directions exist) */}
          {directionsData && (
            <button 
              type="button" 
              onClick={clearDirections}
              className="text-red-500 hover:text-red-700 px-3"
              title="Clear Directions"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <svg 
                  className="w-5 h-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <div className="truncate">
                  <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                  <div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Directions Input Sidebar - for entering from/to locations */}
      <DirectionsInputSidebar 
        isOpen={showDirectionsInput}
        onClose={toggleDirectionsInputSidebar}
        onGetDirections={handleGetDirections}
        currentLocation={currentLocation}
        geocodeApiKey={API_KEY}
      />

      {/* Directions Sidebar - only visible when showDirections is true and directionsData exists */}
      {showDirections && directionsData && (
        <DirectionsSidebar 
          directions={directionsData} 
          onClose={toggleDirectionsSidebar}
          onClear={clearDirections}
        />
      )}
    </div>
  );
}

export default SearchBar;