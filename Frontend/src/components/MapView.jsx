// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// const UserLocationMarker = () => {
//   const [position, setPosition] = useState(null);
//   const map = useMap();

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       console.log("Geolocation is not supported by your browser.");
//       return;
//     }

//     // Explicitly ask for permission
//     navigator.permissions.query({ name: "geolocation" }).then((result) => {
//       if (result.state === "denied") {
//         alert("Location access is blocked. Please enable it in browser settings.");
//       }
//     });

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const { latitude, longitude } = pos.coords;
//         console.log("Accurate Location:", latitude, longitude);
//         setPosition([latitude, longitude]);
//         map.setView([latitude, longitude], 12);
//       },
//       (err) => console.error("Location error:", err),
//       {
//         enableHighAccuracy: true, // Uses GPS if available
//         timeout: 10000, // Wait for up to 10 seconds
//         maximumAge: 0, // Prevents using cached locations
//       }
//     );
    

//     // return () => navigator.geolocation.clearWatch(watchId); // Cleanup on unmount
//   }, [map]);

//   return position === null ? null : <Marker position={position} />;
// };

// const RecenterMap = ({ position }) => {
//   const map = useMap();
//   useEffect(() => {
//     map.setView(position, 13);
//   }, [position, map]);

//   return null;
// };

// const MapView = ({ position }) => {

//   return (
//     <MapContainer
//       center={position}
//       zoom={13}
//       className="absolute top-0 left-0 w-full h-full z-0"
//       style={{ height: "100vh", width: "100vw" }}
//       zoomControl={false} // Disable default zoom control
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <UserLocationMarker /> {/* Adds user location */}
//       <Marker position={position}>
//         <Popup>📍 Selected Location</Popup>
//       </Marker>
//       <RecenterMap position={position} />
//       <ZoomControl position="bottomright" />
//     </MapContainer>
//   );
// };



// export default MapView;


//*************************ardhambardha work avutu********************** */
import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import AudioRecorder from "./AudioRecorder";

const UserLocationMarker = ({ setCurrentLatLong }) => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser.");
      return;
    }

    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "denied") {
        alert("Location access is blocked. Please enable it in browser settings.");
      }
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("User Location:", latitude, longitude);
        setPosition([latitude, longitude]);
        setCurrentLatLong(latitude, longitude); // Update state in parent
        map.setView([latitude, longitude], 12);
      },
      (err) => console.error("Location error:", err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return position === null ? null : <Marker position={position} />;
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    console.log("Recentering");
    if (position) map.setView(position, 13);
  }, [position, map]);

  return null;
};

const MapView = () => {
  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLong, setCurrentLong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentLat !== null && currentLong !== null && map !== null) {
      setIsLoading(false); // Allow processVoiceCommand to run
    }
  }, [currentLat, currentLong, map]);

  useEffect(() => {
    console.log("Map instance created:", map);
  }, [map]);
  
  useEffect(() => {
    console.log("Current Latitude and Longitude:", currentLat, currentLong);
  }, [currentLat, currentLong]);

  // Function to process voice commands
  // const processVoiceCommand = useCallback(async (transcription) => {
  //   if (!map) {
  //     console.log("Map instance not available.");
  //     return;
  //   }
  //   console.log("processVoiceCommand called with:",  transcription);
  //   try {
  //     // const formData = new FormData();
  //     // const res = await fetch("http://127.0.0.1:8000/transcribe/", {
  //     //   method: "POST",
  //     //   // body: formData,
  //     //   headers: {
  //     //     "Content-Type": "application/json",
  //     //   },
  //     //   body: JSON.stringify({ command: transcription.command }),
  //     // });

  //     // const response = await res.json();
  //     const response = transcription;
  //     console.log("Voice Command Response:", response);
  //     console.log("Processing command: ", response.command);

  //     if (!map || currentLat === null || currentLong === null) return;

  //     switch (response.command) {
  //       case "zoom_in":
  //         console.log("Zooming in from current zoom level:", map.getZoom());
  //         map.setZoom(map.getZoom() + 1);
  //         break;

  //       case "zoom_out":
  //         console.log("Zooming out from current zoom level:", map.getZoom());
  //         map.setZoom(map.getZoom() - 1);
  //         break;

  //       case "search":
  //         if (response.coords) {
  //           map.setView([response.coords[0].lat, response.coords[0].lng], map.getZoom());
  //         }
  //         break;

  //       case "directions":
  //         if (response.coords) {
  //           const waypoints = response.coords.map((coord) => L.latLng(coord.lat, coord.lng));

  //           if (routingControl) {
  //             routingControl.remove();
  //           }

  //           const newRoutingControl = L.Routing.control({
  //             waypoints: waypoints,
  //             routeWhileDragging: true,
  //           }).addTo(map);

  //           setRoutingControl(newRoutingControl);
  //         }
  //         break;

  //       case "reset":
  //         map.setView([currentLat, currentLong], 12);
  //         break;

  //       default:
  //         console.log("Unknown command:", response.command);
  //     }
  //   } catch (error) {
  //     console.error("Error processing voice command:", error);
  //   }
  // }, [map, currentLat, currentLong]);

  const processVoiceCommand = useCallback(async (transcription) => {
    if (isLoading) {
      console.log("Waiting for map and user location to be available.");
      return;
    }

    console.log("processVoiceCommand called with:", transcription);

    if (!map || currentLat === null || currentLong === null) {
      console.log("Map or user location not available.");
      return;
    }

    console.log("Processing command:", transcription.command);

    switch (transcription.command) {
      case "zoom_in":
        console.log("Zooming in from current zoom level:", map.getZoom());
        map.setZoom(map.getZoom() + 1);
        break;

      case "zoom_out":
        console.log("Zooming out from current zoom level:", map.getZoom());
        map.setZoom(map.getZoom() - 1);
        break;

      case "reset":
        console.log("Resetting map to user location:", currentLat, currentLong);
        map.setView([currentLat, currentLong], 12);
        break;

      default:
        console.log("Unknown command:", transcription.command);
    }
  }, [isLoading, map, currentLat, currentLong]);

  // Fetch voice command only when needed
  // useEffect(() => {
  //   if (map) processVoiceCommand();
  // }, [map]);

  return (
    <div>
      <MapContainer
        center={[20.5937, 78.9629]} // Default location (India) until user location is found
        zoom={13}
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ height: "100vh", width: "100vw" }}
        zoomControl={false}
        whenCreated={setMap}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <UserLocationMarker setCurrentLatLong={(lat, lng) => { setCurrentLat(lat); setCurrentLong(lng); }} />
        {currentLat !== null && currentLong !== null && (
          <>
            <Marker position={[currentLat, currentLong]}>
              <Popup>📍 Your Location</Popup>
            </Marker>
            {/* <RecenterMap position={[currentLat, currentLong]} /> */}
          </>
        )}
        <ZoomControl position="bottomright" />
        <AudioRecorder onTranscription={processVoiceCommand} />
      </MapContainer>
    </div>
  );
};

export default MapView;
