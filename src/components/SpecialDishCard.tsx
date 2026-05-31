import React from "react";
import { Star, MapPin, Navigation, Compass, Sparkles } from "lucide-react";
import { MenuItem, Restaurant } from "../types";

interface SpecialDishCardProps {
  key?: string | number;
  item: MenuItem;
  restaurant: Restaurant;
  userLocation: { latitude: number; longitude: number } | null;
  onExplore: (restaurant: Restaurant) => void | Promise<void>;
}

// Advanced keyword-to-culinary-imagery mapper to provide a stunning visual experience
const getDishImage = (dishName: string, tags: string[]): string => {
  const name = dishName.toLowerCase();
  if (name.includes("biryani")) {
    return "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=500";
  }
  if (name.includes("dosa") || name.includes("idli") || name.includes("uttapam")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=500";
  }
  if (name.includes("chicken") || name.includes("raan") || name.includes("korma") || name.includes("kabab") || name.includes("mutton")) {
    return "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=500";
  }
  if (name.includes("dal") || name.includes("bukhara")) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=500";
  }
  if (name.includes("paneer") || name.includes("gatte") || name.includes("sangri") || name.includes("sabzi")) {
    return "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=500";
  }
  if (name.includes("coffee") || name.includes("tea") || name.includes("drink")) {
    return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=500";
  }
  if (tags.includes("veg")) {
    return "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=500";
  }
  return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=500";
};

export default function SpecialDishCard({
  item,
  restaurant,
  userLocation,
  onExplore
}: SpecialDishCardProps) {
  
  // Calculate distance in km dynamically
  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
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

  const distance = userLocation
    ? getDistanceInKm(userLocation.latitude, userLocation.longitude, restaurant.latitude, restaurant.longitude)
    : null;

  const dishImage = getDishImage(item.name, item.tags);
  const isVeg = item.tags.includes("veg");
  const isSpicy = item.tags.includes("spicy");

  return (
    <div
      onClick={() => onExplore(restaurant)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full"
      id={`dish-${item.name.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {/* Cover Image & Distance overlay */}
      <div className="relative h-44 overflow-hidden bg-slate-50">
        <img
          src={dishImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=500";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent"></div>

        {/* Veg/Non-veg Marker Float */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-sm flex items-center justify-center">
          <span
            className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center p-0.5 ${
              isVeg ? "border-green-600" : "border-red-650 border-red-600"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
          </span>
        </div>

        {/* Rating Floating Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1">
          <span>{restaurant.rating}</span>
          <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
        </div>

        {/* Live Distance calculations */}
        {distance !== null ? (
          <div className="absolute bottom-3 left-3 bg-orange-600 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase text-white flex items-center gap-1 shadow-sm tracking-wide">
            <Navigation className="w-2.5 h-2.5 fill-white" />
            {distance} km away
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-200">
            {restaurant.locationName}
          </div>
        )}

        {/* Specialty Signature Badge */}
        {item.tags.includes("signature") && (
          <div className="absolute top-3 left-12 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
            <Sparkles className="w-2.5 h-2.5 fill-slate-950" /> Signature
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-1">
              {item.name}
            </h3>
            <span className="text-sm font-black text-slate-800 whitespace-nowrap bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg shadow-sm">
              ₹{item.price}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1 lines-clamp-2 line-clamp-2 font-medium min-h-[32px] leading-relaxed">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-1 mt-2.5">
            {item.tags.filter(t => t !== "veg").map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] bg-slate-50 text-slate-500 border border-slate-100 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {isSpicy && (
              <span className="text-[9px] bg-red-50 text-red-650 border border-red-100 font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                🌶️ Spicy
              </span>
            )}
          </div>
        </div>

        {/* Restaurant Association Footer */}
        <div className="border-t border-slate-50 pt-3 mt-3 flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-slate-700 truncate max-w-[70%]">
            <Compass className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <div className="truncate text-left">
              <span className="block text-slate-400 text-[8px] font-black uppercase tracking-wider leading-none">Served By</span>
              <span className="font-extrabold text-slate-800 truncate">{restaurant.name}</span>
            </div>
          </div>
          <span className="text-orange-600 hover:underline shrink-0 text-xs">Explore →</span>
        </div>
      </div>
    </div>
  );
}
