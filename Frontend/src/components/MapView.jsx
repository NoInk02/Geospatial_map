

// MapView.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Separate component to handle map operations
const MapController = ({ setProcessVoiceCommand }) => {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

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
            map.setZoom(map.getZoom() + 1);
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
              if (routingControl) routingControl.remove();

              const waypoints = transcription.coords.map(coord =>
                L.latLng(coord.lat, coord.lng)
              );

              if (waypoints.length === 1 && currentLocation) {
                waypoints.unshift(L.latLng(currentLocation[0], currentLocation[1]));
              }

              const newRoutingControl = L.Routing.control({
                waypoints,
                routeWhileDragging: true,
              }).addTo(map);

              setRoutingControl(newRoutingControl);
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
    [map, currentLocation, routingControl]
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
const MapView = ({ position, setProcessVoiceCommand }) => {
  return (
    <div className="w-screen h-screen z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={13}
        className="absolute top-0 left-0 w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController setProcessVoiceCommand={setProcessVoiceCommand} />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};
export default MapView;


// const processVoiceCommand = useCallback(async (transcription) => {
  //     if (!map || !transcription?.command) {
  //       console.warn("Map or transcription not ready:", { map, transcription });
  //       return;
  //     }
      
  //     console.log("Processing command:", transcription.command);
    
  //     try {
  //       switch (transcription.command) {
  //         case "zoom_in":
  //           console.log("Zooming in from current zoom level:", map.getZoom());
  //           map.setZoom(map.getZoom() + 1);
  //           break;
    
  //         case "zoom_out":
  //           map.setZoom(map.getZoom() - 1);
  //           break;
    
  //         case "search":
  //           if (transcription.coords?.[0]) {
  //             map.setView(
  //               [transcription.coords[0].lat, transcription.coords[0].lng],
  //               map.getZoom()
  //             );
  //           }
  //           break;
    
  //         case "directions":
  //           if (transcription.coords) {
  //             if (routingControl) routingControl.remove();
              
  //             const waypoints = transcription.coords.map(coord => 
  //               L.latLng(coord.lat, coord.lng)
  //             );
    
  //             // If only one coordinate provided, use current location as start
  //             if (waypoints.length === 1) {
  //               waypoints.unshift(L.latLng(currentLat, currentLong));
  //             }
    
  //             const newRoutingControl = L.Routing.control({
  //               waypoints,
  //               routeWhileDragging: true,
  //             }).addTo(map);
    
  //             setRoutingControl(newRoutingControl);
  //           }
  //           break;
    
  //         case "reset":
  //           map.setView([currentLat, currentLong], 12);
  //           break;
    
  //         case "switch":
  //           if (transcription.map_type) {
  //             // Implement layer switching logic here if needed
  //             console.log("Switching to map type:", transcription.map_type);
  //           }
  //           break;
    
  //         default:
  //           console.log("Unknown command:", transcription.command);
  //       }
  //     } catch (error) {
  //       console.error("Error processing voice command:", error);
  //     }
  //   },[map, currentLat, currentLong, routingControl]);