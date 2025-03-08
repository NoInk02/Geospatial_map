

// // MapView.jsx
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "leaflet-routing-machine";

// // Separate component to handle map operations
// const MapController = ({ setProcessVoiceCommand }) => {
//   const map = useMap();
//   const [routingControl, setRoutingControl] = useState(null);
//   const [currentLocation, setCurrentLocation] = useState(null);

//   useEffect(() => {
//     // Get user's location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setCurrentLocation([latitude, longitude]);
//           map.setView([latitude, longitude], 13);
//         },
//         (error) => console.error("Error getting location:", error)
//       );
//     }
//   }, [map]);

//   const processVoiceCommand = useCallback(
//     async (transcription) => {
//       if (!transcription?.command) {
//         console.warn("Invalid transcription:", transcription);
//         return;
//       }

//       console.log("Processing command:", transcription.command);

//       try {
//         switch (transcription.command) {
//           case "zoom_in":
//             if (transcription.coords?.[0]) {
//               map.setView(
//                 [transcription.coords[0].lat, transcription.coords[0].lng],
//                 map.getZoom()
//               );
//             }
//             else {
//               map.setZoom(map.getZoom() + 1);
//             }
//             break;

//           case "zoom_out":
//             map.setZoom(map.getZoom() - 1);
//             break;

//           case "search":
//             if (transcription.coords?.[0]) {
//               map.setView(
//                 [transcription.coords[0].lat, transcription.coords[0].lng],
//                 map.getZoom()
//               );
//             }
//             break;

//           case "directions":
//             if (transcription.coords) {
//               if (routingControl) routingControl.remove();

//               const waypoints = transcription.coords.map(coord =>
//                 L.latLng(coord.lat, coord.lng)
//               );

//               if (waypoints.length === 1 && currentLocation) {
//                 waypoints.unshift(L.latLng(currentLocation[0], currentLocation[1]));
//               }

//               const newRoutingControl = L.Routing.control({
//                 waypoints,
//                 routeWhileDragging: true,
//               }).addTo(map);

//               setRoutingControl(newRoutingControl);
//             }
//             break;

//           case "reset":
//             if (currentLocation) {
//               map.setView(currentLocation, 13);
//             }
//             break;

//           default:
//             console.log("Unknown command:", transcription.command);
//         }
//       } catch (error) {
//         console.error("Error processing voice command:", error);
//       }
//     },
//     [map, currentLocation, routingControl]
//   );

//   useEffect(() => {
//     setProcessVoiceCommand(() => processVoiceCommand);
//   }, [processVoiceCommand, setProcessVoiceCommand]);

//   return currentLocation ? (
//     <Marker position={currentLocation}>
//       <Popup>📍 Your Location</Popup>
//     </Marker>
//   ) : null;
// };

// // Main MapView component
// const MapView = ({ position, setProcessVoiceCommand }) => {
//   return (
//     <div className="w-screen h-screen z-0">
//       <MapContainer
//         center={[20.5937, 78.9629]}
//         zoom={13}
//         className="absolute top-0 left-0 w-full h-full z-0"
//         zoomControl={false}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         <MapController setProcessVoiceCommand={setProcessVoiceCommand} />
//         <ZoomControl position="bottomright" />
//       </MapContainer>
//     </div>
//   );
// };
// export default MapView;

