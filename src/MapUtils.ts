import L from "leaflet";
import { ADJECTIVES, NOUNS } from "./NameData";

export const getAltitudeColor = (alt: number) => {
  if (alt < 10) return "#f8dda4";
  if (alt < 20) return "#f9a03f";
  if (alt < 30) return "#d45113";
  return "#813405";
};

export const balloonIcon = (alt: number, id: number) =>
  L.divIcon({
    html: `
    <div style="position: relative; display: inline-block;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${getAltitudeColor(alt)}">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M13.5 3c5.187 0 9.5 3.044 9.5 7c0 3.017 -2.508 5.503 -6 6.514v3.486a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-4.046a21 21 0 0 1 -2.66 -1.411l-.13 -.082l-1.57 1.308a1 1 0 0 1 -1.634 -.656l-.006 -.113v-2.851l-.31 -.25a47 47 0 0 1 -.682 -.568l-.67 -.582a1 1 0 0 1 0 -1.498a47 47 0 0 1 1.351 -1.151l.311 -.25v-2.85a1 1 0 0 1 1.55 -.836l.09 .068l1.57 1.307l.128 -.08c2.504 -1.553 4.784 -2.378 6.853 -2.453zm-2.499 13.657l-.001 2.343h4l.001 -2.086q -.735 .086 -1.501 .086a9.6 9.6 0 0 1 -2.13 -.252z" />
      </svg>
      <span style="position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: bold; white-space: nowrap; background: white; padding: 1px 3px; border-radius: 2px;">#${id}</span>
    </div>
  `,
    className: "custom-balloon-icon",
    iconSize: [24, 40],
    iconAnchor: [12, 12],
  });

export const startIcon = L.divIcon({
  html: `<div style="width: 12px; height: 12px; background: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  className: "start-icon",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export const getBalloonName = (index: number) => {
  const adj = ADJECTIVES[index % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(index / ADJECTIVES.length) % NOUNS.length];
  return `${adj} ${noun}`;
};

export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateBalloonStats = (pathData) => {
  if (!pathData || pathData.length === 0) return null;

  let totalDistance = 0;
  for (let i = 1; i < pathData.length; i++) {
    const [lat1, lon1] = pathData[i - 1].position;
    const [lat2, lon2] = pathData[i].position;
    totalDistance += getDistance(lat1, lon1, lat2, lon2);
  }

  const altitudes = pathData.map((p) => p.alt);
  const avgAltitude = altitudes.reduce((a, b) => a + b, 0) / altitudes.length;
  const maxAltitude = Math.max(...altitudes);
  const minAltitude = Math.min(...altitudes);

  const timeHours = pathData.length;
  const avgSpeed = totalDistance / timeHours;

  return {
    distance: totalDistance,
    avgAltitude,
    maxAltitude,
    minAltitude,
    avgSpeed,
  };
};
