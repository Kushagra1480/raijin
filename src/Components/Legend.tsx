import { ALTITUDE_COLORS } from "../Enums";

export const Legend = ({ activeAltitudes, setActiveAltitudes }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-xs opacity-80">
      <h3 className="font-semibold mb-2 text-sm">Balloon Altitude</h3>
      <div className="space-y-1 text-xs mb-5">
        <button
          onClick={() =>
            setActiveAltitudes((prev) => ({ ...prev, low: !prev.low }))
          }
          className={`flex items-center gap-2 w-full hover:bg-gray-100 p-1 rounded transition ${!activeAltitudes.low ? "opacity-40" : ""}`}
        >
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: ALTITUDE_COLORS.LESS_THAN_TEN_KM }}
          ></div>
          <span>&lt;10 km</span>
          {!activeAltitudes.low && (
            <span className="ml-auto text-gray-400">✕</span>
          )}
        </button>
        <button
          onClick={() =>
            setActiveAltitudes((prev) => ({ ...prev, medium: !prev.medium }))
          }
          className={`flex items-center gap-2 w-full hover:bg-gray-100 p-1 rounded transition ${!activeAltitudes.medium ? "opacity-40" : ""}`}
        >
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: ALTITUDE_COLORS.TEN_TO_TWENTY_KM }}
          ></div>
          <span>10-20 km</span>
          {!activeAltitudes.medium && (
            <span className="ml-auto text-gray-400">✕</span>
          )}
        </button>
        <button
          onClick={() =>
            setActiveAltitudes((prev) => ({ ...prev, high: !prev.high }))
          }
          className={`flex items-center gap-2 w-full hover:bg-gray-100 p-1 rounded transition ${!activeAltitudes.high ? "opacity-40" : ""}`}
        >
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: ALTITUDE_COLORS.TWENTY_TO_THIRTY_KM }}
          ></div>
          <span>20-30 km</span>
          {!activeAltitudes.high && (
            <span className="ml-auto text-gray-400">✕</span>
          )}
        </button>
        <button
          onClick={() =>
            setActiveAltitudes((prev) => ({
              ...prev,
              veryHigh: !prev.veryHigh,
            }))
          }
          className={`flex items-center gap-2 w-full hover:bg-gray-100 p-1 rounded transition ${!activeAltitudes.veryHigh ? "opacity-40" : ""}`}
        >
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: ALTITUDE_COLORS.GREATER_THAN_THIRY_KM }}
          ></div>
          <span>&gt;30 km</span>
          {!activeAltitudes.veryHigh && (
            <span className="ml-auto text-gray-400">✕</span>
          )}
        </button>
        <span className="text-xs font-bold mt-5">
          Source:{" "}
          <a
            className="font-normal text-blue-700 hover:text-blue-800 underline"
            href="https://api.windbornesystems.com/api-experience/docs"
            target="_blank"
          >
            WindBorne API
          </a>
        </span>

        <div className="mt-3 text-xs text-gray-600">
          <div className="flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="icon icon-tabler icons-tabler-filled icon-tabler-info-circle"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />
            </svg>
            Click an altitude level to toggle it on/off
          </div>
        </div>
      </div>

      <h3 className="font-semibold mb-2 text-sm border-t pt-2">
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
          Source:{" "}
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
  );
};
