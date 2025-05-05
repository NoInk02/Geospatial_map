// // import React, { useState, useEffect, useRef } from 'react';
// // import { useMap } from 'react-leaflet';
// // import L from 'leaflet';

// // const Places = ({ visible, userLocation, placeType }) => {
// //   const map = useMap();
// //   const [places, setPlaces] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const placesLayerRef = useRef(null);

// //   // OSM query tags for each place type
// //   const placeQueries = {
// //     restaurant: {
// //       tags: [
// //         { key: "amenity", values: ["restaurant", "fast_food", "cafe", "food_court"] }
// //       ],
// //       icon: "🍽️",
// //       color: "#FF5733"
// //     },
// //     hospital: {
// //       tags: [
// //         { key: "amenity", values: ["hospital"] },
// //         { key: "healthcare", values: ["hospital"] },
// //         { key: "building", values: ["hospital"] }
// //       ],
// //       icon: "🏥",
// //       color: "#FF5733"
// //     },
// //     cafe: {
// //       tags: [
// //         { key: "amenity", values: ["cafe"] }
// //       ],
// //       icon: "☕",
// //       color: "#8B4513"
// //     },
// //     shop: {
// //       tags: [
// //         { key: "shop", values: ["supermarket", "convenience", "mall", "department_store"] }
// //       ],
// //       icon: "🛒",
// //       color: "#3498DB"
// //     },
// //     atm: {
// //       tags: [
// //         { key: "amenity", values: ["atm"] },
// //         { key: "atm", values: ["yes"] }
// //       ],
// //       icon: "💰",
// //       color: "#2ECC71"
// //     },
// //     bank: {
// //       tags: [
// //         { key: "amenity", values: ["bank"] }
// //       ],
// //       icon: "🏦",
// //       color: "#9B59B6"
// //     },
// //     school: {
// //       tags: [
// //         { key: "amenity", values: ["school"] },
// //         { key: "building", values: ["school"] }
// //       ],
// //       icon: "🏫",
// //       color: "#F1C40F"
// //     },
// //     college: {
// //       tags: [
// //         { key: "amenity", values: ["college", "university"] }
// //       ],
// //       icon: "🎓",
// //       color: "#E74C3C"
// //     },
// //     park: {
// //       tags: [
// //         { key: "leisure", values: ["park", "garden"] }
// //       ],
// //       icon: "🌳",
// //       color: "#27AE60"
// //     },
// //     pharmacy: {
// //       tags: [
// //         { key: "amenity", values: ["pharmacy"] },
// //         { key: "shop", values: ["pharmacy"] }
// //       ],
// //       icon: "💊",
// //       color: "#1ABC9C"
// //     },
// //     cinema: {
// //       tags: [
// //         { key: "amenity", values: ["cinema"] }
// //       ],
// //       icon: "🎬",
// //       color: "#34495E"
// //     },
// //     gym: {
// //       tags: [
// //         { key: "leisure", values: ["fitness_centre"] },
// //         { key: "amenity", values: ["gym"] }
// //       ],
// //       icon: "🏋️",
// //       color: "#F39C12"
// //     },
// //     gas_station: {
// //       tags: [
// //         { key: "amenity", values: ["fuel"] }
// //       ],
// //       icon: "⛽",
// //       color: "#D35400"
// //     },
// //     hotel: {
// //       tags: [
// //         { key: "tourism", values: ["hotel", "motel", "hostel"] }
// //       ],
// //       icon: "🏨",
// //       color: "#8E44AD"
// //     },
// //     police: {
// //       tags: [
// //         { key: "amenity", values: ["police"] }
// //       ],
// //       icon: "👮",
// //       color: "#2C3E50"
// //     },
// //     post_office: {
// //       tags: [
// //         { key: "amenity", values: ["post_office"] }
// //       ],
// //       icon: "📮",
// //       color: "#E67E22"
// //     },
// //     bus_stop: {
// //       tags: [
// //         { key: "highway", values: ["bus_stop"] }
// //       ],
// //       icon: "🚏",
// //       color: "#16A085"
// //     },
// //     parking: {
// //       tags: [
// //         { key: "amenity", values: ["parking"] }
// //       ],
// //       icon: "🅿️",
// //       color: "#3498DB"
// //     },
// //     library: {
// //       tags: [
// //         { key: "amenity", values: ["library"] }
// //       ],
// //       icon: "📚",
// //       color: "#7F8C8D"
// //     }
// //   };

