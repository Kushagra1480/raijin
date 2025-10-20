import { useQueries, useQuery } from "@tanstack/react-query";
import React from "react";
import { useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { BalloonMarker, PathPoint } from "./MarkerUtils";
import { getDistance, pinIcon, startIcon } from "./MapUtils";
import { BalloonCard } from "./Components/BalloonCard";
import { Legend } from "./Components/Legend";
import { PinTool } from "./Components/PinTool";

function App() {
  const [selectedBalloon, setSelectedBalloon] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [activeAltitudes, setActiveAltitudes] = useState({
    low: true,
    medium: true,
    high: true,
    veryHigh: true,
  });
  const [pinMode, setPinMode] = useState(false);
  const [pinLocation, setPinLocation] = useState(null);
  const [pinRadius, setPinRadius] = useState(100);
  const [activeTool, setActiveTool] = useState(null);
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (pinMode) {
          setPinLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      },
    });
    return null;
  };
  const filterByAltitude = (balloons) => {
    if (!balloons) return [];
    return balloons.filter(([lat, lon, alt]) => {
      if (alt < 10) return activeAltitudes.low;
      if (alt < 20) return activeAltitudes.medium;
      if (alt < 30) return activeAltitudes.high;
      return activeAltitudes.veryHigh;
    });
  };
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
  const displayBalloons = filterByAltitude(
    balloonQueries[timeOffset]?.data || [],
  );
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
  const currentBalloonsInArea = pinLocation
    ? displayBalloons
        .map(([lat, lon, alt], index) => ({
          index,
          distance: getDistance(pinLocation.lat, pinLocation.lng, lat, lon),
        }))
        .filter(({ distance }) => distance <= pinRadius)
        .sort((a, b) => a.distance - b.distance)
    : [];

  const historicalBalloonsInArea = pinLocation
    ? (() => {
        const results = [];
        const allData = balloonQueries.map((q) => q.data).filter(Boolean);

        if (allData.length === 0) return [];

        const minBalloonCount = Math.min(...allData.map((d) => d.length));

        for (
          let balloonIndex = 0;
          balloonIndex < minBalloonCount;
          balloonIndex++
        ) {
          for (let hourIndex = 0; hourIndex < allData.length; hourIndex++) {
            const position = allData[hourIndex][balloonIndex];
            if (!position || !Array.isArray(position) || position.length !== 3)
              continue;

            const [lat, lon] = position;
            const distance = getDistance(
              pinLocation.lat,
              pinLocation.lng,
              lat,
              lon,
            );

            if (distance <= pinRadius) {
              results.push({
                index: balloonIndex,
                hoursAgo: hourIndex,
                distance,
              });
            }
          }
        }

        return results.sort((a, b) => {
          if (a.hoursAgo !== b.hoursAgo) return a.hoursAgo - b.hoursAgo;
          return a.distance - b.distance;
        });
      })()
    : [];

  return (
    <>
      <div className="relative h-screen w-screen font-mono">
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-90 z-[1000] bg-white rounded-4xl shadow-lg border border-slate-200 flex gap-1">
          <button
            onClick={() =>
              setActiveTool(activeTool === "rewind" ? null : "rewind")
            }
            className={`p-2 rounded-4xl transition ${
              activeTool === "rewind"
                ? "bg-blue-500 text-white"
                : "hover:bg-slate-100 text-slate-700"
            }`}
            title="Rewind Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 12a9 9 0 0 0 5.998 8.485m12.002 -8.485a9 9 0 1 0 -18 0" />
              <path d="M12 7v5" />
              <path d="M12 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2" />
              <path d="M18 15v2a1 1 0 0 0 1 1h1" />
              <path d="M21 15v6" />
            </svg>
          </button>

          <button
            onClick={() => {
              const newTool = activeTool === "analysis" ? null : "analysis";
              setActiveTool(newTool);
              setPinMode(newTool === "analysis");
              if (newTool !== "analysis") setPinLocation(null);
            }}
            className={`p-2 rounded-4xl transition ${
              activeTool === "analysis"
                ? "bg-blue-500 text-white"
                : "hover:bg-slate-100 text-slate-700"
            }`}
            title="Radius Analysis Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M11 18l-2 -1l-6 3v-13l6 -3l6 3l6 -3v7.5" />
              <path d="M9 4v13" />
              <path d="M15 7v5" />
              <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M20.2 20.2l1.8 1.8" />
            </svg>
          </button>
        </div>

        {activeTool === "rewind" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white p-4 rounded-lg shadow-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold">Rewind:</label>
              <input
                type="range"
                min="0"
                max="23"
                value={timeOffset}
                onChange={(e) => {
                  setTimeOffset(Number(e.target.value));
                  setSelectedBalloon(null);
                }}
                className="w-48"
              />
              <span className="text-sm font-mono">
                {timeOffset === 0 ? "Now" : `-${timeOffset}h`}
              </span>
            </div>
          </div>
        )}

        <Legend
          activeAltitudes={activeAltitudes}
          setActiveAltitudes={setActiveAltitudes}
        />

        {pinLocation && activeTool === "analysis" && (
          <PinTool
            setPinLocation={setPinLocation}
            pinRadius={pinRadius}
            setPinRadius={setPinRadius}
            currentBalloonsInArea={currentBalloonsInArea}
            historicalBalloonsInArea={historicalBalloonsInArea}
            setSelectedBalloon={setSelectedBalloon}
          />
        )}
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
          <MapClickHandler />
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
          {pinLocation && (
            <>
              <Marker
                position={[pinLocation.lat, pinLocation.lng]}
                icon={pinIcon}
              />
              <Circle
                center={[pinLocation.lat, pinLocation.lng]}
                radius={pinRadius * 1000}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            </>
          )}
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
