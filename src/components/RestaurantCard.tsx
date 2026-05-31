import React from "react";
import { Star, MapPin, Eye, Clock, Navigation, Trash2, Edit2 } from "lucide-react";
import { Restaurant, UserSession } from "../types";

interface RestaurantCardProps {
  key?: string | number;
  restaurant: Restaurant;
  userLocation: { latitude: number; longitude: number } | null;
  user: UserSession | null;
  onOpen: (restaurant: Restaurant) => void;
  onEdit: (restaurant: Restaurant, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function RestaurantCard({
  restaurant,
  userLocation,
  user,
  onOpen,
  onEdit,
  onDelete
}: RestaurantCardProps) {
  
  // Calculate distance in km
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

  const isOwner = user && (user.role === "admin" || (user.role === "owner" && restaurant.ownerEmail === user.email.toLowerCase()));

  return (
    <div
      onClick={() => onOpen(restaurant)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
      id={`restaurant-${restaurant.id}`}
    >
      {/* Banner Cover Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600";
          }}
        />
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
        
        {/* Rating Floating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <span className="text-xs font-bold text-slate-800">{restaurant.rating}</span>
          <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
        </div>

        {/* Distance Badge */}
        {distance !== null && (
          <div className="absolute bottom-4 left-4 bg-orange-600/95 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm tracking-wider">
            <Navigation className="w-2.5 h-2.5 fill-white" />
            {distance} km away
          </div>
        )}
      </div>

      {/* Card Content body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
            {restaurant.cuisineType}
          </span>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 leading-tight">
            {restaurant.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{restaurant.address}</span>
          </p>

          {/* Quick Specialties Tag Previews */}
          {restaurant.menuItems && restaurant.menuItems.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-50">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Most Popular:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {restaurant.menuItems.slice(0, 2).map((item, id) => (
                  <span
                    key={id}
                    className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-100 transition truncate max-w-[140px]"
                    title={item.name}
                  >
                    {item.name} • ₹{item.price}
                  </span>
                ))}
                {restaurant.menuItems.length > 2 && (
                  <span className="text-[10px] text-slate-400 font-bold self-center">
                    +{restaurant.menuItems.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Metrics + Action Links */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Eye className="w-3.5 h-3.5 text-slate-350" />
            <span>{restaurant.viewCount} views</span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {isOwner && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={(e) => onEdit(restaurant, e)}
                  className="p-1.5 hover:bg-slate-100 text-slate-605 text-slate-600 rounded-lg transition"
                  title="Edit details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => onDelete(restaurant.id, e)}
                  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                  title="Delete partner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={() => onOpen(restaurant)}
              className="text-xs font-extrabold text-orange-600 hover:text-orange-500 hover:underline cursor-pointer"
            >
              Explore Menu →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
