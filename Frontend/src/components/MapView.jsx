// MapView.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import Hospitals from "./Map/Hospitals";

// Separate component to handle map operations
const MapController = ({ setProcessVoiceCommand, updateDirectionsData, showHospitals, toggleHospitalsVisibility }) => {
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

          case "show_hospitals":
            toggleHospitalsVisibility(true);
            break;

          case "hide_hospitals":
            toggleHospitalsVisibility(false);
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
    [map, currentLocation, routingControl, createCustomRoutingControl, updateDirectionsData, toggleHospitalsVisibility]
  );

  useEffect(() => {
    setProcessVoiceCommand(() => processVoiceCommand);
  }, [processVoiceCommand, setProcessVoiceCommand]);

  return (
    <>
      {currentLocation && (
        <Marker position={currentLocation}>
          <Popup>📍 Your Location</Popup>
        </Marker>
      )}
      <Hospitals visible={showHospitals} userLocation={currentLocation} />
    </>
  );
};

// Main MapView component
const MapView = ({ position, setProcessVoiceCommand, updateDirectionsData }) => {
  // Use a ref for stable callback reference
  const stableUpdateDirectionsData = useRef(updateDirectionsData);
  const [showHospitals, setShowHospitals] = useState(false);
  
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

  // Provide toggleHospitalsVisibility function to pass to MapController
  const toggleHospitalsVisibility = useCallback((value) => {
    setShowHospitals(prev => value !== undefined ? value : !prev);
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
          showHospitals={showHospitals}
          toggleHospitalsVisibility={toggleHospitalsVisibility}
        />
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Expose the hospital toggle function */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => toggleHospitalsVisibility()}
          className={`bg-white p-2 rounded-lg shadow-md text-gray-700 hover:bg-gray-100 flex items-center ${showHospitals ? 'bg-blue-50' : ''}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`w-6 h-6 ${showHospitals ? 'text-blue-500' : 'text-gray-700'}`}
          >
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
          </svg>
          <span className="ml-2">{showHospitals ? 'Hide Hospitals' : 'Show Hospitals'}</span>
        </button>
      </div>
    </div>
  );
};

export default MapView;