// //   useEffect(() => {
// //     // Initialize layer group for places
// //     if (!placesLayerRef.current) {
// //       placesLayerRef.current = L.layerGroup().addTo(map);
// //     }

// //     // Clear places when visibility changes to false
// //     if (!visible && placesLayerRef.current) {
// //       placesLayerRef.current.clearLayers();
// //     }

// //     return () => {
// //       if (placesLayerRef.current) {
// //         placesLayerRef.current.clearLayers();
// //       }
// //     };
// //   }, [map, visible]);

// //   useEffect(() => {
// //     // Fetch places when visibility changes to true, we have userLocation, and placeType is defined
// //     if (visible && userLocation && userLocation.length === 2 && placeType) {
// //       console.log("Fetching places of type:", placeType);
// //       fetchPlaces(placeType, userLocation[0], userLocation[1]);
// //     }
// //   }, [visible, userLocation, placeType]);

// //   const buildOverpassQuery = (placeType, lat, lng, radius = 5000) => {
// //     if (!placeQueries[placeType]) {
// //       console.error(`Unknown place type: ${placeType}`);
// //       return null;
// //     }

// //     // Calculate a bounding box for the search area
// //     const latRadius = 0.145; // ~5km in latitude
// //     const lngRadius = 0.145 / Math.cos((lat * Math.PI) / 180); // Adjust for longitude at this latitude
    
// //     const south = lat - latRadius;
// //     const west = lng - lngRadius;
// //     const north = lat + latRadius;
// //     const east = lng + lngRadius;
    
// //     const bbox = `${south},${west},${north},${east}`;

// //     // Build query based on place type tags
// //     let queryParts = [];
// //     const tags = placeQueries[placeType].tags;

// //     for (const tag of tags) {
// //       for (const value of tag.values) {
// //         queryParts.push(`node["${tag.key}"="${value}"](${bbox});`);
// //         queryParts.push(`way["${tag.key}"="${value}"](${bbox});`);
// //         queryParts.push(`relation["${tag.key}"="${value}"](${bbox});`);
// //       }
// //     }

// //     const query = `
// //       [out:json];
// //       (
// //         ${queryParts.join('\n')}
// //       );
// //       out body;
// //       >;
// //       out skel qt;
// //     `;

// //     return query;
// //   };

// //   const fetchPlaces = async (placeType, lat, lng) => {
// //     if (!placesLayerRef.current) return;
    
// //     setLoading(true);
// //     setError(null);
// //     placesLayerRef.current.clearLayers();

// //     try {
// //       // Ensure coordinates are properly formatted as numbers
// //       const userLat = parseFloat(lat);
// //       const userLng = parseFloat(lng);
      
// //       if (isNaN(userLat) || isNaN(userLng)) {
// //         throw new Error('Invalid coordinates');
// //       }
      
// //       // Display a marker at the user's location
// //       const userMarker = L.marker([userLat, userLng], {
// //         icon: L.divIcon({
// //           html: '<div style="background-color: blue; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
// //           className: 'user-location-marker',
// //           iconSize: [15, 15]
// //         })
// //       });
// //       userMarker.bindPopup('Your Location');
// //       userMarker.addTo(placesLayerRef.current);
      
// //       const query = buildOverpassQuery(placeType, userLat, userLng);
// //       if (!query) {
// //         throw new Error(`Could not build query for place type: ${placeType}`);
// //       }

// //       console.log(`Searching for ${placeType} near coordinates:`, [userLat, userLng]);

// //       const response = await fetch('https://overpass-api.de/api/interpreter', {
// //         method: 'POST',
// //         body: query
// //       });

// //       if (!response.ok) {
// //         throw new Error(`Failed to fetch ${placeType} data`);
// //       }
      
// //       const data = await response.json();
// //       console.log(`Found ${data?.elements?.length || 0} ${placeType} items nearby`);
// //       processPlaceData(data, userLat, userLng, placeType);
// //     } catch (err) {
// //       console.error(`Error fetching ${placeType}:`, err);
// //       setError(err.message);
      
