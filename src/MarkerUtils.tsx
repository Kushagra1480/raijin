import { memo } from "react";
import { Marker, Popup } from "react-leaflet";
import { balloonIcon } from "./MapUtils";

export const BalloonMarker = memo<{
  lat: number;
  lon: number;
  alt: number;
  index: number;
  onClick: () => void;
}>(({ lat, lon, alt, index, onClick }) => (
  <Marker
    position={[lat, lon]}
    icon={balloonIcon(alt, index)}
    eventHandlers={{ click: onClick }}
  ></Marker>
));
export const PathPoint = memo(({ position, alt, hoursAgo, balloonId }) => {
  const [lat, lon] = position;

  return (
    <Marker
      position={position}
      icon={balloonIcon(alt, balloonId)}
      opacity={0.4}
    >
      <Popup>
        <div className="text-xs">
          <strong>{hoursAgo}h ago</strong>
          <br />
          Lat: {lat.toFixed(4)}
          <br />
          Lon: {lon.toFixed(4)}
          <br />
          Alt: {alt.toFixed(2)} km
        </div>
      </Popup>
    </Marker>
  );
});
