import { useQueries, useQuery } from "@tanstack/react-query";
import L from "leaflet";
import { useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

function App() {
  const getAltitudeColor = (alt) => {
    if (alt < 10) return "#3b82f6";
    if (alt < 20) return "#10b981";
    if (alt < 30) return "#ff9d00";
    return "#ef4444";
  };
  const balloonIcon = (alt, id) =>
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
  const startIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`,
    className: "custom-start-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  const [selectedBalloon, setSelectedBalloon] = useState(null);
  const {
    data: balloons,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["balloons", 0],
    queryFn: async () => {
      const res = await fetch(
        "https://api.allorigins.win/raw?url=" +
          encodeURIComponent("https://a.windbornesystems.com/treasure/00.json"),
      );
      const data = await res.json();
      return data.filter(
        (pos) =>
          Array.isArray(pos) &&
          pos.length === 3 &&
          pos[0] >= -90 &&
          pos[0] <= 90 &&
          pos[1] >= -180 &&
          pos[1] <= 180,
      );
    },
    staleTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });
  const balloonQueries = useQueries({
    queries: Array.from({ length: 24 }, (_, i) => ({
      queryKey: ["balloons", i],
      queryFn: async () => {
        const file = i.toString().padStart(2, "0");
        const res = await fetch(
          `https://corsproxy.io/?https://a.windbornesystems.com/treasure/${file}.json`,
        );
        const data = await res.json();
        return data.filter(
          (pos) =>
            Array.isArray(pos) &&
            pos.length === 3 &&
            pos[0] >= -90 &&
            pos[0] <= 90 &&
            pos[1] >= -180 &&
            pos[1] <= 180,
        );
      },
      staleTime: 60 * 60 * 1000, // 1 hour - matches API update frequency
      refetchInterval: i === 0 ? 60 * 60 * 1000 : false, // Only auto-refetch current (00.json)
    })),
  });
  const currentBalloons = balloonQueries[0]?.data || [];
  const buildPaths = () => {
    const paths = [];
    const allData = balloonQueries.map((q) => q.data).filter(Boolean);

    if (allData.length === 0) return [];

    for (let i = 0; i < currentBalloons.length; i++) {
      const path = allData
        .map((hourData) => hourData[i])
        .filter(Boolean)
        .map(([lat, lon]) => [lat, lon]);

      if (path.length > 1) {
        paths.push({ balloonId: i, path });
      }
    }
    return paths;
  };
  const { data: weatherData } = useQuery({
    queryKey: ["rainviewer"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.rainviewer.com/public/weather-maps.json",
      );
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <>
      <div className="relative h-screen w-screen font-mono">
        <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-semibold mb-2 text-sm">Balloon Altitude</h3>
          <div className="space-y-1 text-xs mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#3b82f6" }}
              ></div>
              <span>&lt;10 km</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#10b981" }}
              ></div>
              <span>10-20 km</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#f59e0b" }}
              ></div>
              <span>20-30 km</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#ef4444" }}
              ></div>
              <span>&gt;30 km</span>
            </div>
          </div>

          <h3 className="font-semibold mb-2 text-sm border-t pt-3">
            Precipitation
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#4a90e2" }}
              ></div>
              <span>Light rain</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#f1c40f" }}
              ></div>
              <span>Moderate rain</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#e67e22" }}
              ></div>
              <span>Heavy rain</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#e74c3c" }}
              ></div>
              <span>Very heavy rain</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-gray-600">
            <div className="flex gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="icon icon-tabler icons-tabler-filled icon-tabler-info-circle"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />
              </svg>
              Click a balloon to view its 24-hour flight path and details
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
            Loading ballloons...
          </div>
        )}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg">
            Error loading data
          </div>
        )}

        <MapContainer
          center={[37.4419, 122.143]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {weatherData?.radar?.past?.[0] && (
            <TileLayer
              url={`https://tilecache.rainviewer.com${weatherData.radar.past[0].path}/256/{z}/{x}/{y}/2/1_1.png`}
              attribution="RainViewer.com"
              opacity={0.6}
            />
          )}
          {balloons?.map(
            ([lat, lon, alt]: [number, number, number], index: number) => (
              <Marker
                position={[lat, lon]}
                icon={balloonIcon(alt, index)}
                eventHandlers={{
                  click: () => setSelectedBalloon(index),
                }}
              >
                <Popup>
                  <div className="text-sm font-mono">
                    <strong>Balloon #{index}</strong> <br />
                    Lat: {lat.toFixed(4)}
                    <br />
                    Lon: {lon.toFixed(4)}
                    <br />
                    Alt: {alt.toFixed(2)} km
                  </div>
                </Popup>
              </Marker>
            ),
          )}
          {selectedBalloon !== null &&
            buildPaths()
              .filter((p) => p.balloonId === selectedBalloon)
              .map(({ balloonId, path }) => (
                <>
                  <Polyline
                    key={`path-${balloonId}`}
                    positions={path}
                    color="#ef4444"
                    weight={3}
                    opacity={0.8}
                    dashArray="10, 10"
                  />
                  <Marker position={path[path.length - 1]} icon={startIcon} />
                </>
              ))}
        </MapContainer>
      </div>
      {balloons && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
          <span className="font-semibold">{balloons.length}</span> balloons
          tracked
        </div>
      )}
    </>
  );
}

export default App;