// //       // Show error on map
// //       const popup = L.popup()
// //         .setLatLng([lat, lng])
// //         .setContent(`Error finding ${placeType}: ${err.message}. Please try again later.`)
// //         .openOn(map);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const processPlaceData = (data, lat, lng, placeType) => {
// //     if (!data || !data.elements || !placesLayerRef.current) return;
    
// //     const placeElements = [];
// //     const placeConfig = placeQueries[placeType];
    
// //     // Index all nodes
// //     const nodes = {};
// //     const nodeElements = data.elements.filter(el => el.type === 'node');
// //     const wayElements = data.elements.filter(el => el.type === 'way');
    
// //     nodeElements.forEach(node => {
// //       nodes[node.id] = node;
      
// //       // If node has relevant tags
// //       if (node.tags && isRelevantPlace(node.tags, placeType)) {
// //         placeElements.push({
// //           type: 'point',
// //           lat: node.lat,
// //           lon: node.lon,
// //           name: node.tags?.name || `Unnamed ${placeType}`,
// //           tags: node.tags,
// //           id: node.id
// //         });
// //       }
// //     });
    
// //     // Process ways
// //     wayElements.forEach(way => {
// //       if (way.tags && isRelevantPlace(way.tags, placeType)) {
// //         // Collect all nodes that form the polygon
// //         const wayPoints = [];
// //         way.nodes.forEach(nodeId => {
// //           if (nodes[nodeId]) {
// //             wayPoints.push([nodes[nodeId].lat, nodes[nodeId].lon]);
// //           }
// //         });
        
// //         if (wayPoints.length > 2) {
// //           placeElements.push({
// //             type: 'polygon',
// //             points: wayPoints,
// //             name: way.tags?.name || `Unnamed ${placeType}`,
// //             tags: way.tags,
// //             id: way.id
// //           });
// //         }
// //       }
// //     });
    
// //     // Add places to the map and collect latlngs for bounds calculation
// //     const latlngs = [];
    
// //     // Get appropriate icon
// //     const getIcon = () => {
// //       return L.divIcon({
// //         html: `<div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; background-color:${placeConfig.color}; border-radius:50%; color:white; font-size:14px; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.4);">${placeConfig.icon}</div>`,
// //         className: 'place-marker-container',
// //         iconSize: [28, 28]
// //       });
// //     };
    
// //     placeElements.forEach(place => {
// //       if (place.type === 'point') {
// //         const latlng = [place.lat, place.lon];
// //         latlngs.push(latlng);
        
// //         const marker = L.marker(latlng, {
// //           icon: getIcon()
// //         });
        
// //         // Create popup content
// //         let popupContent = `<b>${place.name || `Unnamed ${placeType}`}</b><br>`;
// //         if (place.tags) {
// //           // Add additional information if available
// //           if (place.tags.phone) popupContent += `📞 ${place.tags.phone}<br>`;
// //           if (place.tags.website) popupContent += `🌐 <a href="${place.tags.website}" target="_blank">Website</a><br>`;
// //           if (place.tags.opening_hours) popupContent += `⏰ ${place.tags.opening_hours}<br>`;
// //           if (place.tags.cuisine) popupContent += `🍴 ${place.tags.cuisine}<br>`;
// //         }
        
// //         marker.bindPopup(popupContent);
// //         placesLayerRef.current.addLayer(marker);
// //       } else if (place.type === 'polygon') {
// //         // Add all points of polygon to latlngs array for bounds calculation
// //         place.points.forEach(point => latlngs.push(point));
        
// //         // Create the polygon with proper styling
// //         const polygon = L.polygon(place.points, {
// //           color: placeConfig.color,
// //           weight: 2,
// //           fillColor: placeConfig.color,
// //           fillOpacity: 0.4
// //         });
        
// //         // Calculate the center point for placing a label on large buildings
// //         const polygonCenter = polygon.getBounds().getCenter();
        
// //         // Add popup to the polygon
// //         let popupContent = `<b>${place.name || `Unnamed ${placeType}`}</b><br>`;
// //         if (place.tags) {
// //           // Add additional information if available
// //           if (place.tags.phone) popupContent += `📞 ${place.tags.phone}<br>`;
// //           if (place.tags.website) popupContent += `🌐 <a href="${place.tags.website}" target="_blank">Website</a><br>`;
// //           if (place.tags.opening_hours) popupContent += `⏰ ${place.tags.opening_hours}<br>`;
// //         }
        
