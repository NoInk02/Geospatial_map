import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const Hospitals = ({ visible, userLocation }) => {
  const map = useMap();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hospitalsLayerRef = React.useRef(null);

  useEffect(() => {
    // Initialize layer group for hospitals
    if (!hospitalsLayerRef.current) {
      hospitalsLayerRef.current = L.layerGroup().addTo(map);
    }

    // Clear hospitals when visibility changes to false
    if (!visible && hospitalsLayerRef.current) {
      hospitalsLayerRef.current.clearLayers();
    }

    return () => {
      if (hospitalsLayerRef.current) {
        hospitalsLayerRef.current.clearLayers();
      }
    };
  }, [map, visible]);

  useEffect(() => {
    // Fetch hospitals when visibility changes to true and we have userLocation
    if (visible && userLocation && userLocation.length === 2) {
      // Debug log to verify coordinates
      console.log("User location received:", userLocation);
      fetchHospitals(userLocation[0], userLocation[1]);
    }
  }, [visible, userLocation]);

  const fetchHospitals = async (lat, lng) => {
    if (!hospitalsLayerRef.current) return;
    
    setLoading(true);
    setError(null);
    hospitalsLayerRef.current.clearLayers();

    try {
      // Ensure coordinates are properly formatted as numbers
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      if (isNaN(userLat) || isNaN(userLng)) {
        throw new Error('Invalid coordinates');
      }
      
      // Display a marker at the user's location to confirm coordinates
      const userMarker = L.marker([userLat, userLng], {
        icon: L.divIcon({
          html: '<div style="background-color: blue; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
          className: 'user-location-marker',
          iconSize: [15, 15]
        })
      });
      userMarker.addTo(hospitalsLayerRef.current);
      
      // Calculate a bounding box for approximately 5km around the user
      // For India's latitude (roughly 8-37°N), we'll create a more accurate calculation
      const latRadius = 0.145; // ~5km in latitude
      const lngRadius = 0.145 / Math.cos((userLat * Math.PI) / 180); // Adjust for longitude at this latitude
      
      const south = userLat - latRadius;
      const west = userLng - lngRadius;
      const north = userLat + latRadius;
      const east = userLng + lngRadius;
      
      const bbox = `${south},${west},${north},${east}`;
      
      console.log("Searching for hospitals with coordinates:", [userLat, userLng]);
      console.log("Using bounding box:", bbox);

      // Construct Overpass API query for hospitals and healthcare facilities
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](${south},${west},${north},${east});
          way["amenity"="hospital"](${south},${west},${north},${east});
          relation["amenity"="hospital"](${south},${west},${north},${east});
          node["healthcare"="hospital"](${south},${west},${north},${east});
          way["healthcare"="hospital"](${south},${west},${north},${east});
          relation["healthcare"="hospital"](${south},${west},${north},${east});
          node["building"="hospital"](${south},${west},${north},${east});
          way["building"="hospital"](${south},${west},${north},${east});
          
          // Also include clinics and doctors which may be more common
          node["amenity"="clinic"](${south},${west},${north},${east});
          way["amenity"="clinic"](${south},${west},${north},${east});
          node["healthcare"="clinic"](${south},${west},${north},${east});
          way["healthcare"="clinic"](${south},${west},${north},${east});
          node["amenity"="doctors"](${south},${west},${north},${east});
          way["amenity"="doctors"](${south},${west},${north},${east});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hospital data');
      }
      
      const data = await response.json();
      console.log("Success - Found medical facilities:", data);
      processHospitalData(data, userLat, userLng);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError(err.message);
      
      // Show error on map
      const popup = L.popup()
        .setLatLng([lat, lng])
        .setContent(`Error finding hospitals: ${err.message}. Please try again later.`)
        .openOn(map);
    } finally {
      setLoading(false);
    }
  };

  const processHospitalData = (data, lat, lng) => {
    if (!data || !data.elements || !hospitalsLayerRef.current) return;
    
    const hospitalElements = [];
    
    // Process nodes (single point hospitals)
    const nodes = {};
    const nodeElements = data.elements.filter(el => el.type === 'node');
    const wayElements = data.elements.filter(el => el.type === 'way');
    
    // Index all nodes
    nodeElements.forEach(node => {
      nodes[node.id] = node;
      
      // If node is tagged as hospital, clinic or doctor (not just part of a way)
      if (node.tags && (
          node.tags.amenity === 'hospital' || 
          node.tags.healthcare === 'hospital' || 
          node.tags.building === 'hospital' ||
          node.tags.amenity === 'clinic' ||
          node.tags.healthcare === 'clinic' ||
          node.tags.amenity === 'doctors'
      )) {
        // Determine the type of medical facility
        let facilityType = 'Hospital';
        if (node.tags.amenity === 'clinic' || node.tags.healthcare === 'clinic') {
          facilityType = 'Clinic';
        } else if (node.tags.amenity === 'doctors') {
          facilityType = 'Doctor\'s Office';
        }
        
        hospitalElements.push({
          type: 'point',
          lat: node.lat,
          lon: node.lon,
          name: node.tags?.name || `Unnamed ${facilityType}`,
          facilityType: facilityType,
          id: node.id
        });
      }
    });
    
    // Process ways (building outlines)
    wayElements.forEach(way => {
      if (way.tags && (
          way.tags.amenity === 'hospital' || 
          way.tags.healthcare === 'hospital' || 
          way.tags.building === 'hospital' ||
          way.tags.amenity === 'clinic' ||
          way.tags.healthcare === 'clinic' ||
          way.tags.amenity === 'doctors'
      )) {
        // Determine the type of medical facility
        let facilityType = 'Hospital';
        if (way.tags.amenity === 'clinic' || way.tags.healthcare === 'clinic') {
          facilityType = 'Clinic';
        } else if (way.tags.amenity === 'doctors') {
          facilityType = 'Doctor\'s Office';
        }
        
        // Collect all nodes that form the polygon
        const wayPoints = [];
        way.nodes.forEach(nodeId => {
          if (nodes[nodeId]) {
            wayPoints.push([nodes[nodeId].lat, nodes[nodeId].lon]);
          }
        });
        
        if (wayPoints.length > 2) {
          hospitalElements.push({
            type: 'polygon',
            points: wayPoints,
            name: way.tags?.name || `Unnamed ${facilityType}`,
            facilityType: facilityType,
            id: way.id
          });
        }
      }
    });
    
    // Add hospitals to the map and collect latlngs for bounds calculation
    const latlngs = [];
    
    // Get appropriate icon based on facility type
    const getIcon = (facilityType) => {
      const iconClass = facilityType === 'Hospital' ? 'hospital-marker' : 
                        facilityType === 'Clinic' ? 'clinic-marker' : 'doctor-marker';
      const iconText = facilityType === 'Hospital' ? 'H' : 
                      facilityType === 'Clinic' ? 'C' : 'D';
      
      return L.divIcon({
        html: `<div class="${iconClass}">${iconText}</div>`,
        className: 'medical-marker-container',
        iconSize: [24, 24]
      });
    };
    
    hospitalElements.forEach(hospital => {
      if (hospital.type === 'point') {
        const latlng = [hospital.lat, hospital.lon];
        latlngs.push(latlng);
        
        const marker = L.marker(latlng, {
          icon: getIcon(hospital.facilityType)
        });
        marker.bindPopup(`<b>${hospital.name}</b><br>${hospital.facilityType}`);
        hospitalsLayerRef.current.addLayer(marker);
      } else if (hospital.type === 'polygon') {
        // Add all points of polygon to latlngs array for bounds calculation
        hospital.points.forEach(point => latlngs.push(point));
        
        // Create the polygon with proper styling based on facility type
        const polygon = L.polygon(hospital.points, {
          color: hospital.facilityType === 'Hospital' ? '#FF5733' : 
                hospital.facilityType === 'Clinic' ? '#33A8FF' : '#33FF57',
          weight: 2,
          fillColor: hospital.facilityType === 'Hospital' ? '#FFC300' : 
                    hospital.facilityType === 'Clinic' ? '#00A3FF' : '#7DFF00',
          fillOpacity: 0.4
        });
        
        // Calculate the center point for placing a label on large hospitals
        const polygonCenter = polygon.getBounds().getCenter();
        
        // Add popup to the polygon
        polygon.bindPopup(`<b>${hospital.name}</b><br>${hospital.facilityType} Building`);
        
        // Add the polygon to our layer
        hospitalsLayerRef.current.addLayer(polygon);
        
        // For larger buildings, add a label in the center
        if (hospital.points.length > 5) {
          const label = L.marker(polygonCenter, {
            icon: L.divIcon({
              html: `<div style="background: rgba(255,255,255,0.7); padding: 3px; border-radius: 3px; font-size: 10px; white-space: nowrap;">${hospital.name}</div>`,
              className: 'hospital-label',
              iconAnchor: [0, 0]
            })
          });
          hospitalsLayerRef.current.addLayer(label);
        }
      }
    });
    
    setHospitals(hospitalElements);
    
    // Add CSS for hospital markers
    if (!document.getElementById('medical-marker-style')) {
      const style = document.createElement('style');
      style.id = 'medical-marker-style';
      style.textContent = `
        .medical-marker-container {
          background: transparent;
        }
        .hospital-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #FF5733;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 14px;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .clinic-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #33A8FF;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 14px;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .doctor-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #33FF57;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 14px;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .hospital-label {
          background: transparent;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Check if we found any medical facilities
    if (latlngs.length > 0) {
      // Create a bounds object from our latlngs array
      const bounds = L.latLngBounds(latlngs);
      
      // Add the user's location to the bounds to ensure they can see both their position and the facilities
      if (lat && lng) {
        bounds.extend(L.latLng(lat, lng));
      }
      
      // Fit map to bounds with some padding
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      
      console.log(`Found ${hospitalElements.length} medical facilities nearby`);
    } else {
      // If no facilities found, at least center on user location
      map.setView([lat, lng], 13);
      
      // Show no hospitals found popup
      L.popup()
        .setLatLng([lat, lng])
        .setContent("No medical facilities found in this area. Try zooming out or searching in a larger area.")
        .openOn(map);
    }
  };

  return null; // This component doesn't render anything directly
};

export default Hospitals;