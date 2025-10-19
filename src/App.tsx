import { useQueries, useQuery } from "@tanstack/react-query";
import React from "react";
import { useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { BalloonMarker, PathPoint } from "./MarkerUtils";
import { startIcon } from "./MapUtils";
import { BalloonCard } from "./Components/BalloonCard";

function App() {
  const [selectedBalloon, setSelectedBalloon] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(5);
  const ZoomTracker = () => {
    const map = useMapEvents({
      zoomend: () => {
        setZoomLevel(map.getZoom());
      },
    });
    return null;
  };
  const {
    data: balloons,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["balloons", 0],
    queryFn: async () => {
      const res = await fetch(
        `https://frosty-tooth-d188.kushagrakartik1480.workers.dev/?url=${encodeURIComponent("https://a.windbornesystems.com/treasure/00.json")}`,
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
          `https://frosty-tooth-d188.kushagrakartik1480.workers.dev/?url=${encodeURIComponent(`https://a.windbornesystems.com/treasure/${file}.json`)}`,
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
      refetchInterval: i === 0 ? 60 * 60 * 1000 : false,
    })),
  });
  const displayBalloons = balloonQueries[timeOffset]?.data || [];
  const buildPaths = () => {
    const paths = [];
    const allData = balloonQueries
      .slice(timeOffset)
      .map((q) => q.data)
      .filter(Boolean);

    if (allData.length === 0) return [];

    const minBalloonCount = Math.min(...allData.map((d) => d.length));

    for (let i = 0; i < minBalloonCount; i++) {
      const pathWithData = allData
        .map((hourData, hourIndex) => hourData[i])
        .filter((pos) => pos && Array.isArray(pos) && pos.length === 3)
        .map(([lat, lon, alt], index) => ({
          position: [lat, lon],
          alt,
          hoursAgo: timeOffset + index,
        }));

      if (pathWithData.length > 1) {
        paths.push({
          balloonId: i,
          path: pathWithData.map((p) => p.position),
          pathData: pathWithData,
        });
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
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <div className="relative h-screen w-screen font-mono">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white p-4 rounded-lg shadow-lg opacity-80">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">Rewind:</label>
            <input
              type="range"
              min="0"
              max="23"
              value={timeOffset}
              onChange={(e) => {
                setTimeOffset(Number(e.target.value));
                setSelectedBalloon(null); // Clear selection on time change
              }}
              className="w-48"
            />
            <span className="text-sm font-mono">
              {timeOffset === 0 ? "Now" : `-${timeOffset}h`}
            </span>
          </div>
        </div>
        <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-xs opacity-80">
          <h3 className="font-semibold mb-2 text-sm">Balloon Altitude</h3>
          <div className="space-y-1 text-xs mb-5">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#f8dda4" }}
              ></div>
              <span>&lt;10 km</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#f9a03f" }}
              ></div>
              <span>10-20 km</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#d45113" }}
              ></div>
              <span>20-30 km</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#813405" }}
              ></div>
              <span>&gt;30 km</span>
            </div>
            <span className="text-xs font-bold mt-5">
              Source:
              <a
                className="font-normal text-blue-700 hover:text-blue-800 underline"
                href="https://api.windbornesystems.com/api-experience/docs"
                target="_blank"
              >
                WindBorne API
              </a>
            </span>
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
            <span className="text-xs font-bold mt-5">
              Source:
              <a
                className="font-normal text-blue-700 hover:text-blue-800 underline"
                href="https://www.rainviewer.com/"
                target="_blank"
              >
                RainViewer API
              </a>
            </span>
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-gray-600">
            <div className="flex gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="icon icon-tabler icons-tabler-filled icon-tabler-info-circle"
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
            Loading balloons...
          </div>
        )}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg">
            Error loading data
          </div>
        )}

        <MapContainer
          center={[37.4419, -122.143]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "100vh", width: "100%" }}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
        >
          <ZoomTracker />
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
          {displayBalloons?.map(
            ([lat, lon, alt]: [number, number, number], index: number) => (
              <BalloonMarker
                key={index}
                lat={lat}
                lon={lon}
                alt={alt}
                index={index}
                onClick={() => setSelectedBalloon(index)}
                showSimple={zoomLevel < 4}
              />
            ),
          )}
          {selectedBalloon !== null &&
            (() => {
              const selectedPath = buildPaths().find(
                (p) => p.balloonId === selectedBalloon,
              );
              return selectedPath ? (
                <>
                  <BalloonCard
                    balloonId={selectedPath.balloonId}
                    pathData={selectedPath.pathData}
                    onClose={() => setSelectedBalloon(null)}
                  />
                  <React.Fragment key={`path-${selectedPath.balloonId}`}>
                    <Polyline
                      positions={selectedPath.path}
                      color="#ef4444"
                      weight={3}
                      opacity={0.8}
                      dashArray="10, 10"
                    />
                    {selectedPath.pathData.map((point, idx) => (
                      <PathPoint
                        key={`point-${selectedPath.balloonId}-${idx}`}
                        position={point.position}
                        alt={point.alt}
                        hoursAgo={point.hoursAgo}
                        balloonId={selectedPath.balloonId}
                      />
                    ))}
                    <Marker
                      position={selectedPath.path[selectedPath.path.length - 1]}
                      icon={startIcon}
                    />
                  </React.Fragment>
                </>
              ) : null;
            })()}
        </MapContainer>
      </div>
      {displayBalloons && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg font-mono opacity-80">
          <span className="font-semibold">{displayBalloons.length}</span>{" "}
          balloons tracked
        </div>
      )}
    </>
  );
}

export default App;
