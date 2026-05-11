"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, Loader2, Search, X } from "lucide-react";

// Fix Leaflet icon issue in Next.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface InteractiveMapProps {
  onLocationSelect: (lat: number, lng: number, addressText: string) => void;
  defaultLocation?: { lat: number; lng: number };
}

interface LocationMarkerProps {
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
  onAddressFetched: (address: string) => void;
}

function LocationMarker({
  position,
  setPosition,
  onAddressFetched,
}: LocationMarkerProps) {
  const lastFetchedPos = useRef<{ lat: number; lng: number } | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      // Check if position changed significantly to avoid infinite loop
      if (
        lastFetchedPos.current &&
        Math.abs(lastFetchedPos.current.lat - position.lat) < 0.00001 &&
        Math.abs(lastFetchedPos.current.lng - position.lng) < 0.00001
      ) {
        return;
      }

      const timer = setTimeout(() => {
        lastFetchedPos.current = { lat: position.lat, lng: position.lng };
        // Reverse geocoding using Nominatim
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&accept-language=ar`,
          {
            headers: {
              "User-Agent": "AlBadr-AgriApp/1.0",
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              onAddressFetched(data.display_name);
            }
          })
          .catch((err) => console.error("Error fetching address:", err));
      }, 800); // Increased debounce to avoid rate limits

      return () => clearTimeout(timer);
    }
  }, [position, onAddressFetched]);

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function InteractiveMap({
  onLocationSelect,
  defaultLocation,
}: InteractiveMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    defaultLocation ? L.latLng(defaultLocation.lat, defaultLocation.lng) : null,
  );
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<L.Map>(null);

  // Update position when defaultLocation changes
  useEffect(() => {
    if (defaultLocation) {
      // Avoid re-centering if we are already there.
      // Use map's actual current center or the state position to compare
      const currentPos = position;
      if (
        currentPos &&
        Math.abs(currentPos.lat - defaultLocation.lat) < 0.00001 &&
        Math.abs(currentPos.lng - defaultLocation.lng) < 0.00001
      ) {
        return;
      }
      
      const newPos = L.latLng(defaultLocation.lat, defaultLocation.lng);
      setTimeout(() => setPosition(newPos), 0);
      if (mapRef.current) {
        mapRef.current.flyTo(newPos, 16);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLocation]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=ar&limit=5&countrycodes=eg`,
          {
            headers: {
              "User-Agent": "AlBadr-AgriApp/1.0",
            },
          },
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectResult = (result: NominatimResult) => {
    const newPos = L.latLng(parseFloat(result.lat), parseFloat(result.lon));
    setPosition(newPos);
    setAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
    if (mapRef.current) {
      mapRef.current.flyTo(newPos, 16);
    }
  };

  // Default to Cairo if no default location
  const center = defaultLocation
    ? [defaultLocation.lat, defaultLocation.lng]
    : [30.0444, 31.2357];

  const handleLocateMe = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = L.latLng(pos.coords.latitude, pos.coords.longitude);
          setPosition(newPos);
          if (mapRef.current) {
            mapRef.current.flyTo(newPos, 16);
          }
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
          alert(
            "تعذر الحصول على موقعك. يرجى السماح بصلاحيات الموقع أو اختياره يدوياً.",
          );
        },
        { enableHighAccuracy: true },
      );
    } else {
      setLoading(false);
      alert("المتصفح الخاص بك لا يدعم تحديد الموقع.");
    }
  };

  const lastReportedRef = useRef<{lat: number, lng: number, address: string} | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  // Keep callback ref updated
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Report changes to parent with stability check
  useEffect(() => {
    if (position) {
      const lat = position.lat;
      const lng = position.lng;
      
      const hasChanged = !lastReportedRef.current || 
        Math.abs(lastReportedRef.current.lat - lat) > 0.00001 ||
        Math.abs(lastReportedRef.current.lng - lng) > 0.00001 ||
        lastReportedRef.current.address !== address;

      if (hasChanged) {
        lastReportedRef.current = { lat, lng, address };
        onLocationSelectRef.current(lat, lng, address);
      }
    }
  }, [position, address]);

  return (
    <div className="relative w-full space-y-3">
      {/* Search Input */}
      <div className="relative z-[40]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ابحث عن مدينة، منطقة، أو شارع..."
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pr-11 pl-4 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            dir="rtl"
          />
          <Search className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {(searchResults.length > 0 ||
          (searchQuery.length >= 3 &&
            !isSearching &&
            searchResults.length === 0)) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {searchResults.length > 0
              ? searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectResult(result)}
                    className="w-full text-right px-4 py-3 text-sm hover:bg-zinc-50 border-b border-zinc-50 last:border-0 flex items-start gap-3 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-zinc-700 line-clamp-2">
                      {result.display_name}
                    </span>
                  </button>
                ))
              : searchQuery.length >= 3 && (
                  <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                    <p>لم يتم العثور على نتائج للبحث.</p>
                  </div>
                )}
          </div>
        )}

        {isSearching && (
          <div className="absolute top-1/2 left-10 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          </div>
        )}
      </div>

      <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-sm border border-zinc-200">
        <MapContainer
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          center={center}
          zoom={13}
          ref={mapRef}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onAddressFetched={setAddress}
          />
        </MapContainer>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={loading}
          className="absolute bottom-4 right-4 z-[30] bg-white p-3 rounded-full shadow-lg border border-zinc-100 text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all"
          title="تحديد موقعي الحالي"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Crosshair className="w-5 h-5" />
          )}
        </button>

        {/* Address Overlay */}
        {address && (
          <div className="absolute bottom-4 left-4 right-16 z-[30] bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-zinc-100 text-xs flex gap-2 items-center">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-zinc-700 font-medium truncate" dir="rtl">
              {address}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
