import { useEffect, useState } from 'react';
import { LayerGroup, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const Hospitals = () => {
  const map = useMap();
  const [hospitals, setHospitals] = useState([]);

  // Custom hospital icon
  const hospitalIcon = new L.Icon({
    iconUrl: '/images/hospital.jpg',
    iconSize: [25, 25]
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        if (map.getZoom() < 10) {
          setHospitals([]);
          return;
        }

        const bounds = map.getBounds();
        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
        
        const query = `[out:json];
          (
            node["amenity"="hospital"](${bbox});
            way["amenity"="hospital"](${bbox});
            relation["amenity"="hospital"](${bbox});
          );
          out body;
          >;
          out skel qt;`;

        const response = await axios.post(
          'https://overpass-api.de/api/interpreter',
          query,
          { headers: { 'Content-Type': 'text/plain' } }
        );

        setHospitals(response.data.elements);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    // Initial fetch
    fetchHospitals();

    // Add event listener for map movement
    map.on('moveend', fetchHospitals);

    // Cleanup
    return () => {
      map.off('moveend', fetchHospitals);
    };
  }, [map]);

  return (
    <LayerGroup>
      {hospitals.map((element) => {
        let lat, lon;
        if (element.lat && element.lon) {
          ({ lat, lon } = element);
        } else if (element.center) {
          ({ lat, lon } = element.center);
        }
        
        return lat && lon ? (
          <Marker
            key={element.id}
            position={[lat, lon]}
            icon={hospitalIcon}
          >
            <Popup>
              {element.tags?.name || 'Unnamed Hospital'}
            </Popup>
          </Marker>
        ) : null;
      })}
    </LayerGroup>
  );
};

export default Hospitals;