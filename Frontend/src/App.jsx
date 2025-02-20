import React from "react";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";

function App() {
  return (
    <div className="h-screen flex flex-col">
      {/* <header className="bg-blue-600 text-white p-4 text-center text-lg font-semibold">
        Geospatial Map UI
      </header> */}
      <SearchBar />
      {/* <MapView /> */}
    </div>
  );
}

export default App;


//************************Hospitals bounding box *******************************
// import { MapContainer, TileLayer } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import Hospitals from './components/Map/Hospitals';

// function App() {
//   return (
//     <div style={{ height: '100vh', width: '100%' }}>
//       <MapContainer
//         center={[51.505, -0.09]}
//         zoom={13}
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         <Hospitals />
//       </MapContainer>
//     </div>
//   );
// }

// export default App;




