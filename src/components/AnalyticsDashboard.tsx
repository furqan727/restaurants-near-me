import React from "react";
import { Restaurant } from "../types";
import { TrendingUp, BarChart2, Star, Eye, Compass, Utensils, Award, Users } from "lucide-react";

interface AnalyticsDashboardProps {
  restaurants: Restaurant[];
}

export default function AnalyticsDashboard({ restaurants }: AnalyticsDashboardProps) {
  // 1. Calculate General Aggregations
  const totalViews = restaurants.reduce((acc, r) => acc + (r.viewCount || 0), 0);
  const totalReviews = restaurants.reduce((acc, r) => acc + (r.reviews?.length || 0), 0);
  const systemAvgRating = parseFloat(
    (restaurants.reduce((acc, r) => acc + r.rating, 0) / (restaurants.length || 1)).toFixed(2)
  );

  // 2. Compute Cuisines Popularity & Statistics
  const cuisinesMap: { [key: string]: { count: number; views: number; ratingSum: number; reviewsCount: number } } = {};
  restaurants.forEach((r) => {
    // Simplify cuisine names (e.g. "South Indian Traditional" -> "South Indian", "Iconic South Indian Cafe" -> "South Indian")
    let simpleCuisine = "Continental";
    const cl = r.cuisineType.toLowerCase();
    if (cl.includes("south indian")) simpleCuisine = "South Indian";
    else if (cl.includes("italian") || cl.includes("pizza") || cl.includes("continental")) simpleCuisine = "Continental / Western";
    else if (cl.includes("barbecue") || cl.includes("grill") || cl.includes("kebab")) simpleCuisine = "Mughlai & BBQ";
    else if (cl.includes("biryani") || cl.includes("north indian")) simpleCuisine = "North Indian & Biryanis";
    else if (cl.includes("traditional") || cl.includes("cafe") || cl.includes("tiffin")) simpleCuisine = "Traditional Cafes";
    else simpleCuisine = r.cuisineType;

    if (!cuisinesMap[simpleCuisine]) {
      cuisinesMap[simpleCuisine] = { count: 0, views: 0, ratingSum: 0, reviewsCount: 0 };
    }
    cuisinesMap[simpleCuisine].count += 1;
    cuisinesMap[simpleCuisine].views += r.viewCount;
    cuisinesMap[simpleCuisine].ratingSum += r.rating;
    cuisinesMap[simpleCuisine].reviewsCount += r.reviews?.length || 0;
  });

  const cuisineStatsList = Object.keys(cuisinesMap).map((name) => {
    const stat = cuisinesMap[name];
    return {
      name,
      count: stat.count,
      views: stat.views,
      reviewsCount: stat.reviewsCount,
      avgRating: parseFloat((stat.ratingSum / stat.count).toFixed(1)),
    };
  }).sort((a, b) => b.views - a.views);

  // 3. Compute Geographic Cities distribution counts
  const citiesMap: { [key: string]: { count: number; totalViews: number } } = {};
  restaurants.forEach((r) => {
    const city = r.locationName;
    if (!citiesMap[city]) {
      citiesMap[city] = { count: 0, totalViews: 0 };
    }
    citiesMap[city].count += 1;
    citiesMap[city].totalViews += r.viewCount;
  });

  const cityStatsList = Object.keys(citiesMap).map((name) => ({
    name,
    count: citiesMap[name].count,
    views: citiesMap[name].totalViews,
  })).sort((a, b) => b.views - a.views);

  // 4. Trace top-ranked restaurant (High star scoring) and trending (Highest viewed count)
  const topRanked = [...restaurants].sort((a, b) => b.rating - a.rating)[0];
  const hotTrending = [...restaurants].sort((a, b) => b.viewCount - a.viewCount)[0];

  return (
    <div className="space-y-6 select-text" id="analytics-overview-dashboard">
      {/* 4 Multi-metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 text-left shadow-2xs">
          <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mb-3.5">
            <Eye className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Catalog Views</span>
          <p className="text-2xl font-black text-slate-800 font-mono mt-1">{totalViews}</p>
          <span className="text-[10.5px] text-green-650 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" /> +14.2% global traction
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 text-left shadow-2xs">
          <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mb-3.5">
            <Star className="w-5 h-5 fill-amber-550 fill-amber-500" />
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">System Avg Rating</span>
          <p className="text-2xl font-black text-slate-800 mt-1 font-mono">{systemAvgRating} / 5.0</p>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Based on {totalReviews} reviews</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 text-left shadow-2xs">
          <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mb-3.5">
            <Utensils className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Registered Outlets</span>
          <p className="text-2xl font-black text-slate-800 mt-1 font-mono">{restaurants.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Spanning {cityStatsList.length} major Indian cities</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 text-left shadow-2xs">
          <span className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 mb-3.5">
            <Users className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Partners</span>
          <p className="text-2xl font-black text-slate-800 mt-1 font-mono">
            {restaurants.filter((r) => r.ownerEmail !== "admin@hub.com").length} Owners
          </p>
          <span className="text-[10px] text-green-600 font-bold mt-1 block">100% Free Organic reach</span>
        </div>
      </div>

      {/* Culinary Specialties Performance Bar charts & City Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Cuisine Views Trends Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl text-left shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Cuisine Views & Traction Trends</h3>
          </div>
          <p className="text-slate-400 font-medium text-xs leading-relaxed">
            Comparing the total view count metrics across compiled Indian state specialties registered on the platform.
          </p>

          <div className="space-y-4 pt-2">
            {cuisineStatsList.map((cuisine) => {
              // Calculate proportion percent
              const maxViews = Math.max(...cuisineStatsList.map(c => c.views), 1);
              const percentage = Math.round((cuisine.views / maxViews) * 100);

              return (
                <div key={cuisine.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{cuisine.name}</span>
                    <span className="font-semibold text-slate-500 font-mono">
                      {cuisine.views.toLocaleString()} views • {cuisine.avgRating} ★
                    </span>
                  </div>
                  {/* Progress bar graph */}
                  <div className="h-2.5 bg-slate-100 rounded-full w-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: City Distribution & Claims */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl text-left shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Geographic Kitchen Concentration</h3>
          </div>
          <p className="text-slate-400 font-medium text-xs leading-relaxed">
            Registered count metrics by specific Indian cities. Claim levels indicate active owner presence online.
          </p>

          <div className="space-y-4 pt-2">
            {cityStatsList.map((city) => {
              const maxCount = Math.max(...cityStatsList.map(c => c.count), 1);
              const percent = Math.round((city.count / maxCount) * 100);

              return (
                <div key={city.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{city.name}</span>
                    <span className="font-semibold text-slate-500 font-mono">
                      {city.count} {city.count === 1 ? "outlet" : "outlets"} ({city.views} views)
                    </span>
                  </div>
                  {/* Progress bar graph */}
                  <div className="h-2.5 bg-slate-100 rounded-full w-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Spotlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spotlight 1: Best Rated */}
        {topRanked && (
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex items-center gap-4 text-left text-white shadow-md">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider">🌟 Highest Rated Kitchen</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{topRanked.name}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Holds a solid <strong>{topRanked.rating} ★ Average rating</strong> across all registered community feedbacks.
              </p>
            </div>
          </div>
        )}

        {/* Spotlight 2: Hot trend */}
        {hotTrending && (
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl flex items-center gap-4 text-left text-white shadow-md">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-orange-400 tracking-wider">🔥 Trending Sensation</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{hotTrending.name}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Most popular choice on platform with <strong>{hotTrending.viewCount} verified views</strong>!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