// //         polygon.bindPopup(popupContent);
        
// //         // Add the polygon to our layer
// //         placesLayerRef.current.addLayer(polygon);
        
// //         // For larger buildings, add a label in the center
// //         if (place.points.length > 5) {
// //           const label = L.marker(polygonCenter, {
// //             icon: L.divIcon({
// //               html: `<div style="background: rgba(255,255,255,0.7); padding: 3px; border-radius: 3px; font-size: 10px; white-space: nowrap;">${place.name || `Unnamed ${placeType}`}</div>`,
// //               className: 'place-label',
// //               iconAnchor: [0, 0]
// //             })
// //           });
// //           placesLayerRef.current.addLayer(label);
// //         }
// //       }
// //     });
    
// //     setPlaces(placeElements);
    
// //     // Check if we found any places
// //     if (latlngs.length > 0) {
// //       // Create a bounds object from our latlngs array
// //       const bounds = L.latLngBounds(latlngs);
      
// //       // Add the user's location to the bounds
// //       if (lat && lng) {
// //         bounds.extend(L.latLng(lat, lng));
// //       }
      
// //       // Fit map to bounds with some padding
// //       map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      
// //       console.log(`Found ${placeElements.length} ${placeType} places nearby`);
// //     } else {
// //       // If no facilities found, at least center on user location
// //       map.setView([lat, lng], 13);
      
// //       // Show "no places found" popup
// //       L.popup()
// //         .setLatLng([lat, lng])
// //         .setContent(`No ${placeType} found in this area. Try zooming out or searching in a larger area.`)
// //         .openOn(map);
// //     }
// //   };

// //   // Helper function to check if a place matches the target type
// //   const isRelevantPlace = (tags, placeType) => {
// //     if (!placeQueries[placeType]) return false;
    
// //     const relevantTags = placeQueries[placeType].tags;
    
// //     for (const tagDef of relevantTags) {
// //       const key = tagDef.key;
// //       const values = tagDef.values;
      
// //       if (tags[key] && values.includes(tags[key])) {
// //         return true;
// //       }
// //     }
    
// //     return false;
// //   };

// //   return null; // This component doesn't render anything directly
// // };

// // export default Places;

// import React, { useState, useEffect, useRef } from 'react';
// import { useMap } from 'react-leaflet';
// import L from 'leaflet';

// const Places = ({ visible, userLocation, placeType, searchLocation }) => {
//   const map = useMap();
//   const [places, setPlaces] = useState([]);
//   const placesLayerRef = useRef(null);

//   const placeQueries = {
//     hospital: { tags: [{ key: "amenity", values: ["hospital"] }, { key: "healthcare", values: ["hospital"] }, { key: "building", values: ["hospital"] }], icon: "🏥", color: "#FF5733" },
//     restaurant: { tags: [{ key: "amenity", values: ["restaurant", "fast_food", "cafe", "food_court"] }], icon: "🍽️", color: "#FF5733" },
//     cafe: { tags: [{ key: "amenity", values: ["cafe"] }], icon: "☕", color: "#8B4513" },
//     shop: { tags: [{ key: "shop", values: ["supermarket", "convenience", "mall", "department_store"] }], icon: "🛒", color: "#3498DB" },
//     atm: { tags: [{ key: "amenity", values: ["atm"] }, { key: "atm", values: ["yes"] }], icon: "💰", color: "#2ECC71" },
//     bank: { tags: [{ key: "amenity", values: ["bank"] }], icon: "🏦", color: "#9B59B6" },
//     school: { tags: [{ key: "amenity", values: ["school"] }, { key: "building", values: ["school"] }], icon: "🏫", color: "#F1C40F" },
//     college: { tags: [{ key: "amenity", values: ["college", "university"] }], icon: "🎓", color: "#E74C3C" },
//     park: { tags: [{ key: "leisure", values: ["park", "garden"] }], icon: "🌳", color: "#27AE60" },
//     pharmacy: { tags: [{ key: "amenity", values: ["pharmacy"] }, { key: "shop", values: ["pharmacy"] }], icon: "💊", color: "#1ABC9C" },
//     cinema: { tags: [{ key: "amenity", values: ["cinema"] }], icon: "🎬", color: "#34495E" },
//     gym: { tags: [{ key: "leisure", values: ["fitness_centre"] }, { key: "amenity", values: ["gym"] }], icon: "🏋️", color: "#F39C12" },
//     gas_station: { tags: [{ key: "amenity", values: ["fuel"] }], icon: "⛽", color: "#D35400" },
//     hotel: { tags: [{ key: "tourism", values: ["hotel", "motel", "hostel"] }], icon: "🏨", color: "#8E44AD" },
//     police: { tags: [{ key: "amenity", values: ["police"] }], icon: "👮", color: "#2C3E50" },
//     post_office: { tags: [{ key: "amenity", values: ["post_office"] }], icon: "📮", color: "#E67E22" },
//     bus_stop: { tags: [{ key: "highway", values: ["bus_stop"] }], icon: "🚏", color: "#16A085" },
//     parking: { tags: [{ key: "amenity", values: ["parking"] }], icon: "🅿️", color: "#3498DB" },
//     library: { tags: [{ key: "amenity", values: ["library"] }], icon: "📚", color: "#7F8C8D" }
//   };

