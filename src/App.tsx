import { useQuery } from "@tanstack/react-query";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

function App() {
  const {
    data: balloons,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["balloons", 0],
    queryFn: async () => {
      const res = await fetch(
        "https://corsproxy.io/?https://a.windbornesystems.com/treasure/00.json",
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
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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
