import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

function App() {
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

    // Each balloon (by index) has a path
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
      <div className="relative h-screen w-screen">
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
              <CircleMarker
                key={index}
                center={[lat, lon]}
                radius={6}
                fillColor="#3b82f6"
                fillOpacity={0.8}
                color="#1e40af"
                weight={2}
                eventHandlers={{
                  click: () => setSelectedBalloon(index),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Balloon #{index}</strong> <br />
                    Lat: {lat.toFixed(4)}
                    <br />
                    Lon: {lon.toFixed(4)}
                    <br />
                    Alt: {alt.toFixed(2)} km
                  </div>
                </Popup>
              </CircleMarker>
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
                  <CircleMarker
                    center={path[path.length - 1]} // Last element is oldest (start)
                    radius={8}
                    fillColor="#22c55e"
                    fillOpacity={1}
                    color="#fff"
                    weight={2}
                  />
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
