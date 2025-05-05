






//MapView.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import Places from "./Map/Places";

const createCustomIcon = (iconUrl, className) => {
  return L.icon({
    iconUrl: iconUrl || "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
    className: className || ""
  });
};

const MapController = ({ setProcessVoiceCommand, updateDirectionsData,position }) => {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [placeType, setPlaceType] = useState(null);
  const [fromMarker, setFromMarker] = useState(null);
  const [toMarker, setToMarker] = useState(null);

  // References to store markers
  const fromMarkerRef = useRef(null);
  const toMarkerRef = useRef(null);


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


//Added to make the search function work
  // Add a useEffect to watch for position changes
  useEffect(() => {
    if (position && position.length === 2) {
      map.setView(position, 13);
    }
  }, [position, map]);

  // Function to create and add markers
  const addLocationMarkers = useCallback((fromCoords, toCoords) => {
    // Remove existing markers
    if (fromMarkerRef.current) {
      map.removeLayer(fromMarkerRef.current);
    }
    if (toMarkerRef.current) {
      map.removeLayer(toMarkerRef.current);
    }

    // Create custom icons
    const fromIcon = createCustomIcon(null, "from-location-marker");
    const toIcon = createCustomIcon(null, "to-location-marker");

    // Create new markers
    if (fromCoords) {
      const newFromMarker = L.marker([fromCoords.lat, fromCoords.lng], { icon: fromIcon })
        .addTo(map)
        .bindPopup("📍 From Location");
      
      fromMarkerRef.current = newFromMarker;
      setFromMarker(newFromMarker);
    }
    
    if (toCoords) {
      const newToMarker = L.marker([toCoords.lat, toCoords.lng], { icon: toIcon })
        .addTo(map)
        .bindPopup("🏁 Destination");
      
      toMarkerRef.current = newToMarker;
      setToMarker(newToMarker);
    }
  }, [map]);

  // const createCustomRoutingControl = useCallback((waypoints) => {
  //   if (routingControl) routingControl.remove();
  //   const newRoutingControl = L.Routing.control({
  //     waypoints,
  //     show: false,
  //     plan: L.Routing.plan(waypoints, { createMarker: () => null })
  //   }).addTo(map);
  //   newRoutingControl.on('routesfound', (e) => {
  //     const route = e.routes[0];
  //     updateDirectionsData({
  //       totalDistance: route.summary.totalDistance,
  //       totalTime: route.summary.totalTime,
  //       steps: route.instructions.map(i => ({ distance: i.distance, text: i.text }))
  //     });
  //   });
  //   return newRoutingControl;
  // }, [map, routingControl, updateDirectionsData]);

  const createCustomRoutingControl = useCallback((waypoints) => {
    // Remove existing routing control if it exists
    if (routingControl) {
      routingControl.remove();
    }

    // Add markers for from and to locations
    if (waypoints.length >= 2) {
      const fromCoords = { lat: waypoints[0].lat, lng: waypoints[0].lng };
      const toCoords = { lat: waypoints[waypoints.length-1].lat, lng: waypoints[waypoints.length-1].lng };
      addLocationMarkers(fromCoords, toCoords);
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
            map.setView([transcription.coords[0].lat, transcription.coords[0].lng], 13);
          }
          break;
        case "directions":
          if (transcription.coords) {
            const waypoints = transcription.coords.map(coord => L.latLng(coord.lat, coord.lng));
            if (waypoints.length === 1 && currentLocation) {
              waypoints.unshift(L.latLng(currentLocation[0], currentLocation[1]));
            }
            setRoutingControl(createCustomRoutingControl(waypoints));
          }
          break;
        case "show_places":
          setPlaceType(transcription.place_type);
          break;
        case "hide_places":
          setPlaceType(null);
          break;
          case "clear_directions":
            if (routingControl) {
              routingControl.remove();
              setRoutingControl(null);
              
              // Also remove markers when clearing directions
              if (fromMarkerRef.current) {
                map.removeLayer(fromMarkerRef.current);
                fromMarkerRef.current = null;
              }
              if (toMarkerRef.current) {
                map.removeLayer(toMarkerRef.current);
                toMarkerRef.current = null;
              }
              
              if (updateDirectionsData) {
                updateDirectionsData(null);
              }
            }
            break;
            case "reset":
              // Clear any markers and routing
              if (routingControl) {
                routingControl.remove();
                setRoutingControl(null);
              }
              
              if (fromMarkerRef.current) {
                map.removeLayer(fromMarkerRef.current);
                fromMarkerRef.current = null;
              }
              
              if (toMarkerRef.current) {
                map.removeLayer(toMarkerRef.current);
                toMarkerRef.current = null;
              }
              
              if (currentLocation) {
                map.setView(currentLocation, 13);
              }
              
              if (updateDirectionsData) {
                updateDirectionsData(null);
              }
              break;
        default:
          console.log("Unknown command:", transcription.command);
      }
    },
    [map, currentLocation, routingControl, createCustomRoutingControl, updateDirectionsData]
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
      <Places visible={placeType !== null} userLocation={currentLocation} placeType={placeType} />
    </>
  );
};

const MapView = ({ position, setProcessVoiceCommand, updateDirectionsData }) => {
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
      <MapContainer center={position} zoom={13} className="absolute top-0 left-0 w-full h-full z-0" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController 
          setProcessVoiceCommand={setProcessVoiceCommand} 
          updateDirectionsData={safeUpdateDirectionsData}
          position={position}
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default MapView;