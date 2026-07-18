import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface BranchLocation {
    id: string;
    name: string;
    location: { coordinates: [number, number] } | null;
}

interface BranchesMapProps {
    businesses: BranchLocation[];
}

// Same custom SVG marker used by BusinessLocationPicker — avoids the classic
// "missing default leaflet marker image" bundler issue.
const customMarkerIcon = new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-primary drop-shadow-md"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    className: "custom-leaflet-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
});

const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length === 0) return;
        if (points.length === 1) {
            map.setView(points[0], 14);
        } else {
            map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 14 });
        }
    }, [points, map]);
    return null;
};

export const BranchesMap: React.FC<BranchesMapProps> = ({ businesses }) => {
    const located = businesses.filter(
        (b): b is BranchLocation & { location: { coordinates: [number, number] } } => !!b.location?.coordinates,
    );
    const points: [number, number][] = located.map((b) => [b.location.coordinates[1], b.location.coordinates[0]]);

    if (points.length === 0) return null;

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden border border-border z-0">
            <MapContainer
                center={points[0]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {located.map((b, i) => (
                    <Marker key={b.id} icon={customMarkerIcon} position={points[i]}>
                        <Popup>
                            <a href={`/manage/${b.id}/owner/dashboard`} className="font-medium text-sm">
                                {b.name}
                            </a>
                        </Popup>
                    </Marker>
                ))}
                <FitBounds points={points} />
            </MapContainer>
        </div>
    );
};