//   useEffect(() => {
//     if (!visible || !placeType || !placeQueries[placeType]) return;

//     const fetchPlaces = async () => {
//       const center = searchLocation || userLocation || map.getCenter();
//       const radius = 5000; // 5km radius
//       const query = {
//         lat: center.lat,
//         lon: center.lng,
//         radius,
//         tags: placeQueries[placeType].tags
//       };

//       const response = await fetch('/api/places', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(query)
//       });
//       const data = await response.json();
//       setPlaces(data);
//     };

//     fetchPlaces();
//   }, [visible, placeType, userLocation, searchLocation, map]);

//   useEffect(() => {
//     if (placesLayerRef.current) {
//       map.removeLayer(placesLayerRef.current);
//     }

//     if (visible && places.length > 0 && placeType) {
//       placesLayerRef.current = L.layerGroup().addTo(map);
//       places.forEach(place => {
//         const marker = L.marker([place.lat, place.lon], {
//           icon: L.divIcon({
//             html: placeQueries[placeType].icon,
//             className: 'custom-icon',
//             iconSize: [24, 24]
//           })
//         });
//         marker.addTo(placesLayerRef.current).bindPopup(place.name || placeType);
//       });
//     }
//   }, [places, visible, placeType, map]);

//   return null;
// };

// export default Places;


