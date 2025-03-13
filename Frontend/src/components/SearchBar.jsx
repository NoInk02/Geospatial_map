

// import React, { useState, useCallback } from "react";
// import opencage from "opencage-api-client";
// import MapView from "./MapView";
// import AudioRecorder from "./AudioRecorder";
// import DirectionsSidebar from "./DirectionsSidebar";

// const API_KEY = import.meta.env.VITE_GEOCODER_API_KEY;

// function SearchBar() {
//   const [query, setQuery] = useState("");
//   const [processVoiceCommandFn, setProcessVoiceCommandFn] = useState(null);
//   const [position, setPosition] = useState([20, 78]); // Default: India (lat, lng)
//   const [showDirections, setShowDirections] = useState(false);
//   const [directionsData, setDirectionsData] = useState(null);
  
//   const handleSearch = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await opencage.geocode({ q: query, key: API_KEY });
//       if (response.results.length > 0) {
//         const location = response.results[0];
//         setPosition([location.geometry.lat, location.geometry.lng]); // Update position
//       } else {
//         console.log("No results found");
//       }
//     } catch (error) {
//       console.error("Error fetching geocode data:", error);
//     }
//   };

//   const handleVoiceCommand = useCallback(
//     async (data) => {
//       if (processVoiceCommandFn) {
//         console.log("Executing voice command:", data);
//         await processVoiceCommandFn(data);
//       } else {
//         console.warn("Voice command processor not yet initialized");
//       }
//     },
//     [processVoiceCommandFn]
//   );

//   const toggleDirectionsSidebar = () => {
//     setShowDirections(!showDirections);
//   };

//   const clearDirections = () => {
//     if (processVoiceCommandFn) {
//       processVoiceCommandFn({ command: "clear_directions" });
//     }
//     setDirectionsData(null);
//     setShowDirections(false);
//   };

//   // Function to update directions data from MapView
//   const updateDirectionsData = useCallback((data) => {
//     setDirectionsData(data);
//     setShowDirections(true);
//   }, []);

//   return (
//     <div className="relative w-screen h-screen">
//       {/* Map Component */}
//       <MapView 
//         position={position} 
//         setProcessVoiceCommand={setProcessVoiceCommandFn}
//         updateDirectionsData={updateDirectionsData}
//       />

//       {/* Search Bar (Top Left Corner) */}
//       <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md flex items-center w-full max-w-md z-50">
//         <form onSubmit={handleSearch} className="flex w-full">
//           {/* Input Field */}
//           <input
//             type="text"
//             placeholder="Search..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 px-3"
//           />

//           {/* Search Button */}
//           <button type="submit" className="text-gray-500 hover:text-gray-700 px-3">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//               className="w-5 h-5"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </button>
          
//           <AudioRecorder onTranscription={handleVoiceCommand} />

//           {/* Directions Toggle Button */}
//           <button 
//             type="button" 
//             onClick={toggleDirectionsSidebar}
//             className={`text-gray-500 hover:text-gray-700 px-3 ${directionsData ? 'text-blue-500' : ''}`}
//             disabled={!directionsData}
//           >
//             <svg 
//               className={`w-5 h-5 ${directionsData ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400'} transition-colors duration-200`}
//               aria-hidden="true"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none" 
//               viewBox="0 0 14 10"
//             >
//               <path 
//                 stroke="currentColor"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2.5"
//                 d="M1 5h12m0 0L9 1m4 4L9 9" 
//               />
//             </svg>
//           </button>

//           {/* Clear Directions Button (only visible when directions exist) */}
//           {directionsData && (
//             <button 
//               type="button" 
//               onClick={clearDirections}
//               className="text-red-500 hover:text-red-700 px-3"
//             >
//               <svg 
//                 xmlns="http://www.w3.org/2000/svg" 
//                 viewBox="0 0 24 24" 
//                 fill="currentColor" 
//                 className="w-5 h-5"
//               >
//                 <path 
//                   fillRule="evenodd" 
//                   d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" 
//                   clipRule="evenodd" 
//                 />
//               </svg>
//             </button>
//           )}
//         </form>
//       </div>

//       {/* Directions Sidebar - only visible when showDirections is true and directionsData exists */}
//       {showDirections && directionsData && (
//         <DirectionsSidebar 
//           directions={directionsData} 
//           onClose={toggleDirectionsSidebar}
//           onClear={clearDirections}
//         />
//       )}
//     </div>
//   );
// }

// export default SearchBar;

import React, { useState, useCallback } from "react";
import opencage from "opencage-api-client";
import MapView from "./MapView";
import AudioRecorder from "./AudioRecorder";
import DirectionsSidebar from "./DirectionsSidebar";

const API_KEY = import.meta.env.VITE_GEOCODER_API_KEY;

function SearchBar() {
  const [query, setQuery] = useState("");
  const [processVoiceCommandFn, setProcessVoiceCommandFn] = useState(null);
  const [position, setPosition] = useState([20, 78]); // Default: India (lat, lng)
  const [showDirections, setShowDirections] = useState(false);
  const [directionsData, setDirectionsData] = useState(null);
  const [isHospitalMode, setIsHospitalMode] = useState(false);
  
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

  const toggleDirectionsSidebar = () => {
    setShowDirections(!showDirections);
  };

  const clearDirections = () => {
    if (processVoiceCommandFn) {
      processVoiceCommandFn({ command: "clear_directions" });
    }
    setDirectionsData(null);
    setShowDirections(false);
  };

  const toggleHospitalMode = () => {
    // Toggle hospital visibility
    if (processVoiceCommandFn) {
      const newMode = !isHospitalMode;
      processVoiceCommandFn({ 
        command: newMode ? "show_hospitals" : "hide_hospitals" 
      });
      setIsHospitalMode(newMode);
    }
  };

  // Function to update directions data from MapView
  const updateDirectionsData = useCallback((data) => {
    setDirectionsData(data);
    setShowDirections(true);
  }, []);

  return (
    <div className="relative w-screen h-screen">
      {/* Map Component */}
      <MapView 
        position={position} 
        setProcessVoiceCommand={setProcessVoiceCommandFn}
        updateDirectionsData={updateDirectionsData}
      />

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

          {/* Hospital Button */}
          <button 
            type="button" 
            onClick={toggleHospitalMode}
            className={`text-gray-500 hover:text-gray-700 px-3 ${isHospitalMode ? 'text-red-500' : ''}`}
            title="Find hospitals"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`w-5 h-5 ${isHospitalMode ? 'text-red-500' : ''}`}
            >
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Directions Toggle Button */}
          <button 
            type="button" 
            onClick={toggleDirectionsSidebar}
            className={`text-gray-500 hover:text-gray-700 px-3 ${directionsData ? 'text-blue-500' : ''}`}
            disabled={!directionsData}
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

          {/* Clear Directions Button (only visible when directions exist) */}
          {directionsData && (
            <button 
              type="button" 
              onClick={clearDirections}
              className="text-red-500 hover:text-red-700 px-3"
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
      </div>

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