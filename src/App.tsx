import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  LogIn,
  LogOut,
  Plus,
  X,
  Utensils,
  AlertCircle,
  ShieldCheck,
  Compass,
  Sparkles
} from "lucide-react";
import { Restaurant, MenuItem, Review, UserSession } from "./types";
import AIAssistant from "./components/AIAssistant";
import RestaurantCard from "./components/RestaurantCard";
import RestaurantDetailModal from "./components/RestaurantDetailModal";
import RestaurantFormModal from "./components/RestaurantFormModal";
import SpecialDishCard from "./components/SpecialDishCard";
import InteractiveMap from "./components/InteractiveMap";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

import {
  INDIA_STATES_AND_CITIES,
  CITIES_COORDINATES,
  ALL_INDIAN_CITIES,
  findStateForCity
} from "./utils/indiaData";

// Helper to calculate distance in km using Haversine formula
export const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

export default function App() {
  // Core dataset states
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<UserSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedCity, setSelectedCity] = useState("All");
  const [locationInput, setLocationInput] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");
  const [displayMode, setDisplayMode] = useState<"dishes" | "restaurants" | "map" | "analytics">("dishes");

  // Shopping Basket (Cart) & Live Tracking States
  const [cart, setCart] = useState<{ [itemName: string]: number }>(() => {
    try {
      const saved = localStorage.getItem("bitefinder_cart");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeCartRestaurant, setActiveCartRestaurant] = useState<Restaurant | null>(() => {
    try {
      const saved = localStorage.getItem("bitefinder_cart_restaurant");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    return localStorage.getItem("bitefinder_delivery_address") || "";
  });

  const [customWhatsAppNumber, setCustomWhatsAppNumber] = useState(() => {
    return localStorage.getItem("bitefinder_custom_whatsapp") || "";
  });

  const [activeTracker, setActiveTracker] = useState<{
    restaurantName: string;
    whatsappNumber: string;
    totalAmount: number;
    itemsSummary: string;
    step: number; // 0, 1, 2, 3
    eta: number;
    timestamp: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("bitefinder_active_tracker");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Local Storage synchronizers to absolutely protect against data loss on page refresh
  useEffect(() => {
    localStorage.setItem("bitefinder_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (activeCartRestaurant) {
      localStorage.setItem("bitefinder_cart_restaurant", JSON.stringify(activeCartRestaurant));
    } else {
      localStorage.removeItem("bitefinder_cart_restaurant");
    }
  }, [activeCartRestaurant]);

  useEffect(() => {
    localStorage.setItem("bitefinder_delivery_address", deliveryAddress);
  }, [deliveryAddress]);

  useEffect(() => {
    localStorage.setItem("bitefinder_custom_whatsapp", customWhatsAppNumber);
  }, [customWhatsAppNumber]);

  useEffect(() => {
    if (activeTracker) {
      localStorage.setItem("bitefinder_active_tracker", JSON.stringify(activeTracker));
    } else {
      localStorage.removeItem("bitefinder_active_tracker");
    }
  }, [activeTracker]);

  // Live progress simulation of courier advancing every 12 seconds
  useEffect(() => {
    if (!activeTracker) return;
    if (activeTracker.step >= 3) return;

    const interval = setInterval(() => {
      setActiveTracker((prev) => {
        if (!prev) return null;
        if (prev.step >= 3) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          step: prev.step + 1,
          eta: Math.max(0, prev.eta - 6),
        };
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [activeTracker]);

  const handleAddToCartWithCheck = (restaurant: Restaurant, itemName: string, price: number) => {
    if (activeCartRestaurant && activeCartRestaurant.id !== restaurant.id) {
      if (window.confirm(`Your current cart contains items from "${activeCartRestaurant.name}". Start a fresh billing order from "${restaurant.name}" instead?`)) {
        setCart({ [itemName]: 1 });
        setActiveCartRestaurant(restaurant);
      }
    } else {
      if (!activeCartRestaurant) {
        setActiveCartRestaurant(restaurant);
      }
      setCart((prev) => ({ ...prev, [itemName]: (prev[itemName] || 0) + 1 }));
    }
  };

  const handleRemoveFromCart = (itemName: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[itemName] && updated[itemName] > 1) {
        updated[itemName] -= 1;
      } else {
        delete updated[itemName];
      }
      // If empty completely, unbind restaurant
      if (Object.keys(updated).length === 0) {
        setActiveCartRestaurant(null);
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart({});
    setActiveCartRestaurant(null);
  };

  // Derive simulated customer areas dynamically for the selected city
  const getDynamicCustomerAreas = () => {
    const targetCityName = selectedCity !== "All" ? selectedCity : "Indiranagar";
    const coords = CITIES_COORDINATES[targetCityName] || { lat: 12.9716, lng: 77.5946 };
    return [
      { name: `${targetCityName} Central (Primary Hub)`, latitude: coords.lat, longitude: coords.lng, city: targetCityName },
      { name: `${targetCityName} Suburban (Modern Sector)`, latitude: coords.lat + 0.005, longitude: coords.lng - 0.004, city: targetCityName },
      { name: `${targetCityName} Bypass (Outer Circle)`, latitude: coords.lat - 0.006, longitude: coords.lng + 0.007, city: targetCityName },
      { name: `${targetCityName} Greater Belt (Highlands)`, latitude: coords.lat + 0.011, longitude: coords.lng + 0.008, city: targetCityName }
    ];
  };

  const currentCustomerAreas = getDynamicCustomerAreas();

  // Geospatial Geolocation states
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<number | "All">("All");
  const [selectedAreaName, setSelectedAreaName] = useState<string>("Not Set");
  const [showActiveAreaSuggestions, setShowActiveAreaSuggestions] = useState(false);

  // Focus detail modal states
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [reviewForm, setReviewForm] = useState({ userName: "", rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Onboarding creation state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    cuisineType: "",
    locationName: "Indiranagar",
    address: "",
    websiteUrl: "",
    imageUrl: "",
    latitude: 12.9716,
    longitude: 77.5946,
    menuItems: [] as MenuItem[]
  });

  // Auth/Partner Session States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const fetchRestaurantsFallback = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      setRestaurants(data);
    } catch (e) {
      console.error("Manual fetch fallback failed:", e);
    }
  };

  // Keep detail views synchronized in real-time when the master restaurants state updates
  useEffect(() => {
    if (selectedRestaurant) {
      const fresh = restaurants.find((r) => r.id === selectedRestaurant.id);
      if (fresh) {
        // Prevent infinite re-render loops by only setting is anything actually changed
        if (JSON.stringify(fresh) !== JSON.stringify(selectedRestaurant)) {
          setSelectedRestaurant(fresh);
        }
      }
    }
  }, [restaurants, selectedRestaurant]);

  // Server Sent Events Connection for Real-time Synchronization with Robust Polling Fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: any = null;
    let isUsingPolling = false;

    const startPollingFallback = () => {
      if (isUsingPolling) return;
      isUsingPolling = true;

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      console.log("Switching to standard fallback polling to prevent endless connection retries.");
      fetchRestaurantsFallback();
      pollInterval = setInterval(fetchRestaurantsFallback, 10000); // Poll every 10 seconds
    };

    // Attempt to connect via SSE
    try {
      eventSource = new EventSource("/api/updates");

      eventSource.onmessage = (event) => {
        try {
          const received = JSON.parse(event.data);
          setRestaurants(received);
        } catch (err) {
          console.error("SSE parsing failed", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("SSE connection error; closing stream and activating fallback polling.", err);
        startPollingFallback();
      };
    } catch (e) {
      console.error("Failed to initialize server-sent events, using fallback polling", e);
      startPollingFallback();
    }

    // Auto load session
    const activeSession = localStorage.getItem("bitefinder_session");
    if (activeSession) {
      try {
        setUser(JSON.parse(activeSession));
      } catch (e) {}
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  // Helper to find the nearest city list item to given coordinates
  const findNearestCity = (lat: number, lng: number) => {
    let minDistance = Infinity;
    let nearestCity = "Bengaluru (Central)";
    let nearestState = "Karnataka";
    
    INDIA_STATES_AND_CITIES.forEach((s) => {
      s.cities.forEach((c) => {
        const dist = getDistanceInKm(lat, lng, c.latitude, c.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestCity = c.name;
          nearestState = s.name;
        }
      });
    });
    return { city: nearestCity, state: nearestState, distance: minDistance };
  };

  // Request precise GPS location
  const handleScanLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser software.");
      return;
    }

    setLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({
          latitude: lat,
          longitude: lng
        });

        // Calculate and suggest nearest city
        const nearest = findNearestCity(lat, lng);
        setSelectedAreaName(`${nearest.city} (GPS Located)`);
        setSelectedCity(nearest.city);
        setLocationInput(nearest.city);
        setSelectedState(nearest.state);

        setLocating(false);
      },
      (err) => {
        console.warn("GPS lock denied", err);
        setGpsError("Could not calculate precise GPS coordination. Try suggestion city chips.");
        setLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Login & Registration authentication handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authForm.email || !authForm.password) {
      setAuthError("Email and password inputs are required.");
      return;
    }

    try {
      if (authMode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authForm.email, password: authForm.password })
        });
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
          localStorage.setItem("bitefinder_session", JSON.stringify(data.user));
          setAuthSuccess(`Welcome, ${data.user.name}!`);
          setTimeout(() => {
            setIsAuthOpen(false);
            setAuthForm({ email: "", password: "", name: "" });
            setAuthSuccess("");
          }, 1000);
        } else {
          setAuthError(data.error || "Credentials invalid. Check inputs.");
        }
      } else {
        // Register mode
        if (!authForm.name) {
          setAuthError("Owner Full Name is required to register.");
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
            name: authForm.name
          })
        });
        const data = await res.json();

        if (res.ok) {
          setAuthSuccess("Partner registered! Switching to enter credentials...");
          setTimeout(() => {
            setAuthMode("login");
            setAuthSuccess("");
          }, 1500);
        } else {
          setAuthError(data.error || "Registration rejected.");
        }
      }
    } catch (err) {
      setAuthError("Error reaching certification host.");
    }
  };

  // Log Out partner session
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("bitefinder_session");
    setIsFormOpen(false);
  };

  // Open detail panel (increments metric views asynchronously)
  const handleOpenRestaurant = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      await fetch(`/api/restaurants/${restaurant.id}/increment-views`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  // Submit fresh review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess(false);

    if (!reviewForm.userName || !reviewForm.comment) {
      setReviewError("Please include your name and a comment.");
      return;
    }

    if (!selectedRestaurant) return;

    try {
      const res = await fetch(`/api/restaurants/${selectedRestaurant.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm)
      });
      const data = await res.json();

      if (res.ok) {
        setReviewSuccess(true);
        setReviewForm({ userName: "", rating: 5, comment: "" });
        setSelectedRestaurant(data.restaurant);
        setTimeout(() => setReviewSuccess(false), 2000);
      } else {
        setReviewError(data.error || "Submission failed.");
      }
    } catch (err) {
      setReviewError("Could not post review.");
    }
  };

  // Delete listing (Owners/Admin only)
  const handleDeleteRestaurant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm("Do you want to permanently remove this hospitality listing?")) return;

    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": user.role,
          "x-user-email": user.email
        }
      });
      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
        if (selectedRestaurant?.id === id) {
          setSelectedRestaurant(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Delete action rejected.");
      }
    } catch (err) {
      alert("Error calling server deletion.");
    }
  };

  // Set edit form input values
  const handleEditRestaurant = (restaurant: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(restaurant.id);
    setRestaurantForm({
      name: restaurant.name,
      cuisineType: restaurant.cuisineType,
      locationName: restaurant.locationName,
      address: restaurant.address,
      websiteUrl: restaurant.websiteUrl,
      imageUrl: restaurant.imageUrl,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      menuItems: [...restaurant.menuItems]
    });
    setIsFormOpen(true);
  };

  // Open onboarding form
  const handleOpenCreateForm = () => {
    setEditingId(null);
    setRestaurantForm({
      name: "",
      cuisineType: "",
      locationName: "Indiranagar",
      address: "",
      websiteUrl: "",
      imageUrl: "",
      latitude: 12.9716,
      longitude: 77.5946,
      menuItems: []
    });
    setFormError("");
    setIsFormOpen(true);
  };

  // Create or Update submit handler
  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!restaurantForm.name || !restaurantForm.cuisineType || !restaurantForm.address) {
      setFormError("Basic Name, Cuisine, and Physical Address details are required.");
      return;
    }

    if (!user) return;

    const url = editingId ? `/api/restaurants/${editingId}` : "/api/restaurants";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-user-email": user.email
        },
        body: JSON.stringify(restaurantForm)
      });
      const data = await res.json();

      if (res.ok) {
        if (editingId) {
          setRestaurants((prev) => prev.map((r) => r.id === editingId ? data.restaurant : r));
        } else {
          setRestaurants((prev) => [...prev, data.restaurant]);
        }
        if (selectedRestaurant?.id === (editingId || data.restaurant.id)) {
          setSelectedRestaurant(data.restaurant);
        }
        setIsFormOpen(false);
        setEditingId(null);
      } else {
        setFormError(data.error || "Save rejected.");
      }
    } catch (err) {
      setFormError("Communication failure to backend.");
    }
  };

  // Filter restaurants logic
  const filtered = restaurants.filter((res) => {
    // Typing location filter match
    if (locationInput.trim() !== "") {
      const q = locationInput.toLowerCase().trim();
      const { state: resState } = findStateForCity(res.locationName);
      const matchesCity = res.locationName.toLowerCase().includes(q);
      const matchesState = resState.toLowerCase().includes(q);
      const matchesAddress = res.address ? res.address.toLowerCase().includes(q) : false;
      if (!matchesCity && !matchesState && !matchesAddress) {
        return false;
      }
    } else {
      // State filter match
      if (selectedState !== "All") {
        const { state: resState } = findStateForCity(res.locationName);
        if (resState !== selectedState) {
          return false;
        }
      }

      // City filter match
      if (selectedCity !== "All" && res.locationName.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
    }

    // Proximity radius filter (5 km or 10 km live coordinates checks)
    if (userLocation && distanceFilter !== "All") {
      const distance = getDistanceInKm(userLocation.latitude, userLocation.longitude, res.latitude, res.longitude);
      if (distance > Number(distanceFilter)) {
        return false;
      }
    }

    // Keyword search match
    const keywords = searchQuery.toLowerCase().trim();
    if (keywords) {
      const matchesSearch =
        res.name.toLowerCase().includes(keywords) ||
        res.cuisineType.toLowerCase().includes(keywords) ||
        res.address.toLowerCase().includes(keywords) ||
        res.locationName.toLowerCase().includes(keywords) ||
        res.menuItems.some((item) => item.name.toLowerCase().includes(keywords)) ||
        res.menuItems.some((item) => item.description.toLowerCase().includes(keywords));

      if (!matchesSearch) return false;
    }

    // Vegan filter selection
    if (selectedTag === "Veg Only" && !res.menuItems.some((item) => item.tags.includes("veg"))) {
      return false;
    }

    // Spicy filter selection
    if (selectedTag === "Spicy Only" && !res.menuItems.some((item) => item.tags.includes("spicy"))) {
      return false;
    }

    return true;
  });

  // Calculate Distance sorted lists
  const getSortedList = () => {
    if (!userLocation) return filtered;
    
    return [...filtered].sort((a, b) => {
      const distA = getDistanceInKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
      const distB = getDistanceInKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  };

  const finalRestaurantsList = getSortedList();
  const popularCities = ["All", "Basavanagudi", "Indiranagar", "Koramangala", "Jayanagar", "Whitefield", "HSR Layout", "MG Road", "Malleshwaram", "Sadashivanagar", "Marathahalli", "Electronic City", "JP Nagar"];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden antialiased" id="app-viewport">
      {/* Pristine Minimalist Top Header */}
      <nav className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40" id="main-nav">
        <div className="flex items-center gap-2">
          {/* Brand Icon */}
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-orange-500/20">RN</div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 block select-none">
            Restaurant <span className="text-orange-600">Near Me</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl py-1 px-1.5 pl-3.5 shadow-md">
              <span className="text-xs font-bold leading-none hidden sm:inline-block">
                {user.role === "admin" ? (
                  <span className="text-orange-400 font-extrabold text-[9px] uppercase tracking-wider block mb-0.5">Administrator</span>
                ) : (
                  <span className="text-green-400 font-extrabold text-[9px] uppercase tracking-wider block mb-0.5">Registered Owner</span>
                )}
                {user.name}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleOpenCreateForm}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-500 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard Spot</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title="Logout Partner Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setAuthSuccess("");
                setIsAuthOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs tracking-wider transition cursor-pointer"
              id="partner-login-btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>PARTNER LOGIN</span>
            </button>
          )}
        </div>
      </nav>

      {/* Hero Welcome Banner */}
      <header className="bg-white border-b border-slate-100 py-10 px-6 md:px-12" id="hero-banner">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 block">
              Find your favorite food near you
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-950 font-serif tracking-tight leading-tight">
              Restaurant Near Me
            </h1>
            <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-xl">
              Find favourite food and restaurants near me. Easily search special dishes, explore menus, and calculate real-time distances to top-rated spots.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-start gap-1 max-w-xs shrink-0 text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Distance Calculations</span>
            <p className="text-xs font-semibold text-slate-700 leading-tight">
              {userLocation
                ? `Position active: (${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)})`
                : "Select an area below to filter within 5 to 10 km."}
            </p>
            {userLocation && (
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                📍 {selectedAreaName === "Device" ? "Precise GPS Coordinates" : selectedAreaName}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard discovery controls & listings workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-6">

        {/* Dynamic Display Switcher Tab controls */}
        <div className="flex bg-slate-100 border border-slate-200/60 p-1.5 rounded-2xl gap-1.5 shadow-sm max-w-2xl mx-auto w-full" id="navigation-tab-switcher">
          {[
            { id: "dishes", label: "🍲 Signature Specialties", icon: "🍛" },
            { id: "restaurants", label: "🏢 Partner Kitchens", icon: "🏪" },
            { id: "map", label: "📍 Live Routing Map", icon: "🗺️" },
            { id: "analytics", label: "📊 Trends Analytics", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDisplayMode(tab.id as any)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-150 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                displayMode === tab.id
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-205 hover:bg-slate-200/50"
              }`}
            >
              <span className="text-xs sm:text-sm">{tab.icon}</span>
              <span>{tab.label.split(" ").slice(1).join(" ")}</span>
            </button>
          ))}
        </div>

        {/* 1. Partner Dashboard Section (only rendered if user is validated) */}
        {user && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-xl border border-slate-800 text-left" id="partner-workspace-dashboard">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5 border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-orange-600 rounded-full text-[9px] font-black uppercase tracking-wider text-white">
                    {user.role === "admin" ? "👑 Super Admin" : "🍳 Claimed Owner Hub"}
                  </span>
                  <span className="text-[10px] text-green-400 font-mono animate-pulse font-bold uppercase tracking-wider">● Live Database Connected</span>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-white">
                  {user.role === "admin" ? "Administrative Central Command" : `Kitchen Workspace Panel`}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {user.role === "admin" 
                    ? "Logged in as fm7248154@gmail.com. You have unlimited Super Admin authorization to Add, Edit, or Delete any restaurant on this platform." 
                    : `Registered Owner: ${user.name} (${user.email}). Onboard and manage your unique restaurant details and specialties below.`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleOpenCreateForm}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md shadow-orange-700/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Onboard Indian Outlet
                </button>
              </div>
            </div>

            {user.role === "admin" ? (
              // ADMIN INTERFACE
              <div className="space-y-5">
                {/* Statistics panel */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Total Outlets</span>
                    <span className="text-2xl font-black text-white mt-1 block">{restaurants.length}</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Signature Dishes</span>
                    <span className="text-2xl font-black text-white mt-1 block">
                      {restaurants.reduce((acc, r) => acc + (r.menuItems?.length || 0), 0)}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Customer Reviews</span>
                    <span className="text-2xl font-black text-white mt-1 block">
                      {restaurants.reduce((acc, r) => acc + (r.reviews?.length || 0), 0)}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Platform Views</span>
                    <span className="text-2xl font-black text-white mt-1 block font-mono">
                      {restaurants.reduce((acc, r) => acc + (r.viewCount || 0), 0)}
                    </span>
                  </div>
                </div>

                {/* Database Quick Table list */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Master Directory list ({restaurants.length})</span>
                    <span className="text-[9px] uppercase font-bold text-orange-400 tracking-widest bg-orange-950/50 px-2 py-0.5 rounded border border-orange-900/40">Super powers active</span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 pr-4">Kitchen Name</th>
                        <th className="py-2.5 pr-4">City Location</th>
                        <th className="py-2.5 pr-4">Cuisine Style</th>
                        <th className="py-2.5 pr-4">Registered Owner Email</th>
                        <th className="py-2.5 pr-4">Popular Menu</th>
                        <th className="py-2.5 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {restaurants.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-900/30 text-slate-300">
                          <td className="py-2.5 font-bold pr-4 text-white hover:text-orange-400 cursor-pointer" onClick={() => handleOpenRestaurant(res)}>{res.name}</td>
                          <td className="py-2.5 pr-4 font-semibold text-slate-400">{res.locationName}</td>
                          <td className="py-2.5 pr-4 font-medium text-amber-500">{res.cuisineType}</td>
                          <td className="py-2.5 pr-4 font-mono text-[10px] text-slate-400">{res.ownerEmail}</td>
                          <td className="py-2.5 pr-4 font-bold text-slate-400">{res.menuItems?.length || 0} dishes</td>
                          <td className="py-2.5 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => handleEditRestaurant(res, e)}
                                className="px-2 py-1 bg-slate-800 text-orange-400 hover:text-orange-300 font-bold text-[10px] uppercase tracking-wider rounded transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDeleteRestaurant(res.id, e)}
                                className="px-2 py-1 bg-red-950/40 border border-red-900/60 text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-wider rounded transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // RESTAURANT OWNER DASHBOARD
              <div className="space-y-4">
                {(() => {
                  const mySpots = restaurants.filter(r => r.ownerEmail === user.email.toLowerCase());
                  if (mySpots.length === 0) {
                    return (
                      <div className="bg-slate-950/50 p-6 rounded-2xl border border-dashed border-slate-800 text-center space-y-4">
                        <span className="text-3xl block">🍲</span>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">No Claimed Kitchen Outlets Registered</h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                            Let's register and onboard your restaurant details! List your cooking style, physical location coord options, signature dish specialties and instantly connect with food searchers.
                          </p>
                        </div>
                        <button
                          onClick={handleOpenCreateForm}
                          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-90 text-white font-extrabold uppercase text-[10px] tracking-widest rounded-xl transition cursor-pointer"
                        >
                          Register Your Kitchen details Now →
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Claimed/Registered Indian Partnerships ({mySpots.length})</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mySpots.map((res) => (
                          <div key={res.id} className="bg-slate-950/55 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-orange-400 tracking-widest bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900/30">{res.cuisineType} • {res.locationName}</span>
                                  <h4 className="text-base font-bold text-white mt-2 hover:text-orange-400 cursor-pointer" onClick={() => handleOpenRestaurant(res)}>{res.name}</h4>
                                </div>
                                <span className="bg-slate-800 text-amber-400 text-xs px-2.5 py-0.5 rounded-lg border border-slate-700 font-bold shrink-0">
                                  ★ {res.rating}
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">📍 {res.address}</p>
                              
                              {/* Metrics */}
                              <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>👁️ {res.viewCount} views</span>
                                <span>🍛 {res.menuItems?.length || 0} dishes</span>
                                <span>💬 {res.reviews?.length || 0} Reviews</span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4 mt-4 border-t border-slate-800/60 justify-between items-center">
                              <button
                                onClick={() => handleOpenRestaurant(res)}
                                className="text-orange-400 hover:text-orange-300 hover:underline font-extrabold text-[11px] uppercase tracking-wider"
                              >
                                View Live Menu →
                              </button>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={(e) => handleEditRestaurant(res, e)}
                                  className="px-2.5 py-1.5 bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition hover:bg-slate-750"
                                >
                                  ✏️ Edit Outlet / Dishes
                                </button>
                                <button
                                  onClick={(e) => handleDeleteRestaurant(res.id, e)}
                                  className="px-2.5 py-1.5 bg-red-950/40 border border-red-900/30 text-red-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition hover:bg-red-900/30"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 2. Interactive Location Selection & Proximity Radius Control */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-left relative overflow-hidden" id="proximity-tracker-panel">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 animate-bounce" /> Location & Area Proximity Tracker
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {userLocation 
                  ? `Currently Searching Near ${selectedAreaName === "Device" ? "Your Precise Coordinates" : selectedAreaName}` 
                  : "Choose Your Location / Area to Active Real Distance Filters"
                }
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {userLocation 
                  ? `Active Coordinates: (${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}) • Distance calculations are live.` 
                  : "Share your terminal device coordinates or select a simulated local area in India to see live distances & filter."
                }
              </p>
            </div>

            {/* Selector Choices */}
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handleScanLocation}
                disabled={locating}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:bg-slate-300 transition flex items-center gap-1 cursor-pointer"
              >
                {locating ? "Acquiring GPS..." : "🎯 Use Device GPS"}
              </button>
              
              <div className="relative min-w-[240px]">
                <input
                  type="text"
                  value={selectedAreaName === "Not Set" ? "" : selectedAreaName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAreaName(val);
                    setShowActiveAreaSuggestions(true);
                    
                    if (val.trim() === "") {
                      setUserLocation(null);
                      setDistanceFilter("All");
                    } else {
                      // Dynamically filter results as they type
                      setLocationInput(val);
                      // Try matching an exact city from expanded list to set live coordinate basis
                      let matchedCity: any = null;
                      for (const s of INDIA_STATES_AND_CITIES) {
                        const found = s.cities.find((c) => c.name.toLowerCase() === val.toLowerCase().trim());
                        if (found) {
                          matchedCity = { ...found, state: s.name };
                          break;
                        }
                      }
                      if (matchedCity) {
                        setUserLocation({ latitude: matchedCity.latitude, longitude: matchedCity.longitude });
                        setSelectedCity(matchedCity.name);
                        const sInfo = findStateForCity(matchedCity.name);
                        setSelectedState(sInfo.state);
                      }
                    }
                  }}
                  onFocus={() => setShowActiveAreaSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowActiveAreaSuggestions(false), 200)}
                  placeholder="Type Your Search Area / City..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 outline-none focus:border-orange-500 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-405"
                />

                {showActiveAreaSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {(() => {
                      const q = (selectedAreaName === "Not Set" ? "" : selectedAreaName).toLowerCase().trim();
                      const matched: { name: string; state: string; lat: number; lng: number }[] = [];

                      // Scan our extensive dataset
                      INDIA_STATES_AND_CITIES.forEach((s) => {
                        s.cities.forEach((c) => {
                          if (c.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
                            matched.push({ name: c.name, state: s.name, lat: c.latitude, lng: c.longitude });
                          }
                        });
                      });

                      if (matched.length === 0) {
                        return (
                          <div className="p-3 text-[11px] text-slate-400 italic">
                            No match found. Free-form text will match restaurants by address text.
                          </div>
                        );
                      }

                      return matched.slice(0, 5).map((city) => (
                        <button
                          key={`${city.name}-${city.state}`}
                          type="button"
                          onClick={() => {
                            setSelectedAreaName(city.name);
                            setUserLocation({ latitude: city.lat, longitude: city.lng });
                            setSelectedCity(city.name);
                            setLocationInput(city.name);
                            setSelectedState(city.state);
                            setShowActiveAreaSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center cursor-pointer font-sans"
                        >
                          <span className="font-bold text-slate-800">{city.name}</span>
                          <span className="text-[10px] text-orange-600 bg-orange-50 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {city.state}
                          </span>
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Radius Selector segment tab */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-1">Proximity search:</span>
              <div className="flex bg-slate-50 border border-slate-150 p-0.5 rounded-xl gap-1">
                {[
                  { label: "All Districts", value: "All" },
                  { label: "< 5 km (Very Near)", value: 5 },
                  { label: "< 10 km (Nearby)", value: 10 },
                  { label: "< 25 km (City Zone)", value: 25 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      if (!userLocation) {
                        alert("Please select a location area or share your GPS first to enable distance filters.");
                        return;
                      }
                      setDistanceFilter(opt.value as any);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      distanceFilter === opt.value
                        ? "bg-orange-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {userLocation ? (
              <span className="text-[9px] text-orange-600 font-extrabold uppercase bg-orange-50 border border-orange-100 px-3 py-1 rounded-lg">
                Searching under {distanceFilter === "All" ? "Unlimited distance" : `${distanceFilter} km radius`}
              </span>
            ) : (
              <span className="text-[9.5px] text-slate-400 font-bold uppercase italic">
                ⚠️ Select simulated area or click GPS to test 5-10km distance radius
              </span>
            )}
          </div>

          {gpsError && (
            <div className="bg-red-50 text-red-650 text-xs font-semibold p-2.5 border border-red-100 rounded-xl mt-2 flex items-center gap-1 text-red-600">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* 3. Unified Search Filters bar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm text-left">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Real Search bar input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find meals or places (e.g., MTR Filter Coffee, Vidyarthi Bhavan Dosa, Toit Pizza, Indiranagar, Koramangala)..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 focus:border-orange-500 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 bg-slate-200 text-slate-500 hover:text-slate-705 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick classifier switch buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTag((prev) => (prev === "Veg Only" ? "All" : "Veg Only"))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition ${
                  selectedTag === "Veg Only"
                    ? "bg-green-600 border-green-650 text-white"
                    : "bg-white border-slate-150 text-green-700 hover:bg-green-50"
                }`}
              >
                Refine: 🟢 Pure Veg
              </button>
              <button
                onClick={() => setSelectedTag((prev) => (prev === "Spicy Only" ? "All" : "Spicy Only"))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition ${
                  selectedTag === "Spicy Only"
                    ? "bg-red-600 border-red-650 text-white"
                    : "bg-white border-slate-150 text-red-650 hover:bg-red-50"
                }`}
              >
                Refine: 🌶️ Spicy Foods
              </button>
            </div>
          </div>

          {/* Interactive Deep India States & Cities Search Box with autocomplete suggestions */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                🔍 Filter by Location (Type City or State name):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocationInput(val);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  placeholder="Type any Indian City, State, or Area (e.g. Indiranagar, Bengaluru, Jayanagar, Mumbai, Delhi)..."
                  className="flex-1 bg-slate-50 border border-slate-200 outline-none focus:border-orange-500 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 placeholder:text-slate-400"
                />
                {locationInput && (
                  <button
                    onClick={() => {
                      setLocationInput("");
                      setSelectedCity("All");
                      setSelectedState("All");
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Suggestions Overlay */}
              {showLocationSuggestions && locationInput.trim() !== "" && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {(() => {
                    const q = locationInput.toLowerCase().trim();
                    const matched: { name: string; state: string; type: "State" | "City" }[] = [];
                    // Match State Names and City Names
                    INDIA_STATES_AND_CITIES.forEach((s) => {
                      if (s.name.toLowerCase().includes(q)) {
                        matched.push({ name: s.name, state: s.name, type: "State" });
                      }
                      s.cities.forEach((c) => {
                        if (c.name.toLowerCase().includes(q)) {
                          matched.push({ name: c.name, state: s.name, type: "City" });
                        }
                      });
                    });

                    if (matched.length === 0) {
                      return (
                        <div className="p-3 text-xs text-slate-400 italic">
                          No exact matching states or cities. Typing query filters listings directly!
                        </div>
                      );
                    }

                    return matched.slice(0, 10).map((loc) => (
                      <button
                        key={`${loc.type}-${loc.name}`}
                        type="button"
                        onClick={() => {
                          setLocationInput(loc.name);
                          if (loc.type === "City") {
                            setSelectedCity(loc.name);
                            setSelectedState(loc.state);
                          } else {
                            setSelectedState(loc.name);
                            setSelectedCity("All");
                          }
                          setShowLocationSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-bold text-slate-800">{loc.name}</span>
                        <span className="text-[10px] text-orange-600 bg-orange-50 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {loc.type === "City" ? `City in ${loc.state}` : "Full State"}
                        </span>
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* City list chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mr-2 select-none">Bengaluru Hubs:</span>
            {popularCities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setSelectedState("Karnataka");
                  setLocationInput(city === "All" ? "" : city);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === city
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {city === "All" ? "📍 All Karnataka" : `${city}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4"></div>

        {/* Directory Listings Grid & Specialty Foods Grid */}
        {(() => {
          if (displayMode === "dishes") {
            // Flatten dishes across hospitals matching our metrics
            const dishList: { item: MenuItem; restaurant: Restaurant }[] = [];
            finalRestaurantsList.forEach((res) => {
              res.menuItems.forEach((item) => {
                // Apply tag filters specifically onto individual dishes
                if (selectedTag === "Veg Only" && !item.tags.includes("veg")) {
                  return;
                }
                if (selectedTag === "Spicy Only" && !item.tags.includes("spicy")) {
                  return;
                }
                
                // Match search keyword
                const kw = searchQuery.toLowerCase().trim();
                if (kw) {
                  const match =
                    item.name.toLowerCase().includes(kw) ||
                    item.description.toLowerCase().includes(kw) ||
                    res.name.toLowerCase().includes(kw) ||
                    res.cuisineType.toLowerCase().includes(kw);
                  if (!match) return;
                }
                dishList.push({ item, restaurant: res });
              });
            });

            if (dishList.length === 0) {
              return (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center space-y-4 shadow-sm flex flex-col justify-center items-center">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">No Signature Specialty Matches</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      We couldn't track down any specific Indian specialties matching "{searchQuery}" under your active location filters.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="specialty-dishes-grid">
                {dishList.map((dish, dIdx) => (
                  <SpecialDishCard
                    key={`${dish.restaurant.id}-${dish.item.name}-${dIdx}`}
                    item={dish.item}
                    restaurant={dish.restaurant}
                    userLocation={userLocation}
                    onExplore={(restaurant) => {
                      handleOpenRestaurant(restaurant);
                    }}
                  />
                ))}
              </div>
            );
          } else if (displayMode === "restaurants") {
            // Standard Restaurant grid view
            if (finalRestaurantsList.length === 0) {
              return (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center space-y-4 shadow-sm flex flex-col justify-center items-center">
                  <div className="w-14 h-14 bg-slate-55 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-base font-bold text-slate-900">No Restaurant Matches</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      No active Indian partner kitchens match "{searchQuery}" under your search parameters. Try clearing words or selecting other cities.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="restaurants-grid">
                {finalRestaurantsList.map((res) => (
                  <RestaurantCard
                    key={res.id}
                    restaurant={res}
                    userLocation={userLocation}
                    user={user}
                    onOpen={handleOpenRestaurant}
                    onEdit={handleEditRestaurant}
                    onDelete={handleDeleteRestaurant}
                  />
                ))}
              </div>
            );
          } else if (displayMode === "map") {
            return (
              <InteractiveMap
                restaurants={finalRestaurantsList}
                userLocation={userLocation}
                onExploreRestaurant={(res) => {
                  handleOpenRestaurant(res);
                }}
                onOpenOrderModal={(res) => {
                  handleOpenRestaurant(res);
                }}
              />
            );
          } else {
            return <AnalyticsDashboard restaurants={restaurants} />;
          }
        })()}

        {/* 4. Active Checkout Cart & Live Tracking Panel */}
        {(Object.keys(cart).length > 0 || activeTracker) && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border border-slate-800 text-left transition-all duration-300 animate-fadeIn" id="cart-tracker-workspace">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              
              {/* Left Column: Active basket content */}
              <div className="lg:col-span-6 space-y-4">
                {Object.keys(cart).length > 0 ? (
                  <>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <div>
                        <span className="px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md">
                          Active Basket
                        </span>
                        <h3 className="text-sm font-black text-white mt-1">
                          🍛 Ordering from {activeCartRestaurant?.name}
                        </h3>
                      </div>
                      <button
                        onClick={handleClearCart}
                        className="text-[10px] text-slate-400 hover:text-red-400 font-extrabold uppercase tracking-wider cursor-pointer"
                      >
                        Reset Cart
                      </button>
                    </div>

                    {/* Basket Items List */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {Object.entries(cart).map(([name, qty]) => {
                        const menuPrice = activeCartRestaurant?.menuItems.find(m => m.name === name)?.price || 150;
                        return (
                          <div key={name} className="flex justify-between items-center text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                            <div>
                              <span className="font-extrabold text-white">{name}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">₹{menuPrice} per serving</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex bg-slate-800 rounded-md overflow-hidden border border-slate-700">
                                <button
                                  onClick={() => handleRemoveFromCart(name)}
                                  className="px-2 py-0.5 text-xs font-bold hover:bg-slate-700 text-slate-400 cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-black self-center">{qty}</span>
                                <button
                                  onClick={() => handleAddToCartWithCheck(activeCartRestaurant!, name, menuPrice)}
                                  className="px-2 py-0.5 text-xs font-bold hover:bg-slate-700 text-slate-400 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-bold text-orange-400 min-w-[50px] text-right font-mono">
                                ₹{menuPrice * Number(qty)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Basket Aggregation Summary Pricing */}
                    {(() => {
                      const totalSum = Object.entries(cart).reduce((sum, [name, qty]) => {
                        const menuPrice = activeCartRestaurant?.menuItems.find(m => m.name === name)?.price || 150;
                        return sum + (menuPrice * Number(qty));
                      }, 0);

                      const summaryDetails = Object.entries(cart).map(([name, qty]) => `${qty}x ${name}`).join(", ");
                      const prefilledWhatsapp = activeCartRestaurant?.whatsappNumber || "+919876543210";

                      // Build the dispatch link text
                      const draftMsg = `*🍛 NEW SEAMLESS FOOD OUTLET ORDER*
*Partner Kitchen:* ${activeCartRestaurant?.name}
*City Location:* ${activeCartRestaurant?.locationName}
--------------------------
*Items Ordered:*
${Object.entries(cart).map(([name, qty]) => {
  const itemPrice = activeCartRestaurant?.menuItems.find(m => m.name === name)?.price || 150;
  return `• ${name} (Qty: ${qty}) - ₹${itemPrice * Number(qty)}`;
}).join("\n")}
--------------------------
*Total Basket Price:* ₹${totalSum}
*Customer Delivery Address:* ${deliveryAddress || "Not specified yet"}
${userLocation ? `*Routing Coordinates Place:* (Latitude: ${userLocation.latitude.toFixed(4)}, Longitude: ${userLocation.longitude.toFixed(4)})` : ""}

Please confirm this order dispatch immediately! Thank you.`;

                      const dispatchLink = `https://wa.me/${prefilledWhatsapp.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(draftMsg)}`;

                      return (
                        <div className="space-y-3 pt-2">
                          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 space-y-2.5">
                            <div>
                              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                                📍 Delivery Destination Location (Protects from loss on refresh):
                              </label>
                              <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Write down your delivery address / street details here..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-xs font-semibold text-white outline-none focus:border-orange-500 placeholder:text-slate-500 text-left"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                                📞 Owner Whatsapp Number (Pre-filled):
                              </label>
                              <input
                                type="text"
                                value={prefilledWhatsapp}
                                readOnly
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-400 outline-none select-none cursor-not-allowed text-left"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-sm pt-1">
                            <span className="font-extrabold text-slate-400">Grand Total:</span>
                            <span className="text-xl font-black text-orange-400 font-mono">₹{totalSum}</span>
                          </div>

                          <div className="pt-1">
                            {/* Native anchor checkout links bypassing CORS and iframe popup limitations */}
                            <a
                              href={dispatchLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                const totalVal = Object.entries(cart).reduce((sum, [name, qty]) => {
                                  const menuPrice = activeCartRestaurant?.menuItems.find(m => m.name === name)?.price || 150;
                                  return sum + (menuPrice * Number(qty));
                                }, 0);
                                const summary = Object.entries(cart).map(([name, qty]) => `${qty}x ${name}`).join(", ");

                                setActiveTracker({
                                  restaurantName: activeCartRestaurant?.name || "Kitchen Hub",
                                  whatsappNumber: activeCartRestaurant?.whatsappNumber || "+919876543210",
                                  totalAmount: totalVal,
                                  itemsSummary: summary,
                                  step: 0,
                                  eta: 25,
                                  timestamp: Date.now(),
                                });

                                handleClearCart(); // Reset cart so they can track separately
                              }}
                              className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl shadow-lg hover:shadow-green-900/20 text-center block transition cursor-pointer"
                            >
                              🚀 Dispatch Order via WhatsApp & Track Live →
                            </a>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-2 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">
                    <span className="text-3xl">🍲</span>
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Your Basket is Empty</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      Select specialties from list above or click "Order WhatsApp" on mapping sidebar to prepare appetizing orders instantly!
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Live GPS Tracking Simulation */}
              <div className="lg:col-span-6 lg:pl-8 pt-4 lg:pt-0 space-y-4">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md">
                    Live Order Tracker
                  </span>
                  <h3 className="text-sm font-black text-white mt-1">
                    🛵 Simulated Real-Time Delivery Tracker
                  </h3>
                </div>

                {activeTracker ? (
                  <div className="space-y-4">
                    {/* Active Route Details */}
                    <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl text-xs space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-400">Kitchen Station:</span>
                        <span className="font-black text-white">{activeTracker.restaurantName}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-400">WhatsApp Alert Number:</span>
                        <span className="font-semibold text-slate-300">{activeTracker.whatsappNumber}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-400">Total Charged:</span>
                        <span className="font-bold text-orange-400 font-mono">₹{activeTracker.totalAmount}</span>
                      </div>
                      <div className="text-[10px] border-t border-slate-800/80 pt-2 text-slate-400 uppercase tracking-widest leading-normal">
                        <strong>📦 Order:</strong> {activeTracker.itemsSummary}
                      </div>
                    </div>

                    {/* Progress tracking path display bar */}
                    <div className="space-y-6 pt-2 select-none relative animate-fadeIn">
                      
                      {/* Vertical line connector */}
                      <div className="absolute left-3.5 top-1 bottom-1 w-0.5 bg-slate-800" />

                      {[
                        { step: 0, title: "⏳ Order Placed & Alert Dispatched", desc: "WhatsApp ordering draft compiled and forwarded to kitchen owner successfully." },
                        { step: 1, title: "👨‍🍳 Cooking & Packing Meals", desc: "Indian cooks are carefully baking and packing your signature delicacies." },
                        { step: 2, title: "🛵 Courier Rider Dispatched", desc: "A simulated rider is speed-routing along physical roads to your address." },
                        { step: 3, title: "🏁 Delivered Successfully!", desc: "Piping-hot order has arrived! Enjoy your fresh and appetizing meal!" }
                      ].map((item) => {
                        const isActive = activeTracker.step === item.step;
                        const isDone = activeTracker.step > item.step;

                        return (
                          <div key={item.step} className="flex gap-4 items-start relative z-10">
                            {/* Circle badge */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isActive 
                                ? "bg-orange-600 text-white ring-4 ring-orange-950"
                                : isDone
                                  ? "bg-green-600 text-white"
                                  : "bg-slate-800 text-slate-500 border border-slate-700"
                            }`}>
                              {isDone ? "✓" : item.step + 1}
                            </div>

                            {/* Text labels */}
                            <div className="space-y-0.5 text-left">
                              <h4 className={`text-xs font-extrabold ${isActive ? "text-orange-400" : isDone ? "text-green-400" : "text-slate-500"}`}>
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tracker control buttons */}
                    <div className="flex gap-3 pt-3 border-t border-slate-800 items-center justify-between">
                      <span className="text-[10.5px] text-indigo-400 font-black uppercase tracking-wider font-sans">
                        {activeTracker.step >= 3 ? "🏁 Deliveries Completed" : `🕒 ETA Arrival in: ${activeTracker.eta} mins`}
                      </span>
                      <button
                        onClick={() => {
                          if (activeTracker.step < 3) {
                            if (!window.confirm("Delivery is still in progress. Cancel current active tracker screen?")) {
                              return;
                            }
                          }
                          setActiveTracker(null);
                        }}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg transition"
                      >
                        Dismiss Tracker
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-2 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">
                    <span className="text-3xl">🛵</span>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Courier Route</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      Checkouts will automatically hook dynamic physical courier tracker progress steps here. Try placing a WhatsApp order!
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 bg-white border-t border-slate-100 flex items-center justify-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest shrink-0 mt-12" id="main-footer">
        <span>Restaurant Near Me © 2026 • Find Favourite Food Instantly</span>
      </footer>

      {/* Floating AI chat head widget (Collapsible in corner) */}
      <AIAssistant
        userLocation={userLocation}
        locating={locating}
        onLocate={handleScanLocation}
      />

      {/* MODAL overlay: Details of restaurant (Menu & Review writing) */}
      {selectedRestaurant && (
        <RestaurantDetailModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          reviewError={reviewError}
          reviewSuccess={reviewSuccess}
          onSubmitReview={handleReviewSubmit}
          cart={cart}
          onAddToCart={(name, price) => handleAddToCartWithCheck(selectedRestaurant, name, price)}
          onRemoveFromCart={handleRemoveFromCart}
        />
      )}

      {/* MODAL overlay: Register / Login Partner portal */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 md:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <h3 className="text-lg font-black text-slate-950 uppercase">
                {authMode === "login" ? "Partner Sign In" : "Owner Enrolment"}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {authMode === "login" ? "Onboard places, write dishes and sync live with Restaurant Near Me." : "Join thousands of Indian partners in seconds."}
              </p>
            </div>



            {authError && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-xs font-bold text-red-650 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="bg-green-50 border border-green-150 p-3 rounded-lg text-xs font-bold text-green-700 mb-4 flex items-center gap-2 animate-bounce">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-black block">Full Owner Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm((v) => ({ ...v, name: e.target.value }))}
                    placeholder="E.g. Shreya Sen"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black block">Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm((v) => ({ ...v, email: e.target.value }))}
                  placeholder="name@restaurant.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black block">Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm((v) => ({ ...v, password: e.target.value }))}
                  placeholder="Password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition cursor-pointer"
              >
                {authMode === "login" ? "Begin Dashboard Session" : "Create Account"}
              </button>
            </form>

            <div className="mt-5 text-center text-[11px] text-slate-400 font-bold border-t border-slate-50 pt-4">
              {authMode === "login" ? (
                <>
                  No partner owner account?{" "}
                  <button
                    onClick={() => setAuthMode("register")}
                    className="text-orange-600 hover:underline font-extrabold"
                  >
                    Onboard here →
                  </button>
                </>
              ) : (
                <>
                  Back to partner session?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="text-orange-600 hover:underline font-extrabold"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL overlay: Register / edit listings (Simplified inputs) */}
      {isFormOpen && (
        <RestaurantFormModal
          onClose={() => setIsFormOpen(false)}
          editingId={editingId}
          restaurantForm={restaurantForm}
          setRestaurantForm={setRestaurantForm}
          onSave={handleSaveRestaurant}
          formError={formError}
        />
      )}
    </div>
  );
}
