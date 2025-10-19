import { calculateBalloonStats, getBalloonName } from "../MapUtils";

export const BalloonCard = ({ balloonId, pathData, onClose }) => {
  const stats = calculateBalloonStats(pathData);
  const name = getBalloonName(balloonId);
  const currentAlt = pathData[0]?.alt || 0;

  return (
    <div className="absolute font-mono top-20 left-4 z-[1000] w-80 bg-white rounded-lg overflow-hidden ">
      <div className=" p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 hover:bg-white/20 rounded-full p-1 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="text-xs font-semibold opacity-80">
          BALLOON #{balloonId}
        </div>
        <div className="text-2xl font-bold mt-1">{name}</div>
        <div className="text-sm opacity-90 mt-1">
          Currently at {currentAlt.toFixed(1)} km
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3">
            <div className="text-xs text-gray-500 font-semibold">
              DISTANCE (24h)
            </div>
            <div className="text-xl font-bold text-slate-600">
              {stats?.distance.toFixed(0)} km
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-500 font-semibold">AVG SPEED</div>
            <div className="text-xl font-bold text-slate-600">
              {stats?.avgSpeed.toFixed(0)} km/h
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border-1 ">
          <div className="text-xs text-gray-500 font-semibold mb-2">
            ALTITUDE RANGE
          </div>
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="text-gray-600">Min:</span>
              <span className="font-bold ml-1">
                {stats?.minAltitude.toFixed(1)} km
              </span>
            </div>
            <div>
              <span className="text-gray-600">Avg:</span>
              <span className="font-bold ml-1">
                {stats?.avgAltitude.toFixed(1)} km
              </span>
            </div>
            <div>
              <span className="text-gray-600">Max:</span>
              <span className="font-bold ml-1">
                {stats?.maxAltitude.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          Tracking last {pathData.length} hours
        </div>
      </div>
    </div>
  );
};
