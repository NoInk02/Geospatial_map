// import React, { useState, useEffect } from 'react';
// import opencage from "opencage-api-client";

// const DirectionsInputSidebar = ({ 
//   isOpen, 
//   onClose, 
//   onGetDirections, 
//   currentLocation,
//   geocodeApiKey
// }) => {
//   const [fromLocation, setFromLocation] = useState("");
//   const [toLocation, setToLocation] = useState("");
//   const [useCurrentLocation, setUseCurrentLocation] = useState(false);
//   const [fromSuggestions, setFromSuggestions] = useState([]);
//   const [toSuggestions, setToSuggestions] = useState([]);
//   const [showFromSuggestions, setShowFromSuggestions] = useState(false);
//   const [showToSuggestions, setShowToSuggestions] = useState(false);
//   const [loading, setLoading] = useState(false);
  
//   // Update fromLocation when useCurrentLocation changes
//   useEffect(() => {
//     if (useCurrentLocation && currentLocation) {
//       setFromLocation("📍 Current Location");
//     } else if (useCurrentLocation && !currentLocation) {
//       // If current location is not available yet
//       setFromLocation("Loading current location...");
//     }
//   }, [useCurrentLocation, currentLocation]);
  
//   // Fetch suggestions for the "from" field
//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (fromLocation.length < 3 || useCurrentLocation) {
//         setFromSuggestions([]);
//         return;
//       }
      
//       try {
//         const response = await fetch(
//           `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromLocation)}&limit=5`,
//           {
//             headers: {
//               "Accept-Language": "en-US,en;q=0.9",
//               "User-Agent": "NavigationApp"
//             }
//           }
//         );
        
//         if (response.ok) {
//           const data = await response.json();
//           setFromSuggestions(data);
//           setShowFromSuggestions(data.length > 0);
//         }
//       } catch (error) {
//         console.error("Error fetching suggestions:", error);
//       }
//     };
    
//     const timeoutId = setTimeout(() => {
//       if (fromLocation.length >= 3 && !useCurrentLocation) {
//         fetchSuggestions();
//       }
//     }, 300);
    
//     return () => clearTimeout(timeoutId);
//   }, [fromLocation, useCurrentLocation]);
  
//   // Fetch suggestions for the "to" field
//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (toLocation.length < 3) {
//         setToSuggestions([]);
//         return;
//       }
      
//       try {
//         const response = await fetch(
//           `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toLocation)}&limit=5`,
//           {
//             headers: {
//               "Accept-Language": "en-US,en;q=0.9",
//               "User-Agent": "NavigationApp"
//             }
//           }
//         );
        
//         if (response.ok) {
//           const data = await response.json();
//           setToSuggestions(data);
//           setShowToSuggestions(data.length > 0);
//         }
//       } catch (error) {
//         console.error("Error fetching suggestions:", error);
//       }
//     };
    
//     const timeoutId = setTimeout(() => {
//       if (toLocation.length >= 3) {
//         fetchSuggestions();
//       }
//     }, 300);
    
//     return () => clearTimeout(timeoutId);
//   }, [toLocation]);
  
//   const handleFromSuggestionClick = (suggestion) => {
//     setFromLocation(suggestion.display_name);
//     setShowFromSuggestions(false);
//     setFromSuggestions([]);
//   };
  
//   const handleToSuggestionClick = (suggestion) => {
//     setToLocation(suggestion.display_name);
//     setShowToSuggestions(false);
//     setToSuggestions([]);
//   };
  
//   const handleGetDirections = async () => {
//     setLoading(true);
    
//     try {
//       let fromCoords;
//       let toCoords;
      
//       // Get "from" coordinates (either from current location or geocoding)
//       if (useCurrentLocation && currentLocation) {
//         fromCoords = { lat: currentLocation[0], lng: currentLocation[1] };
//       } else {
//         const fromResponse = await opencage.geocode({ q: fromLocation, key: geocodeApiKey });
//         if (fromResponse.results.length === 0) {
//           alert("Could not find the starting location. Please try again.");
//           setLoading(false);
//           return;
//         }
//         const fromLoc = fromResponse.results[0];
//         fromCoords = { lat: fromLoc.geometry.lat, lng: fromLoc.geometry.lng };
//       }
      
//       // Get "to" coordinates
//       const toResponse = await opencage.geocode({ q: toLocation, key: geocodeApiKey });
//       if (toResponse.results.length === 0) {
//         alert("Could not find the destination. Please try again.");
//         setLoading(false);
//         return;
//       }
//       const toLoc = toResponse.results[0];
//       toCoords = { lat: toLoc.geometry.lat, lng: toLoc.geometry.lng };
      
//       // Call the onGetDirections function with the coordinates
//       onGetDirections({
//         command: "directions",
//         coords: [fromCoords, toCoords]
//       });
      
//       // Close the sidebar
//       onClose();
//     } catch (error) {
//       console.error("Error getting directions:", error);
//       alert("Error getting directions. Please try again.");
//     }
    
//     setLoading(false);
//   };
  
