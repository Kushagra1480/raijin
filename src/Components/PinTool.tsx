import { getBalloonName } from "../MapUtils";
import analysisImage from "../protractor.png";

export const PinTool = ({
  setPinLocation,
  pinRadius,
  setPinRadius,
  currentBalloonsInArea,
  historicalBalloonsInArea,
  setSelectedBalloon,
}) => {
  return (
    <div className="absolute top-20 left-4 z-[1000] bg-slate-50 border-2 border-slate-300 rounded-lg shadow-lg font-mono">
      <div className=" p-3 flex justify-between items-center">
        <h3 className="font-bold text-sm">RADIUS ANALYSIS</h3>
        <button
          onClick={() => setPinLocation(null)}
          className="hover:bg-slate-700 rounded p-1 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className=" p-3 flex justify-center">
        <div className="p-3">
          <img
            src={analysisImage}
            alt="Analysis Tool"
            className="w-32 h-32 object-contain"
          />
        </div>
      </div>

      <div className="p-5 border-b">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-600">RADIUS</label>
          <span className="text-sm font-bold text-slate-800">
            {pinRadius} km
          </span>
        </div>
        <input
          type="range"
          min="25"
          max="500"
          step="25"
          value={pinRadius}
          onChange={(e) => setPinRadius(Number(e.target.value))}
          className="w-full p-3"
        />
      </div>

      <div className="p-3 border-b border-slate-300">
        <div className="flex items-center gap-2 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-slate-700"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M13 18a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-1a2 2 0 0 1 2 -2z" />
            <path d="M12 1a7 7 0 0 1 7 7c0 4.185 -3.297 9 -7 9s-7 -4.815 -7 -9a7 7 0 0 1 7 -7" />
          </svg>
          <span className="text-xs font-bold text-slate-600">
            CURRENT ({currentBalloonsInArea.length})
          </span>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {currentBalloonsInArea.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No balloons in area</p>
          ) : (
            currentBalloonsInArea.map(({ index, distance }) => (
              <div
                key={index}
                className="text-xs bg-slate-100 p-2 rounded flex justify-between items-center hover:bg-slate-200 transition cursor-pointer"
                onClick={() => setSelectedBalloon(index)}
              >
                <div>
                  <span className="font-bold">#{index}</span>
                  <span className="text-slate-600">
                    {" "}
                    • {getBalloonName(index)}
                  </span>
                </div>
                <span className="text-slate-500">{distance.toFixed(0)} km</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-slate-500"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M13 18a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-1a2 2 0 0 1 2 -2z" />
            <path d="M12 1a7 7 0 0 1 7 7c0 4.185 -3.297 9 -7 9s-7 -4.815 -7 -9a7 7 0 0 1 7 -7" />
          </svg>
          <span className="text-xs font-bold text-slate-600">
            PAST 24H ({historicalBalloonsInArea.length})
          </span>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {historicalBalloonsInArea.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No balloons passed through
            </p>
          ) : (
            historicalBalloonsInArea.map(({ index, hoursAgo, distance }) => (
              <div
                key={`${index}-${hoursAgo}`}
                className="text-xs bg-slate-100 p-2 rounded hover:bg-slate-200 transition cursor-pointer"
                onClick={() => setSelectedBalloon(index)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold">#{index}</span>
                    <span className="text-slate-600">
                      {" "}
                      • {getBalloonName(index)}
                    </span>
                  </div>
                  <span className="text-slate-500">
                    {distance.toFixed(0)} km
                  </span>
                </div>
                <div className="text-slate-500 mt-1">{hoursAgo}h ago</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