// MapView.jsx
// MapView.jsx
// MapView.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Separate component to handle map operations
const MapController = ({ setProcessVoiceCommand, updateDirectionsData }) => {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Add CSS to hide routing container completely
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-routing-container, .leaflet-routing-alternatives-container {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          map.setView([latitude, longitude], 13);
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, [map]);

  // Custom routing control with events and UI customization
  const createCustomRoutingControl = useCallback((waypoints) => {
    // Remove existing routing control if it exists
    if (routingControl) {
      routingControl.remove();
    }

    // Create a custom routing control with completely hidden UI
    const newRoutingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: '#3388ff', weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      // Use a custom plan to avoid creating markers and UI elements
      plan: L.Routing.plan(waypoints, {
        createMarker: function() { return null; }, // No markers at waypoints
        draggableWaypoints: false,
        addWaypoints: false
      }),
      formatter: new L.Routing.Formatter({
        units: 'metric'
      })
    });

    // Add to map
    newRoutingControl.addTo(map);

    // Handle route finding errors
    newRoutingControl.on('routingerror', function(e) {
      console.error('Routing error:', e.error);
      if (updateDirectionsData) {
        updateDirectionsData({
          error: true,
          message: "Could not calculate route. Please try again later."
        });
      }
    });

    // Extract route info when available and send to parent component
    newRoutingControl.on('routesfound', function(e) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        
        // Format directions data for sidebar
        const formattedDirections = route.instructions.map(instruction => ({
          distance: instruction.distance,
          text: instruction.text,
          time: instruction.time,
          type: instruction.type
        }));

        const directionsData = {
          totalDistance: route.summary.totalDistance,
          totalTime: route.summary.totalTime,
          steps: formattedDirections
        };
        
        // Update parent component with route data
        if (updateDirectionsData) {
          updateDirectionsData(directionsData);
        }
      }
    });

    // Make sure to hide any containers that might appear
    setTimeout(() => {
      const containers = document.querySelectorAll('.leaflet-routing-container');
      containers.forEach(container => {
        if (container) container.style.display = 'none';
      });
    }, 100);

    return newRoutingControl;
  }, [map, routingControl, updateDirectionsData]);

  const processVoiceCommand = useCallback(
    async (transcription) => {
      if (!transcription?.command) {
        console.warn("Invalid transcription:", transcription);
        return;
      }

      console.log("Processing command:", transcription.command);

      try {
        switch (transcription.command) {
          case "zoom_in":
            if (transcription.coords?.[0]) {
              map.setView(
                [transcription.coords[0].lat, transcription.coords[0].lng],
                map.getZoom()
              );
            }
            else {
              map.setZoom(map.getZoom() + 1);
            }
            break;

          case "zoom_out":
            map.setZoom(map.getZoom() - 1);
            break;

          case "search":
            if (transcription.coords?.[0]) {
              map.setView(
                [transcription.coords[0].lat, transcription.coords[0].lng],
                map.getZoom()
              );
            }
            break;

          case "directions":
            if (transcription.coords) {
              const waypoints = transcription.coords.map(coord =>
                L.latLng(coord.lat, coord.lng)
              );

              if (waypoints.length === 1 && currentLocation) {
                waypoints.unshift(L.latLng(currentLocation[0], currentLocation[1]));
              }

              const newRoutingControl = createCustomRoutingControl(waypoints);
              setRoutingControl(newRoutingControl);
            }
            break;

          case "clear_directions":
            if (routingControl) {
              routingControl.remove();
              setRoutingControl(null);
              if (updateDirectionsData) {
                updateDirectionsData(null);
              }
            }
            break;

          case "reset":
            if (currentLocation) {
              map.setView(currentLocation, 13);
            }
            break;

          default:
            console.log("Unknown command:", transcription.command);
        }
      } catch (error) {
        console.error("Error processing voice command:", error);
      }
    },
    [map, currentLocation, routingControl, createCustomRoutingControl, updateDirectionsData]
  );

  useEffect(() => {
    setProcessVoiceCommand(() => processVoiceCommand);
  }, [processVoiceCommand, setProcessVoiceCommand]);

  return currentLocation ? (
    <Marker position={currentLocation}>
      <Popup>📍 Your Location</Popup>
    </Marker>
  ) : null;
};

// Main MapView component
const MapView = ({ position, setProcessVoiceCommand, updateDirectionsData }) => {
  // Use a ref for stable callback reference
  const stableUpdateDirectionsData = useRef(updateDirectionsData);
  
  // Update the ref when the prop changes
  useEffect(() => {
    stableUpdateDirectionsData.current = updateDirectionsData;
  }, [updateDirectionsData]);
  
  // Create a stable callback that uses the ref
  const safeUpdateDirectionsData = useCallback((data) => {
    if (stableUpdateDirectionsData.current) {
      stableUpdateDirectionsData.current(data);
    }
  }, []);

  return (
    <div className="w-screen h-screen z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={13}
        className="absolute top-0 left-0 w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController 
          setProcessVoiceCommand={setProcessVoiceCommand} 
          updateDirectionsData={safeUpdateDirectionsData}
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default MapView;