//   // Handle the toggle button click
//   const handleToggleCurrentLocation = () => {
//     setUseCurrentLocation(!useCurrentLocation);
//     if (!useCurrentLocation) {
//       setShowFromSuggestions(false);
//     } else {
//       setFromLocation("");
//     }
//   };
  
//   // Check if the form is valid and can be submitted
//   const isFormValid = () => {
//     if (useCurrentLocation) {
//       return !!currentLocation && toLocation.length > 0;
//     }
//     return fromLocation.length > 0 && toLocation.length > 0;
//   };
  
//   if (!isOpen) return null;
  
//   return (
//     <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-lg z-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
//         <h3 className="font-bold text-lg">Directions</h3>
//         <button 
//           onClick={onClose}
//           className="text-white hover:text-gray-200"
//           aria-label="Close directions panel"
//         >
//           <svg 
//             xmlns="http://www.w3.org/2000/svg" 
//             viewBox="0 0 24 24" 
//             fill="currentColor" 
//             className="w-5 h-5"
//           >
//             <path 
//               fillRule="evenodd" 
//               d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" 
//               clipRule="evenodd" 
//             />
//           </svg>
//         </button>
//       </div>
      
//       {/* Form */}
//       <div className="p-4 flex-1">
//         {/* From Location */}
//         <div className="mb-4 relative">
//           <div className="flex items-center mb-2">
//             <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mr-2">
//               <span className="text-green-600">A</span>
//             </div>
//             <label className="text-gray-700 font-medium">From</label>
//             <div className="ml-auto">
//               <button 
//                 type="button"
//                 onClick={handleToggleCurrentLocation}
//                 className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${useCurrentLocation ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
//                 title={useCurrentLocation ? "Use entered location" : "Use current location"}
//               >
//                 <svg 
//                   xmlns="http://www.w3.org/2000/svg" 
//                   viewBox="0 0 24 24" 
//                   fill="currentColor" 
//                   className="w-4 h-4"
//                 >
//                   <path 
//                     fillRule="evenodd" 
//                     d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" 
//                     clipRule="evenodd" 
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>
//           <input 
//             type="text"
//             value={fromLocation}
//             onChange={(e) => setFromLocation(e.target.value)}
//             placeholder="Enter starting point"
//             disabled={useCurrentLocation}
//             className={`w-full p-2 border rounded-md ${useCurrentLocation ? 'bg-gray-100' : 'bg-white'}`}
//             onFocus={() => !useCurrentLocation && fromLocation.length >= 3 && setShowFromSuggestions(true)}
//             onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
//           />
          
//           {/* From Suggestions */}
//           {showFromSuggestions && fromSuggestions.length > 0 && (
//             <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
//               {fromSuggestions.map((suggestion, index) => (
//                 <div
//                   key={index}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                   onMouseDown={() => handleFromSuggestionClick(suggestion)}
//                 >
//                   <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
//                   <div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         {/* To Location */}
//         <div className="mb-4 relative">
//           <div className="flex items-center mb-2">
//             <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full mr-2">
//               <span className="text-red-600">B</span>
//             </div>
//             <label className="text-gray-700 font-medium">To</label>
//           </div>
//           <input 
//             type="text"
//             value={toLocation}
//             onChange={(e) => setToLocation(e.target.value)}
//             placeholder="Enter destination"
//             className="w-full p-2 border rounded-md"
//             onFocus={() => toLocation.length >= 3 && setShowToSuggestions(true)}
//             onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
//           />
          
//           {/* To Suggestions */}
//           {showToSuggestions && toSuggestions.length > 0 && (
//             <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
//               {toSuggestions.map((suggestion, index) => (
//                 <div
//                   key={index}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                   onMouseDown={() => handleToSuggestionClick(suggestion)}
//                 >
//                   <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
//                   <div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         {/* Get Directions Button */}
//         <button
//           type="button"
//           onClick={handleGetDirections}
//           disabled={!isFormValid() || loading}
//           className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
//             isFormValid() && !loading
//               ? 'bg-blue-500 text-white hover:bg-blue-600'
//               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           {loading ? (
//             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//           ) : (
//             <svg 
//               className="w-5 h-5 mr-2" 
//               aria-hidden="true"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none" 
//               viewBox="0 0 14 10"
//             >
//               <path 
//                 stroke="currentColor"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M1 5h12m0 0L9 1m4 4L9 9" 
//               />
//             </svg>
//           )}
//           {loading ? "Getting Directions..." : "Get Directions"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default DirectionsInputSidebar;
import React, { useState, useEffect } from 'react';
import opencage from "opencage-api-client";

