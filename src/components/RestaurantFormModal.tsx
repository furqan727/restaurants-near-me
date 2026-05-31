import React, { useState } from "react";
import { X, Plus, Trash2, PlusCircle, AlertCircle, Sparkles } from "lucide-react";
import { MenuItem } from "../types";
import { INDIA_STATES_AND_CITIES, CITIES_COORDINATES, findStateForCity } from "../utils/indiaData";

interface RestaurantFormModalProps {
  onClose: () => void;
  editingId: string | null;
  restaurantForm: {
    name: string;
    cuisineType: string;
    locationName: string;
    address: string;
    websiteUrl: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    menuItems: MenuItem[];
    whatsappNumber?: string;
  };
  setRestaurantForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: (e: React.FormEvent) => void;
  formError: string;
}

// Culinary Unsplash Cover Images suggestions
const defaultCulinaryImages = [
  "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"
];

export default function RestaurantFormModal({
  onClose,
  editingId,
  restaurantForm,
  setRestaurantForm,
  onSave,
  formError,
}: RestaurantFormModalProps) {
  // Determine initial state based on current locationName
  const initialInfo = findStateForCity(restaurantForm.locationName || "Bengaluru (Central)");
  const [selectedState, setSelectedState] = useState(initialInfo.state || "Karnataka");
  const [searchText, setSearchText] = useState(restaurantForm.locationName || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Local state for temporary menu item input row
  const [newMenu, setNewMenu] = useState({
    name: "",
    price: 0,
    description: "",
    isVeg: true,
    isSpicy: false,
  });

  const handleCityChange = (city: string) => {
    const coords = CITIES_COORDINATES[city] || { lat: 12.9716, lng: 77.5946 };
    setRestaurantForm((prev: any) => ({
      ...prev,
      locationName: city,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const handleAddMenuRow = () => {
    if (!newMenu.name.trim() || newMenu.price <= 0) {
      alert("Please provide a valid dish name and price.");
      return;
    }

    const tags: string[] = [];
    if (newMenu.isVeg) tags.push("veg");
    if (newMenu.isSpicy) tags.push("spicy");

    const fullItem: MenuItem = {
      name: newMenu.name.trim(),
      price: newMenu.price,
      description: newMenu.description.trim() || "Prepared meticulously using choice premium ingredients and traditional spices.",
      tags,
    };

    setRestaurantForm((prev: any) => ({
      ...prev,
      menuItems: [...prev.menuItems, fullItem],
    }));

    // Reset local inputs
    setNewMenu({ name: "", price: 0, description: "", isVeg: true, isSpicy: false });
  };

  const handleRemoveMenuRow = (idx: number) => {
    const updated = [...restaurantForm.menuItems];
    updated.splice(idx, 1);
    setRestaurantForm((prev: any) => ({
      ...prev,
      menuItems: updated,
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal headers */}
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-black text-slate-930 text-slate-950 uppercase">
            {editingId ? "Edit Partner Restaurant" : "Onboard Your Restaurant"}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 font-semibold">
            Simple details is all it takes. Enter your cuisine, location, address option and optional menu items.
          </p>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-xs font-semibold text-red-650 text-red-650 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-5">
          {/* Main Info Side by Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Restaurant Name *</label>
              <input
                type="text"
                required
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm((prev: any) => ({ ...prev, name: e.target.value }))}
                placeholder="E.g. Nizam Mughlai Kitchen"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Culinary Specialty *</label>
              <input
                type="text"
                required
                value={restaurantForm.cuisineType}
                onChange={(e) => setRestaurantForm((prev: any) => ({ ...prev, cuisineType: e.target.value }))}
                placeholder="E.g. Traditional, South Indian, Biryani"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1 relative">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block flex justify-between">
                  <span>Indian City / Location *</span>
                  <span className="text-[9px] text-slate-400 italic font-semibold">(Search or type manually)</span>
                </label>
                <input
                  type="text"
                  required
                  value={searchText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchText(val);
                    setShowSuggestions(true);
                    
                    // Instantly sync value to parent form structure
                    const coords = CITIES_COORDINATES[val] || { lat: 12.9716, lng: 77.5946 };
                    setRestaurantForm((prev: any) => ({
                      ...prev,
                      locationName: val,
                      latitude: coords.lat,
                      longitude: coords.lng,
                    }));

                    // Try to auto-derive state if standard
                    const sInfo = findStateForCity(val);
                    if (sInfo && sInfo.state !== "All India") {
                      setSelectedState(sInfo.state);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Type location (e.g., Indiranagar, Koramangala)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white transition text-slate-800"
                />

                {showSuggestions && searchText.trim() !== "" && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {(() => {
                      const q = searchText.toLowerCase().trim();
                      const matched: { name: string; state: string }[] = [];
                      INDIA_STATES_AND_CITIES.forEach((s) => {
                        s.cities.forEach((c) => {
                          if (c.name.toLowerCase().includes(q)) {
                            matched.push({ name: c.name, state: s.name });
                          }
                        });
                      });

                      if (matched.length === 0) {
                        return (
                          <div className="p-2.5 text-[11px] text-slate-400 italic">
                            No match found. Free-form text will be used.
                          </div>
                        );
                      }

                      return matched.slice(0, 8).map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() => {
                            setSearchText(city.name);
                            setSelectedState(city.state);
                            const coords = CITIES_COORDINATES[city.name] || { lat: 12.9716, lng: 77.5946 };
                            setRestaurantForm((prev: any) => ({
                              ...prev,
                              locationName: city.name,
                              latitude: coords.lat,
                              longitude: coords.lng,
                            }));
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center cursor-pointer"
                        >
                          <span>{city.name}</span>
                          <span className="text-[9px] text-orange-600 bg-orange-50 font-black px-1 py-0.5 rounded uppercase tracking-wider">
                            {city.state}
                          </span>
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Indian State / UT (Linked)</label>
                <input
                  type="text"
                  disabled
                  value={selectedState}
                  placeholder="Auto-detected from city search"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block flex justify-between">
                <span>Display Cover Image</span>
                <span className="text-[9px] text-slate-400 italic font-semibold">(Select preset or paste URL)</span>
              </label>
              <input
                type="text"
                value={restaurantForm.imageUrl}
                onChange={(e) => setRestaurantForm((prev: any) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="Select a preset below or paste image link..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
              />
              {/* Beautiful Preset Grid Selection */}
              <div className="pt-1.5">
                <span className="text-[9px] font-bold text-slate-400 block mb-1">Interactive Cover Presets:</span>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { name: "Tandoori", url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600" },
                    { name: "Biryani", url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600" },
                    { name: "Dosa", url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600" },
                    { name: "Curry / Veg", url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600" },
                    { name: "Snacks", url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600" }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setRestaurantForm((prev: any) => ({ ...prev, imageUrl: preset.url }))}
                      className={`relative h-11 rounded-lg overflow-hidden border-2 transition text-left cursor-pointer ${
                        restaurantForm.imageUrl === preset.url ? "border-orange-500 scale-[1.03] shadow" : "border-slate-200 hover:border-slate-300"
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center p-0.5">
                        <span className="text-[8px] font-black text-white leading-none text-center truncate w-full filter drop-shadow">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Simple optional physical address, website, and WhatsApp phone number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Physical Address *</label>
              <input
                type="text"
                required
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm((prev: any) => ({ ...prev, address: e.target.value }))}
                placeholder="E.g. MG Road, Secunderabad"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block flex justify-between">
                <span>Website URL</span>
                <span className="text-[9px] text-slate-400 italic font-semibold">(Optional)</span>
              </label>
              <input
                type="text"
                value={restaurantForm.websiteUrl}
                onChange={(e) => setRestaurantForm((prev: any) => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="E.g. www.mymughlai.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block flex justify-between">
                <span>WhatsApp Order Number</span>
                <span className="text-[9px] text-slate-400 italic font-semibold">(e.g. 919876543210)</span>
              </label>
              <input
                type="text"
                value={restaurantForm.whatsappNumber || ""}
                onChange={(e) => setRestaurantForm((prev: any) => ({ ...prev, whatsappNumber: e.target.value.replace(/[^0-9]/g, "") }))}
                placeholder="E.g. 919876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Specialities menu builder sub-panel */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Quick Specialty Menu Items</h4>
              <span className="text-[10px] text-slate-400 italic">Dishes show on your partner card</span>
            </div>

            {/* Quick adding row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 item-center">
              <div>
                <input
                  type="text"
                  placeholder="Dish Name (e.g. Garlic Naan)"
                  value={newMenu.name}
                  onChange={(e) => setNewMenu((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-2 text-xs font-semibold rounded-lg focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Price in ₹"
                  value={newMenu.price || ""}
                  onChange={(e) => setNewMenu((prev) => ({ ...prev, price: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-full bg-white border border-slate-200 p-2 text-xs font-semibold rounded-lg focus:border-orange-500 outline-none"
                />
              </div>

              {/* Instant classification tags toggles */}
              <div className="flex gap-1.5 h-full">
                <button
                  type="button"
                  onClick={() => setNewMenu((prev) => ({ ...prev, isVeg: !prev.isVeg }))}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition ${
                    newMenu.isVeg
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-slate-250 text-green-700"
                  }`}
                >
                  🟢 Veg
                </button>
                <button
                  type="button"
                  onClick={() => setNewMenu((prev) => ({ ...prev, isSpicy: !prev.isSpicy }))}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition ${
                    newMenu.isSpicy
                      ? "bg-red-650 bg-red-600 border-red-650 text-white"
                      : "bg-white border-slate-250 text-red-650"
                  }`}
                >
                  🌶️ Spicy
                </button>
              </div>
            </div>

            {/* Optional Description field */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Optional Dish description (e.g. golden wheat flour naan with garlic glaze)"
                value={newMenu.description}
                onChange={(e) => setNewMenu((prev) => ({ ...prev, description: e.target.value }))}
                className="flex-1 bg-white border border-slate-200 p-2 text-xs font-semibold rounded-lg focus:border-orange-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddMenuRow}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-orange-500" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Currently added specialty list scroll box */}
            {restaurantForm.menuItems.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-200/60 max-h-[140px] overflow-y-auto">
                {restaurantForm.menuItems.map((item, mIdx) => (
                  <div
                    key={mIdx}
                    className="bg-white border border-slate-100 p-2 px-3 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate font-semibold">
                      <span className={`w-2 h-2 rounded-full ${item.tags.includes("veg") ? "bg-green-600" : "bg-red-650 bg-red-600"}`} />
                      <span className="font-bold text-slate-800 truncate">{item.name}</span>
                      <span className="text-[9px] text-slate-400 capitalize">({item.tags.join(", ")})</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-slate-700">₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMenuRow(mIdx)}
                        className="p-1 hover:bg-red-55 hover:bg-red-50 text-red-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core submission button alignments */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 active:scale-[0.99] text-white font-extrabold rounded-xl transition text-center uppercase tracking-wider text-xs md:text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Broadcast Listing Details</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition text-center uppercase tracking-wider text-xs md:text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
