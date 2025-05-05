// import React from 'react';

// function DirectionsSidebar({ directions, onClose, onClear }) {
//   if (!directions) return null;

//   // Format time from seconds to minutes and hours
//   const formatTime = (seconds) => {
//     if (seconds < 60) return `${seconds} sec`;
//     if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
//     const hours = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     return `${hours} hr ${mins} min`;
//   };

//   // Format distance from meters to km or miles
//   const formatDistance = (meters) => {
//     if (meters < 1000) return `${meters.toFixed(0)} m`;
//     return `${(meters / 1000).toFixed(1)} km`;
//   };

//   // Format total time and distance for the header
//   const totalTime = formatTime(directions.totalTime);
//   const totalDistance = formatDistance(directions.totalDistance);

//   return (
//     <div className="absolute top-16 right-4 w-80 max-h-screen-80 bg-white rounded-lg shadow-lg z-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
//         <div>
//           <h3 className="font-bold text-lg">Directions</h3>
//           <p className="text-sm">{totalDistance} • {totalTime}</p>
//         </div>
//         <div className="flex space-x-2">
//           {/* <button 
//             onClick={onClear}
//             className="text-white hover:text-red-200"
//             title="Clear directions"
//           >
//             <svg 
//               xmlns="http://www.w3.org/2000/svg" 
//               viewBox="0 0 24 24" 
//               fill="currentColor" 
//               className="w-5 h-5"
//             >
//               <path 
//                 fillRule="evenodd" 
//                 d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" 
//                 clipRule="evenodd" 
//               />
//             </svg>
//           </button> */}
//           <button 
//             onClick={onClose}
//             className="text-white hover:text-gray-200"
//             title="Close sidebar"
//           >
//             <svg 
//               xmlns="http://www.w3.org/2000/svg" 
//               viewBox="0 0 24 24" 
//               fill="currentColor" 
//               className="w-5 h-5"
//             >
//               <path 
//                 fillRule="evenodd" 
//                 d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06L12 14.69 9.53 12.22a.75.75 0 00-1.06 1.06l3 3z" 
//                 clipRule="evenodd" 
//               />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* Directions List */}
//       <div className="overflow-y-auto p-2 max-h-96">
//         <ol className="list-none">
//           {directions.steps.map((step, index) => {
//             // Determine icon based on instruction type
//             let icon;
//             switch (step.type) {
//               case 'StartAt':
//                 icon = '🚩';
//                 break;
//               case 'WaypointReached':
//                 icon = '📍';
//                 break;
//               case 'DestinationReached':
//                 icon = '🏁';
//                 break;
//               case 'TurnRight':
//                 icon = '↪️';
//                 break;
//               case 'TurnLeft':
//                 icon = '↩️';
//                 break;
//               case 'TurnSlightRight':
//                 icon = '⤴️';
//                 break;
//               case 'TurnSlightLeft':
//                 icon = '⤵️';
//                 break;
//               case 'TurnSharpRight':
//                 icon = '⤵️';
//                 break;
//               case 'TurnSharpLeft':
//                 icon = '⤴️';
//                 break;
//               default:
//                 icon = '➡️';
//             }

//             return (
//               <li key={index} className="py-3 border-b border-gray-100 flex items-start">
//                 <div className="mr-3 mt-1">{icon}</div>
//                 <div className="flex-1">
//                   <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: step.text }} />
//                   <div className="text-xs text-gray-500 mt-1">
//                     {formatDistance(step.distance)} • {formatTime(step.time)}
//                   </div>
//                 </div>
//               </li>
//             );
//           })}
//         </ol>
//       </div>
//     </div>
//   );
// }

// export default DirectionsSidebar;
import React from 'react';

function DirectionsSidebar({ directions, onClose, onClear }) {
  if (!directions) return null;

  // Format time from seconds to minutes and hours
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} sec`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours} hr ${mins} min`;
  };

  // Format distance from meters to km or miles
  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters.toFixed(0)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Format total time and distance for the header
  const totalTime = formatTime(directions.totalTime);
  const totalDistance = formatDistance(directions.totalDistance);

  return (
    <div className="absolute top-16 right-4 w-80 max-h-screen-80 bg-white rounded-lg shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Directions</h3>
          <p className="text-sm">{totalDistance} • {totalTime}</p>
        </div>
        <div className="flex space-x-2">
          {/* <button 
            onClick={onClear}
            className="text-white hover:text-red-200"
            title="Clear directions"
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
          </button> */}
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
            title="Close sidebar"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path 
                fillRule="evenodd" 
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06L12 14.69 9.53 12.22a.75.75 0 00-1.06 1.06l3 3z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Directions List */}
      <div className="overflow-y-auto p-2 max-h-96">
        <ol className="list-none">
          {directions.steps.map((step, index) => {
            // Determine icon based on instruction type
            let icon;
            switch (step.type) {
              case 'StartAt':
                icon = '🚩';
                break;
              case 'WaypointReached':
                icon = '📍';
                break;
              case 'DestinationReached':
                icon = '🏁';
                break;
              case 'TurnRight':
                icon = '↪️';
                break;
              case 'TurnLeft':
                icon = '↩️';
                break;
              case 'TurnSlightRight':
                icon = '⤴️';
                break;
              case 'TurnSlightLeft':
                icon = '⤵️';
                break;
              case 'TurnSharpRight':
                icon = '⤵️';
                break;
              case 'TurnSharpLeft':
                icon = '⤴️';
                break;
              default:
                icon = '➡️';
            }

            return (
              <li key={index} className="py-3 border-b border-gray-100 flex items-start">
                <div className="mr-3 mt-1">{icon}</div>
                <div className="flex-1">
                  <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: step.text }} />
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistance(step.distance)} • {formatTime(step.time)}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default DirectionsSidebar;