const DirectionsInputSidebar = ({ 
  isOpen, 
  onClose, 
  onGetDirections, 
  currentLocation,
  geocodeApiKey
}) => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Update fromLocation when useCurrentLocation changes
  useEffect(() => {
    if (useCurrentLocation && currentLocation) {
      setFromLocation("📍 Current Location");
    } else if (useCurrentLocation && !currentLocation) {
      // If current location is not available yet
      setFromLocation("Loading current location...");
    }
  }, [useCurrentLocation, currentLocation]);
  
  // Fetch suggestions for the "from" field
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (fromLocation.length < 3 || useCurrentLocation) {
        setFromSuggestions([]);
        return;
      }
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromLocation)}&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "NavigationApp"
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setFromSuggestions(data);
          setShowFromSuggestions(data.length > 0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (fromLocation.length >= 3 && !useCurrentLocation) {
        fetchSuggestions();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fromLocation, useCurrentLocation]);
  
  // Fetch suggestions for the "to" field
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (toLocation.length < 3) {
        setToSuggestions([]);
        return;
      }
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toLocation)}&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "NavigationApp"
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setToSuggestions(data);
          setShowToSuggestions(data.length > 0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (toLocation.length >= 3) {
        fetchSuggestions();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [toLocation]);
  
  const handleFromSuggestionClick = (suggestion) => {
    setFromLocation(suggestion.display_name);
    setShowFromSuggestions(false);
    setFromSuggestions([]);
  };
  
  const handleToSuggestionClick = (suggestion) => {
    setToLocation(suggestion.display_name);
    setShowToSuggestions(false);
    setToSuggestions([]);
  };
  
  const handleGetDirections = async () => {
    setLoading(true);
    
    try {
      let fromCoords;
      let toCoords;
      
      // Get "from" coordinates (either from current location or geocoding)
      if (useCurrentLocation && currentLocation) {
        fromCoords = { lat: currentLocation[0], lng: currentLocation[1] };
      } else {
        const fromResponse = await opencage.geocode({ q: fromLocation, key: geocodeApiKey });
        if (fromResponse.results.length === 0) {
          alert("Could not find the starting location. Please try again.");
          setLoading(false);
          return;
        }
        const fromLoc = fromResponse.results[0];
        fromCoords = { lat: fromLoc.geometry.lat, lng: fromLoc.geometry.lng };
      }
      
      // Get "to" coordinates
      const toResponse = await opencage.geocode({ q: toLocation, key: geocodeApiKey });
      if (toResponse.results.length === 0) {
        alert("Could not find the destination. Please try again.");
        setLoading(false);
        return;
      }
      const toLoc = toResponse.results[0];
      toCoords = { lat: toLoc.geometry.lat, lng: toLoc.geometry.lng };
      
      // Call the onGetDirections function with the coordinates
      onGetDirections({
        command: "directions",
        coords: [fromCoords, toCoords]
      });
      
      // Close the sidebar
      onClose();
    } catch (error) {
      console.error("Error getting directions:", error);
      alert("Error getting directions. Please try again.");
    }
    
    setLoading(false);
  };
  
  // Handle the toggle button click
  const handleToggleCurrentLocation = () => {
    setUseCurrentLocation(!useCurrentLocation);
    if (!useCurrentLocation) {
      setShowFromSuggestions(false);
    } else {
      setFromLocation("");
    }
  };
  
  // Check if the form is valid and can be submitted
  const isFormValid = () => {
    if (useCurrentLocation) {
      return !!currentLocation && toLocation.length > 0;
    }
    return fromLocation.length > 0 && toLocation.length > 0;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h3 className="font-bold text-lg">Directions</h3>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
          aria-label="Close directions panel"
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
      </div>
      
      {/* Form */}
      <div className="p-4 flex-1">
        {/* From Location */}
        <div className="mb-4 relative">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mr-2">
              <span className="text-green-600">A</span>
            </div>
            <label className="text-gray-700 font-medium">From</label>
            <div className="ml-auto">
              <button 
                type="button"
                onClick={handleToggleCurrentLocation}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${useCurrentLocation ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                title={useCurrentLocation ? "Use entered location" : "Use current location"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
          <input 
            type="text"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            placeholder="Enter starting point"
            disabled={useCurrentLocation}
            className={`w-full p-2 border rounded-md ${useCurrentLocation ? 'bg-gray-100' : 'bg-white'}`}
            onFocus={() => !useCurrentLocation && fromLocation.length >= 3 && setShowFromSuggestions(true)}
            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
          />
          
          {/* From Suggestions */}
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              {fromSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => handleFromSuggestionClick(suggestion)}
                >
                  <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                  <div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* To Location */}
        <div className="mb-4 relative">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full mr-2">
              <span className="text-red-600">B</span>
            </div>
            <label className="text-gray-700 font-medium">To</label>
          </div>
          <input 
            type="text"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            placeholder="Enter destination"
            className="w-full p-2 border rounded-md"
            onFocus={() => toLocation.length >= 3 && setShowToSuggestions(true)}
            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
          />
          
          {/* To Suggestions */}
          {showToSuggestions && toSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              {toSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => handleToSuggestionClick(suggestion)}
                >
                  <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
                  <div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Get Directions Button */}
        <button
          type="button"
          onClick={handleGetDirections}
          disabled={!isFormValid() || loading}
          className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
            isFormValid() && !loading
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg 
              className="w-5 h-5 mr-2" 
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" 
              viewBox="0 0 14 10"
            >
              <path 
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9" 
              />
            </svg>
          )}
          {loading ? "Getting Directions..." : "Get Directions"}
        </button>
      </div>
    </div>
  );
};

export default DirectionsInputSidebar;