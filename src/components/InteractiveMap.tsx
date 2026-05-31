import React, { useEffect, useRef, useState } from "react";
import { Restaurant } from "../types";
import { MapPin, Navigation, Compass, ArrowRight, Eye, Star, Info } from "lucide-react";

// Declare Leaflet global variable initialized via the HTML CDN
declare const L: any;

interface InteractiveMapProps {
  restaurants: Restaurant[];
  userLocation: { latitude: number; longitude: number } | null;
  onExploreRestaurant: (r: Restaurant) => void;
  onOpenOrderModal: (r: Restaurant) => void;
}

export default function InteractiveMap({
  restaurants,
  userLocation,
  onExploreRestaurant,
  onOpenOrderModal,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routingLineRef = useRef<any>(null);

  const [activeRes, setActiveRes] = useState<Restaurant | null>(null);
  const [directions, setDirections] = useState<string[]>([]);
  const [routeStats, setRouteStats] = useState<{ distance: number; duration: number } | null>(null);

  // Default coordinate center (Bengaluru Central) if no geolocation provided
  const centerLat = userLocation ? userLocation.latitude : 12.9716;
  const centerLng = userLocation ? userLocation.longitude : 77.5946;

  // Haversine formula for calculating distance
  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // Build simulated turn-by-turn driving routing instructions
  const generateDirections = (start: { latitude: number; longitude: number }, end: Restaurant) => {
    const dist = getDistanceInKm(start.latitude, start.longitude, end.latitude, end.longitude);
    const estMinutes = Math.round((dist / 30) * 60 + 5); // 30km/h average city speed plus 5 mins start buffer

    const steps = [
      `🎯 Start location: Registered Customer Base (${start.latitude.toFixed(4)}, ${start.longitude.toFixed(4)})`,
      `🏁 Proceed North-East along main connecting bypass road for about ${(dist * 0.3).toFixed(1)} km`,
      `↗️ Turn right at active crossroad intersection toward ${end.locationName}`,
      `🛣️ Merge on well-paved lanes and continue toward ${end.address.split(",")[0] || end.name}`,
      `📍 Arrive at destination on the left: ${end.name} (${end.address})`
    ];

    setDirections(steps);
    setRouteStats({ distance: dist, duration: estMinutes });
  };

  // Select restaurant marker and draw routing
  const selectRestaurantAndRoute = (restaurant: Restaurant) => {
    setActiveRes(restaurant);
    if (!mapInstanceRef.current) return;

    // Clear previous routing lines
    if (routingLineRef.current) {
      mapInstanceRef.current.removeLayer(routingLineRef.current);
      routingLineRef.current = null;
    }

    if (userLocation) {
      // Draw new routing polyline
      const points = [
        [userLocation.latitude, userLocation.longitude],
        [restaurant.latitude, restaurant.longitude]
      ];

      routingLineRef.current = L.polyline(points, {
        color: "#ea580c", // tailwind orange-600
        weight: 4,
        opacity: 0.85,
        dashArray: "10, 8",
        className: "animate-pulse"
      }).addTo(mapInstanceRef.current);

      // Auto-fit bounds to frame both points
      const bounds = L.latLngBounds(points);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

      generateDirections(userLocation, restaurant);
    } else {
      // If no GPS, just center map directly on restaurant
      mapInstanceRef.current.setView([restaurant.latitude, restaurant.longitude], 15);
      setDirections([
        "⚠️ Routing estimation requires setting your location.",
        "💡 Tip: Select a simulated city or enable 'Use Device GPS' at the top of the screen to draw interactive pathways."
      ]);
      setRouteStats(null);
    }
  };

  // Re-run whenever location, map object, or restaurant listings changes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map Instance
    if (!mapInstanceRef.current) {
      if (typeof L === "undefined") {
        console.error("Leaflet is not loaded yet via CDN.");
        return;
      }

      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([centerLat, centerLng], 12);

      // Mount high-contrast modern OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    } else {
      // Map already initialized, let's update view center optionally
      mapInstanceRef.current.setView([centerLat, centerLng], mapInstanceRef.current.getZoom());
    }

    // Refresh Markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();

      // 1. Add User's Location Marker (Blue Icon decoration)
      if (userLocation) {
        const blueIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div class="w-7 h-7 bg-blue-600 border-4 border-white text-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
                  <span class="text-[9px] font-black">YOU</span>
                 </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([userLocation.latitude, userLocation.longitude], { icon: blueIcon })
          .addTo(markersGroupRef.current)
          .bindPopup(`<strong>📍 Your Selection Point</strong><br/>Coords: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`)
          .openPopup();
      }

      // 2. Add Restaurant Markers (Orange Cutlery layout)
      restaurants.forEach((res) => {
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div class="w-8 h-8 bg-orange-600 hover:bg-orange-500 hover:scale-110 active:scale-95 text-white border-2 border-white rounded-full shadow-md flex items-center justify-center transition-all cursor-pointer">
                  <span>🍛</span>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([res.latitude, res.longitude], { icon: customIcon })
          .addTo(markersGroupRef.current);

        // Bind raw HTML descriptive popups
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 2px; width: 180px;">
            <strong style="color: #ea580c; font-size: 13px; font-weight: 800;">${res.name}</strong><br/>
            <span style="font-size: 11px; color: #475569; font-weight: 600;">${res.cuisineType}</span><br/>
            <span style="font-size: 10px; display: block; margin-top: 4px; color: #64748b;">★ ${res.rating} Average Rating</span>
          </div>
        `);

        // Handle quick click on map marker
        marker.on("click", () => {
          selectRestaurantAndRoute(res);
        });
      });
    }

    // Handle initial auto-route if requested
    if (restaurants.length > 0 && !activeRes) {
      // default route to first option
      setActiveRes(restaurants[0]);
      setTimeout(() => {
        selectRestaurantAndRoute(restaurants[0]);
      }, 500);
    }
  }, [restaurants, userLocation]);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 select-text" id="interactive-routing-map">
      {/* Map display area */}
      <div className="lg:col-span-8 h-[400px] lg:h-[500px] relative z-10">
        <div ref={mapContainerRef} className="w-full h-full" style={{ outline: "none" }} />
        
        {/* Floating Controls reminder */}
        <div className="absolute bottom-4 left-4 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-2 z-[400]">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span>OpenStreetMap Active • Interactive Live Routing</span>
        </div>
      </div>

      {/* Right side route instruction sidebar panel */}
      <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col h-[500px] bg-slate-50">
        
        {/* Active Selected Spot Details */}
        {activeRes ? (
          <div className="p-5 border-b border-slate-100 bg-white text-left space-y-3 shrink-0">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Active Choice Outlets</span>
              <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 mt-0.5">{activeRes.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">🏷️ {activeRes.cuisineType}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 mt-1">📍 {activeRes.address}</p>
            </div>

            {/* Quick reviews tags inside sidebar */}
            <div className="flex gap-4 text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-0.5"><Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> {activeRes.rating}</span>
              <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5 text-slate-400" /> {activeRes.viewCount} views</span>
            </div>

            {/* Quick Trigger Button */}
            <div className="flex gap-2">
              <button
                onClick={() => onExploreRestaurant(activeRes)}
                className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-705 text-[10px] font-bold uppercase rounded-lg transition"
              >
                Inquire Menu
              </button>
              <button
                onClick={() => onOpenOrderModal(activeRes)}
                className="flex-1 py-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase rounded-lg transition tracking-wide text-center"
              >
                Order WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 border-b border-slate-100 bg-white text-center italic text-xs py-8 text-slate-400">
            Click any marker 🍛 coordinate on the left map to calculate directions.
          </div>
        )}

        {/* Dynamic routing calculations & driving steps */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Step-By-Step Directions:</span>
            {routeStats && (
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-extrabold uppercase">
                🚘 DRIVING
              </span>
            )}
          </div>

          {/* Stats Bar */}
          {routeStats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-left">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Est Distance</span>
                <span className="text-base font-black text-slate-800 font-mono">{routeStats.distance} km</span>
              </div>
              <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-left">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Est Travel Time</span>
                <span className="text-base font-black text-orange-600 font-mono">{routeStats.duration} mins</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
              <p className="text-[10px] font-bold text-amber-800 leading-normal">
                💡 Geolocation routing is simulated over India. Set location map target to draw lines and calculate times instantly!
              </p>
            </div>
          )}

          {/* Directions List step-by-step elements */}
          {directions.length > 0 ? (
            <div className="space-y-2 text-left">
              {directions.map((step, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-[11px] font-medium leading-relaxed bg-white border border-slate-100 hover:border-slate-200 p-2.5 rounded-xl transition-all shadow-2xs">
                  <span className="w-5 h-5 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-600 font-semibold">{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[11px] text-slate-400">
              Select or claim a restaurant card to get instant physical directions overlay.
            </div>
          )}
        </div>

        {/* Quick alternative sidebar list of other restaurants */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block text-left mb-1.5">Switch Route View Destination:</span>
          <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
            {restaurants.slice(0, 5).map((res) => (
              <button
                key={res.id}
                onClick={() => selectRestaurantAndRoute(res)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                  activeRes?.id === res.id
                    ? "bg-orange-600 border-orange-650 text-white shadow-sm"
                    : "bg-slate-55 bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-600"
                }`}
              >
                {res.name.split(" - ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