// Places.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const Places = ({ visible, userLocation, placeType }) => {
  const map = useMap();
  const [places, setPlaces] = useState([]);
  const placesLayerRef = useRef(null);

  // const placeQueries = {
  //   hospital: { tags: [{ key: "amenity", values: ["hospital"] }], icon: "🏥", color: "#FF5733" },
  //   restaurant: { tags: [{ key: "amenity", values: ["restaurant", "fast_food"] }], icon: "🍽️", color: "#FF5733" },
  //   pharmacy: { tags: [{ key: "amenity", values: ["pharmacy"] }], icon: "💊", color: "#1ABC9C" },
  //   hotel: { tags: [{ key: "tourism", values: ["hotel"] }], icon: "🏨", color: "#8E44AD" },
  //   atm: { tags: [{ key: "amenity", values: ["atm"] }], icon: "💰", color: "#2ECC71" }
  // };

  const placeQueries = {
        hospital: { tags: [{ key: "amenity", values: ["hospital"] }, { key: "healthcare", values: ["hospital"] }, { key: "building", values: ["hospital"] }], icon: "🏥", color: "#FF5733" },
        restaurant: { tags: [{ key: "amenity", values: ["restaurant", "fast_food", "cafe", "food_court"] }], icon: "🍽️", color: "#FF5733" },
        cafe: { tags: [{ key: "amenity", values: ["cafe"] }], icon: "☕", color: "#8B4513" },
        shop: { tags: [{ key: "shop", values: ["supermarket", "convenience", "mall", "department_store"] }], icon: "🛒", color: "#3498DB" },
        atm: { tags: [{ key: "amenity", values: ["atm"] }, { key: "atm", values: ["yes"] }], icon: "💰", color: "#2ECC71" },
        bank: { tags: [{ key: "amenity", values: ["bank"] }], icon: "🏦", color: "#9B59B6" },
        school: { tags: [{ key: "amenity", values: ["school"] }, { key: "building", values: ["school"] }], icon: "🏫", color: "#F1C40F" },
        college: { tags: [{ key: "amenity", values: ["college", "university"] }], icon: "🎓", color: "#E74C3C" },
        park: { tags: [{ key: "leisure", values: ["park", "garden"] }], icon: "🌳", color: "#27AE60" },
        pharmacy: { tags: [{ key: "amenity", values: ["pharmacy"] }, { key: "shop", values: ["pharmacy"] }], icon: "💊", color: "#1ABC9C" },
        cinema: { tags: [{ key: "amenity", values: ["cinema"] }], icon: "🎬", color: "#34495E" },
        gym: { tags: [{ key: "leisure", values: ["fitness_centre"] }, { key: "amenity", values: ["gym"] }], icon: "🏋️", color: "#F39C12" },
        gas_station: { tags: [{ key: "amenity", values: ["fuel"] }], icon: "⛽", color: "#D35400" },
        hotel: { tags: [{ key: "tourism", values: ["hotel", "motel", "hostel"] }], icon: "🏨", color: "#8E44AD" },
        police: { tags: [{ key: "amenity", values: ["police"] }], icon: "👮", color: "#2C3E50" },
        post_office: { tags: [{ key: "amenity", values: ["post_office"] }], icon: "📮", color: "#E67E22" },
        bus_stop: { tags: [{ key: "highway", values: ["bus_stop"] }], icon: "🚏", color: "#16A085" },
        parking: { tags: [{ key: "amenity", values: ["parking"] }], icon: "🅿️", color: "#3498DB" },
        library: { tags: [{ key: "amenity", values: ["library"] }], icon: "📚", color: "#7F8C8D" }
      };
    

  useEffect(() => {
    if (!placesLayerRef.current) {
      placesLayerRef.current = L.layerGroup().addTo(map);
    }
    if (!visible) {
      placesLayerRef.current.clearLayers();
    }
  }, [map, visible]);

  useEffect(() => {
    if (visible && placeType && userLocation) {
      fetchPlaces(placeType, userLocation[0], userLocation[1]);
    }
  }, [visible, userLocation, placeType]);

  const buildOverpassQuery = (placeType, lat, lng) => {
    if (!placeQueries[placeType]) return null;
    const latRadius = 0.145;
    const lngRadius = 0.145 / Math.cos((lat * Math.PI) / 180);
    const bbox = `${lat - latRadius},${lng - lngRadius},${lat + latRadius},${lng + lngRadius}`;
    const tags = placeQueries[placeType].tags;
    let queryParts = [];
    for (const tag of tags) {
      for (const value of tag.values) {
        queryParts.push(`node["${tag.key}"="${value}"](${bbox});`);
      }
    }
    return `[out:json];(${queryParts.join('\n')});out body;>;out skel qt;`;
  };

  const fetchPlaces = async (placeType, lat, lng) => {
    placesLayerRef.current.clearLayers();
    const query = buildOverpassQuery(placeType, lat, lng);
    if (!query) return;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      processPlaceData(data, lat, lng, placeType);
    } catch (err) {
      console.error(`Error fetching ${placeType}:`, err);
    }
  };

  const processPlaceData = (data, lat, lng, placeType) => {
    const placeConfig = placeQueries[placeType];
    const latlngs = [];
    data.elements.forEach(el => {
      if (el.type === 'node' && el.lat && el.lon) {
        const marker = L.marker([el.lat, el.lon], {
          icon: L.divIcon({
            html: `<div style="background-color:${placeConfig.color};width:28px;height:28px;border-radius:50%;color:white;font-size:14px;display:flex;align-items:center;justify-content:center;">${placeConfig.icon}</div>`,
            iconSize: [28, 28]
          })
        });
        marker.bindPopup(el.tags?.name || `Unnamed ${placeType}`);
        marker.addTo(placesLayerRef.current);
        latlngs.push([el.lat, el.lon]);
      }
    });
    if (latlngs.length) {
      map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50], maxZoom: 15 });
    }
    setPlaces(data.elements);
  };

  return null;
};

export default Places;