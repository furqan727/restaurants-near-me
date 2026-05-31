import React from "react";
import { X, MapPin, Star, Eye, Globe, Utensils, MessageSquare, AlertCircle, ShieldCheck } from "lucide-react";
import { Restaurant } from "../types";

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  reviewForm: { userName: string; rating: number; comment: string };
  setReviewForm: React.Dispatch<React.SetStateAction<{ userName: string; rating: number; comment: string }>>;
  reviewError: string;
  reviewSuccess: boolean;
  onSubmitReview: (e: React.FormEvent) => void;
  cart: { [key: string]: number };
  onAddToCart: (itemName: string, price: number) => void;
  onRemoveFromCart: (itemName: string) => void;
}

export default function RestaurantDetailModal({
  restaurant,
  onClose,
  reviewForm,
  setReviewForm,
  reviewError,
  reviewSuccess,
  onSubmitReview,
  cart,
  onAddToCart,
  onRemoveFromCart,
}: RestaurantDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-950 hover:scale-105 text-white rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Cover Banner */}
        <div className="h-56 md:h-72 relative">
          <img
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white text-left">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">
              {restaurant.cuisineType} • {restaurant.locationName}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
              {restaurant.name}
            </h2>
            <p className="text-sm text-slate-300 font-medium flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              {restaurant.address}
            </p>
          </div>
        </div>

        {/* Detail statistics bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 md:px-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-4 text-slate-700 font-medium">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
              <strong>{restaurant.rating} Average</strong> ({restaurant.reviews?.length || 0} customer reviews)
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{restaurant.viewCount} views tracked</span>
            </span>
          </div>

          {restaurant.websiteUrl && (
            <a
              href={restaurant.websiteUrl.startsWith("http") ? restaurant.websiteUrl : `https://${restaurant.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-orange-600 hover:text-orange-500 bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Restaurant Site</span>
            </a>
          )}
        </div>

        {/* Split Grid for Items & Reviews */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Specialties Menu Card list */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold uppercase text-slate-800 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" /> Specials Menu
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {restaurant.menuItems?.length || 0} Specialties
              </span>
            </div>

            {(!restaurant.menuItems || restaurant.menuItems.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No menu items displayed right now.</p>
            ) : (
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2">
                {restaurant.menuItems.map((item, id) => {
                  const qty = cart[item.name] || 0;
                  return (
                    <div
                      key={id}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl cursor-default hover:border-orange-200 transition-all duration-200 group flex justify-between items-start gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.tags.includes("veg") ? "bg-green-600" : "bg-red-600"
                            }`}
                            title={item.tags.includes("veg") ? "Pure Vegetarian" : "Non-Vegetarian"}
                          />
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </h4>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        {/* Tags block */}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="bg-white border border-slate-100 text-slate-500 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-extrabold text-slate-900 bg-white border border-slate-100 px-2.5 py-1 rounded-xl shadow-sm whitespace-nowrap">
                          ₹{item.price}
                        </span>

                        {/* Quantity controls */}
                        {qty > 0 ? (
                          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                            <button
                              type="button"
                              onClick={() => onRemoveFromCart(item.name)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-orange-600 border-r border-slate-100 transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-extrabold text-slate-800">{qty}</span>
                            <button
                              type="button"
                              onClick={() => onAddToCart(item.name, item.price)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-orange-600 border-l border-slate-100 transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item.name, item.price)}
                            className="text-[10px] uppercase font-black tracking-wider bg-orange-600 hover:bg-orange-500 active:scale-95 text-white px-3 py-1.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                          >
                            Add To Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback & Reviews System side */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold uppercase text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-600" /> Customer Buzz
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-105 bg-slate-100 px-2 py-0.5 rounded-full">
                {restaurant.reviews?.length || 0} reviews
              </span>
            </div>

            {/* Form submit review */}
            <form onSubmit={onSubmitReview} className="bg-slate-900 text-slate-100 rounded-2xl p-5 space-y-4 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-orange-400 tracking-wider">Write an Honest Review</h4>
                {reviewSuccess && (
                  <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Published
                  </span>
                )}
              </div>

              {reviewError && (
                <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-xs font-medium text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Aarav Mehta"
                    value={reviewForm.userName}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, userName: e.target.value }))}
                    className="w-full bg-slate-800 text-white rounded-xl border border-slate-700 font-medium p-2 text-xs outline-none focus:border-orange-500 transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Star Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: parseInt(e.target.value) || 5 }))}
                    className="w-full bg-slate-800 text-white rounded-xl border border-slate-700 p-2 text-xs outline-none focus:border-orange-500 font-bold transition-all"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 / 5</option>
                    <option value="4">⭐⭐⭐⭐ 4 / 5</option>
                    <option value="3">⭐⭐⭐ 3 / 5</option>
                    <option value="2">⭐⭐ 2 / 5</option>
                    <option value="1">⭐ 1 / 5</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black block">Your Feedback</label>
                <textarea
                  required
                  placeholder="Tell others about the spices, food, and experience..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-800 text-white rounded-xl border border-slate-700 p-2 px-3 text-xs outline-none focus:border-orange-500 transition-all placeholder:text-slate-500 resize-none font-medium text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer text-center shadow-md shadow-orange-600/10"
              >
                Publish Feedback
              </button>
            </form>

            {/* List of customer replies */}
            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
              {(!restaurant.reviews || restaurant.reviews.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-2">No reviews recorded yet. Share your experience first!</p>
              ) : (
                [...restaurant.reviews].reverse().map((rev) => (
                  <div key={rev.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800">{rev.userName}</span>
                      <span className="text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold text-[10px]">
                        {rev.rating} ★
                      </span>
                    </div>
                    <p className="text-slate-650 text-slate-600 leading-relaxed font-semibold">
                      {rev.comment}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium text-right block self-end">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
