// "use client";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import { GeoPoint } from "@/interfaces";

// interface Props {
//   points: GeoPoint[];
//   center: [number, number];
// }

// export default function GISMap({ points, center }: Props) {
//   return (
//     <MapContainer
//       center={center}
//       zoom={6}
//       style={{ height: "100%", width: "100%" }}
//     >
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       {points.map((point) => (
//         <Marker
//           key={point.id}
//           position={[point.Latitude, point.Longitude]}
//           icon={L.icon({
//             iconUrl:
//               "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//             iconSize: [25, 41],
//             iconAnchor: [12, 41],
//           })}
//         >
//           <Popup>{point.Name}</Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// }
