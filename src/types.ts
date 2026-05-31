export interface MenuItem {
  name: string;
  price: number;
  description: string;
  tags: string[]; // e.g., ["veg", "spicy", "gluten-free", "healthy"]
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string; // e.g. "Italian", "Indian", "Japanese", "Fast Food", "Mexican"
  locationName: string; // e.g. "Salt Lake City", "San Francisco", "New York", "Chicago"
  address: string;
  websiteUrl: string;
  ownerEmail: string; // Used to identify owner claiming/creating this restaurant
  imageUrl: string;
  viewCount: number;
  rating: number; // Average rating computed from reviews
  menuItems: MenuItem[];
  reviews: Review[];
  latitude: number;
  longitude: number;
  createdAt: string;
  whatsappNumber?: string;
}

export type UserRole = "customer" | "owner" | "admin";

export interface UserSession {
  role: UserRole;
  email: string;
  name: string;
}

export interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export interface DatabaseState {
  restaurants: Restaurant[];
  owners: { email: string; restaurantIds: string[] }[];
}
