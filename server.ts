import express from "express";
import fs from "fs";
import path from "path";

import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Restaurant, Review, MenuItem, ChatMessage } from "./src/types.js";

const __dirname = process.cwd();
const DB_FILE = path.join(__dirname, "db.json");


// Define a simple structure for our DB persistence
interface Database {
  restaurants: Restaurant[];
  users: {
    email: string;
    passwordHash: string; // for simplification we store clear/hashed passwords safely
    name: string;
    role: "admin" | "owner";
    restaurantId?: string;
  }[];
}

// Helper to calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return R * c;
}

// Initial Indian restaurants data with local cities, coordinates and food items
const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "MTR - Mavalli Tiffin Room",
    cuisineType: "South Indian Traditional",
    locationName: "Basavanagudi",
    address: "14, Lal Bagh Main Road, Basavanagudi, Bengaluru, Karnataka 560027",
    websiteUrl: "https://www.mavallitiffinroom.com",
    ownerEmail: "mtr@mavallitiffinroom.com",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600",
    viewCount: 3890,
    rating: 4.9,
    latitude: 12.9417,
    longitude: 77.5755,
    createdAt: new Date().toISOString(),
    menuItems: [
      { name: "Special Rava Masala Dosa", price: 140, description: "Signature semolina crepe with pure ghee and potato mash.", tags: ["veg", "ghee", "classic"] },
      { name: "MTR Filter Coffee", price: 60, description: "Authentic south Indian decoction filter coffee served in brass tumbler.", tags: ["veg", "sweet", "hot"] },
      { name: "Ghee Idli", price: 80, description: "Soft steamed rice cakes completely drenched in pure premium ghee.", tags: ["veg", "soft"] },
      { name: "Bisi Bele Bath", price: 120, description: "A hot, lentil-rice dish blended with vegetables and unique spices.", tags: ["veg", "spicy", "healthy"] }
    ],
    reviews: [
      { id: "rev2_1", userName: "Karthik Raja", rating: 5, comment: "Unbeatable South Indian breakfast! Must try Rava Dosa.", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "r2",
    name: "Toit Brewpub & Kitchen",
    cuisineType: "Italian & Continental Bistro",
    locationName: "Indiranagar",
    address: "298, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
    websiteUrl: "https://toit.in",
    ownerEmail: "toit@brewery.com",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
    viewCount: 4210,
    rating: 4.7,
    latitude: 12.9718,
    longitude: 77.6411,
    createdAt: new Date().toISOString(),
    menuItems: [
      { name: "Wood-Fired Pepperoni Pizza", price: 580, description: "Classic wood-fired thin crust pizza layered with spicy pepperoni & fresh mozzarella.", tags: ["non-veg", "spicy"] },
      { name: "BBQ Chicken Wings", price: 340, description: "Tender chicken wings glazed in smokey hickory house BBQ sauce.", tags: ["non-veg", "spicy"] },
      { name: "Toit Baked Nachos", price: 290, description: "Crispy tortilla chips baked with beans, jalapeños, salsa, and three-cheese blend.", tags: ["veg", "creamy"] }
    ],
    reviews: [
      { id: "rev_toit_1", userName: "Ananya Sen", rating: 4.8, comment: "Fantastic vibe! The pizzas are unmatched and the wings are cooked to perfection.", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "r3",
    name: "The Black Pearl",
    cuisineType: "Barbecue Buffet & Grill",
    locationName: "Koramangala",
    address: "105, 1st A Cross Rd, Koramangala 5th Block, Bengaluru, Karnataka 560095",
    websiteUrl: "https://theblackpearl.sbg.in",
    ownerEmail: "blackpearl@sbg.in",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600",
    viewCount: 2930,
    rating: 4.6,
    latitude: 12.9352,
    longitude: 77.6245,
    createdAt: new Date().toISOString(),
    menuItems: [
      { name: "Pirate Grill Platter", price: 799, description: "Assorted live grills featuring tandoori prawns, fish tikka, and mutton seekh.", tags: ["non-veg", "spicy"] },
      { name: "Paneer Shashlik Skewer", price: 399, description: "Juicy yogurt-marinated cottage cheese cubes grilled with bell peppers.", tags: ["veg", "spicy"] },
      { name: "Signature Rum Mousse", price: 199, description: "Decadent dark chocolate mousse infused with premium aged dark rum.", tags: ["veg", "sweet"] }
    ],
    reviews: [
      { id: "rev_bp_1", userName: "Vikram Malhotra", rating: 4.5, comment: "Amazing pirate theme and top class buffet items. Live grill table service is exemplary.", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "r4",
    name: "Vidyarthi Bhavan",
    cuisineType: "Iconic South Indian Cafe",
    locationName: "Basavanagudi",
    address: "32, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru, Karnataka 560004",
    websiteUrl: "http://vidyarthibhavan.in",
    ownerEmail: "vb@dosa.com",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    viewCount: 5120,
    rating: 4.9,
    latitude: 12.9417,
    longitude: 77.5755,
    createdAt: new Date().toISOString(),
    menuItems: [
      { name: "VB Crispy Masala Dosa", price: 90, description: "Thick, crispy golden brown rice & lentil crepe with potato sagu and rich ghee.", tags: ["veg", "ghee", "classic"] },
      { name: "VB idli (Pair)", price: 40, description: "Served hot with their legendary signature watery coconut chutney.", tags: ["veg", "soft"] },
      { name: "VB Rich Kesari Bhath", price: 50, description: "Sweet semolina pudding cooked with pineapple essence, ghee, and cashew nuts.", tags: ["veg", "sweet"] }
    ],
    reviews: [
      { id: "rev_vb_1", userName: "Subramanian Iyer", rating: 5, comment: "A Bengaluru heritage! The dosa is incredibly crispy on the outside and soft inside.", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "r5",
    name: "Windmills Craftworks",
    cuisineType: "Premium Microbrewery & Jazz Bar",
    locationName: "Whitefield",
    address: "331, Road No. 5B, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066",
    websiteUrl: "https://windmillscraftworks.com",
    ownerEmail: "windmills@craft.in",
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600",
    viewCount: 1840,
    rating: 4.8,
    latitude: 12.9698,
    longitude: 77.7500,
    createdAt: new Date().toISOString(),
    menuItems: [
      { name: "Pork Ribs Rack", price: 720, description: "Slow glazed pork baby back ribs served with rustic hand-cut fries.", tags: ["non-veg", "rich"] },
      { name: "Truffle Mushroom Risotto", price: 490, description: "Creamy arborio rice infused with wild forest mushrooms and pure white truffle oil.", tags: ["veg", "creamy"] },
      { name: "Churro Bites with Chocolate", price: 280, description: "Hot crispy Mexican churro loops dusted in cinnamon sugar, served with molten fudge.", tags: ["veg", "sweet"] }
    ],
    reviews: [
      { id: "rev_wm_1", userName: "Sheela Hegde", rating: 4.9, comment: "Exquisite music, outstanding decor, and very high caliber continental recipes.", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "r6",
    name: "Empire Restaurant",
    cuisineType: "Juicy Kebabs & Biryanis",
    locationName: "HSR Layout",
    address: "Sector 6, Outer Ring Road, HSR Layout, Bengaluru, Karnataka 560102",
    websiteUrl: "https://www.theempirerestaurant.com",
    ownerEmail: "hsr@empire.com",
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600",
    viewCount: 3100,
    rating: 4.5,
    latitude: 12.9105,
    longitude: 77.6450,
    createdAt: new Date().toISOString(),
    menuItems: [
      { name: "Empire Special Chicken Kabab", price: 290, description: "Crispy, deep-fried spiced chicken chunks, a legendary late-night companion.", tags: ["non-veg", "spicy", "popular"] },
      { name: "Ghee Rice with Chicken Gravy", price: 320, description: "Aromatic basmati rice tossed in ghee, served with a bowl of chicken sherva.", tags: ["non-veg", "popular"] },
      { name: "Coin Parotta (Pair)", price: 80, description: "Multi-layered, flaky, soft Kerala style parotta.", tags: ["veg"] }
    ],
    reviews: [
      { id: "rev_emp_1", userName: "Preetham Swamy", rating: 4.6, comment: "The ultimate late night dining destination in Bengaluru. Delicious chicken kebab!", createdAt: new Date().toISOString() }
    ]
  }
];

// Read from database file or write initially
function getDb(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading database fallback to default", e);
    }
  }
  const defaultDb: Database = {
    restaurants: INITIAL_RESTAURANTS,
    users: [
      {
        email: "fm7248154@gmail.com",
        passwordHash: "Password", // Admin account
        name: "Admin Hub Master",
        role: "admin",
      },
    ],
  };
  saveDb(defaultDb);
  return defaultDb;
}

function saveDb(data: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database file", e);
  }
}

// Global active updates channels for SSE (Real-Time Sync)
let activeStreamManagers: any[] = [];

function broadcastUpdates(restaurants: Restaurant[]) {
  activeStreamManagers.forEach((res) => {
    try {
      res.write(`data: ${JSON.stringify(restaurants)}\n\n`);
    } catch (e) {
      // connection might have been dropped
    }
  });
}

// Start Server Setup
async function startServer() {
  const app = express();
  app.use(express.json());

  // Load backend variables
  const apiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // -------------------------------------------------------------
  // Real-time server status / Real-time updates SSE routing
  // -------------------------------------------------------------
  app.get("/api/updates", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Send initial snapshot on subscribe
    const currentDb = getDb();
    res.write(`data: ${JSON.stringify(currentDb.restaurants)}\n\n`);

    activeStreamManagers.push(res);

    req.on("close", () => {
      activeStreamManagers = activeStreamManagers.filter((item) => item !== res);
    });
  });

  // Get current state of restaurants
  app.get("/api/restaurants", (req, res) => {
    const database = getDb();
    res.json(database.restaurants);
  });

  // Auth Routing: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required!" });
    }

    // Admin Hardcoded Check
    if (email === "fm7248154@gmail.com" && password === "Password") {
      return res.json({
        user: { email, name: "Super Admin", role: "admin" },
      });
    }

    // Owner normal check
    const database = getDb();
    const existing = database.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );

    if (existing) {
      return res.json({
        user: { email: existing.email, name: existing.name, role: existing.role, restaurantId: existing.restaurantId },
      });
    }

    return res.status(401).json({ error: "Invalid credentials. Please register as an Owner if you don't have an account." });
  });

  // Auth Routing: Owner Registration
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    if (email === "fm7248154@gmail.com") {
      return res.status(400).json({ error: "Admin email id is reserved. Try another!" });
    }

    const database = getDb();
    const existing = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "This email address is already registered as an Owner." });
    }

    database.users.push({
      email: email,
      passwordHash: password, // simple storage
      name: name,
      role: "owner",
    });

    saveDb(database);
    return res.json({ success: true, message: "Registration successful. You can now log in!" });
  });

  // View count increment endpoint
  app.post("/api/restaurants/:id/increment-views", (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const resIdx = db.restaurants.findIndex((r) => r.id === id);
    if (resIdx !== -1) {
      db.restaurants[resIdx].viewCount += 1;
      saveDb(db);
      broadcastUpdates(db.restaurants);
      return res.json({ success: true, newCount: db.restaurants[resIdx].viewCount });
    }
    return res.status(404).json({ error: "Restaurant not found!" });
  });

  // Insert a review for real-time customer feedback
  app.post("/api/restaurants/:id/reviews", (req, res) => {
    const { id } = req.params;
    const { userName, rating, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ error: "Name, rating (1-5), and comment are required!" });
    }

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be a valid number between 1 and 5!" });
    }

    const db = getDb();
    const resIdx = db.restaurants.findIndex((r) => r.id === id);
    if (resIdx !== -1) {
      const targetRes = db.restaurants[resIdx];
      const newReview: Review = {
        id: "rev_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        userName: userName.toString().trim(),
        comment: comment.toString().trim(),
        rating: parsedRating,
        createdAt: new Date().toISOString(),
      };

      targetRes.reviews = targetRes.reviews || [];
      targetRes.reviews.push(newReview);

      // Recompute average rating
      const sum = targetRes.reviews.reduce((acc, r) => acc + r.rating, 0);
      targetRes.rating = parseFloat((sum / targetRes.reviews.length).toFixed(1));

      saveDb(db);
      broadcastUpdates(db.restaurants);
      return res.json({ success: true, restaurant: targetRes });
    }

    return res.status(404).json({ error: "Restaurant not found!" });
  });

  // Admin and Owner modification routing (Add, Edit, Delete)
  // Ensure we validate authentication details from headers X-User-Email and X-User-Role to prevent bypasses (security)
  app.post("/api/restaurants", (req, res) => {
    const userRole = req.headers["x-user-role"] as string;
    const userEmail = req.headers["x-user-email"] as string;

    if (userRole !== "admin" && userRole !== "owner") {
      return res.status(403).json({ error: "Unauthorized access! Please login with your credentials." });
    }

    const { name, cuisineType, locationName, address, websiteUrl, imageUrl, latitude, longitude, menuItems, whatsappNumber } = req.body;

    if (!name || !cuisineType || !locationName || !address) {
      return res.status(400).json({ error: "Name, cuisine type, city location, and address are required!" });
    }

    const db = getDb();
    const newId = "rest_" + Date.now();
    const newRestaurant: Restaurant = {
      id: newId,
      name: name.trim(),
      cuisineType: cuisineType.trim(),
      locationName: locationName.trim(),
      address: address.trim(),
      websiteUrl: websiteUrl ? websiteUrl.trim() : "",
      ownerEmail: userRole === "admin" ? "admin@hub.com" : userEmail.toLowerCase(),
      imageUrl: imageUrl ? imageUrl.trim() : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
      viewCount: 0,
      rating: 5.0, // base rating
      latitude: latitude ? parseFloat(latitude) : 20.5937, // default general India coordinate if not supplied
      longitude: longitude ? parseFloat(longitude) : 78.9629,
      menuItems: menuItems || [],
      reviews: [],
      createdAt: new Date().toISOString(),
      whatsappNumber: whatsappNumber ? whatsappNumber.trim() : "",
    };

    // If owner, link user's restaurant session
    if (userRole === "owner") {
      const userIdx = db.users.findIndex((u) => u.email.toLowerCase() === userEmail.toLowerCase());
      if (userIdx !== -1) {
        db.users[userIdx].restaurantId = newId;
      }
    }

    db.restaurants.push(newRestaurant);
    saveDb(db);
    broadcastUpdates(db.restaurants);
    res.json({ success: true, restaurant: newRestaurant });
  });

  // Update existing restaurant info (Admin / Owner can do so)
  app.put("/api/restaurants/:id", (req, res) => {
    const userRole = req.headers["x-user-role"] as string;
    const userEmail = req.headers["x-user-email"] as string;

    if (userRole !== "admin" && userRole !== "owner") {
      return res.status(403).json({ error: "Unauthorized access! Log in required." });
    }

    const { id } = req.params;
    const { name, cuisineType, locationName, address, websiteUrl, imageUrl, latitude, longitude, menuItems, whatsappNumber } = req.body;

    const db = getDb();
    const resIdx = db.restaurants.findIndex((r) => r.id === id);

    if (resIdx === -1) {
      return res.status(404).json({ error: "Restaurant not found!" });
    }

    const existing = db.restaurants[resIdx];

    // Authorize owner to only edit their own restaurant
    if (userRole === "owner" && existing.ownerEmail !== userEmail.toLowerCase()) {
      return res.status(403).json({ error: "You can only edit details of your own claimed restaurant." });
    }

    // Input checking
    existing.name = name ? name.trim() : existing.name;
    existing.cuisineType = cuisineType ? cuisineType.trim() : existing.cuisineType;
    existing.locationName = locationName ? locationName.trim() : existing.locationName;
    existing.address = address ? address.trim() : existing.address;
    existing.websiteUrl = websiteUrl !== undefined ? websiteUrl.trim() : existing.websiteUrl;
    existing.imageUrl = imageUrl ? imageUrl.trim() : existing.imageUrl;
    existing.latitude = latitude !== undefined ? parseFloat(latitude) : existing.latitude;
    existing.longitude = longitude !== undefined ? parseFloat(longitude) : existing.longitude;
    if (menuItems) {
      existing.menuItems = menuItems;
    }
    if (whatsappNumber !== undefined) {
      existing.whatsappNumber = whatsappNumber.trim();
    }

    saveDb(db);
    broadcastUpdates(db.restaurants);
    res.json({ success: true, restaurant: existing });
  });

  // Delete a restaurant (Admin / Owner authorized)
  app.delete("/api/restaurants/:id", (req, res) => {
    const userRole = req.headers["x-user-role"] as string;
    const userEmail = req.headers["x-user-email"] as string;

    if (userRole !== "admin" && userRole !== "owner") {
      return res.status(403).json({ error: "Unauthorized access!" });
    }

    const { id } = req.params;
    const db = getDb();
    const resIdx = db.restaurants.findIndex((r) => r.id === id);

    if (resIdx === -1) {
      return res.status(404).json({ error: "Restaurant not found!" });
    }

    const existing = db.restaurants[resIdx];
    if (userRole === "owner" && existing.ownerEmail !== userEmail.toLowerCase()) {
      return res.status(403).json({ error: "Unauthorized to delete other users' restaurants!" });
    }

    db.restaurants.splice(resIdx, 1);

    // Remove link in users
    if (userRole === "owner") {
      const userIdx = db.users.findIndex((u) => u.email.toLowerCase() === userEmail.toLowerCase());
      if (userIdx !== -1) {
        delete db.users[userIdx].restaurantId;
      }
    }

    saveDb(db);
    broadcastUpdates(db.restaurants);
    res.json({ success: true, message: "Restaurant removed successfully!" });
  });

  // Gemini server-side AI Assistant Endpoint
  app.post("/api/assistant", async (req, res) => {
    const { messages, userLocation } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid conversation context!" });
    }

    const database = getDb();
    // Stringify some metadata about current restaurants in India to supply as model context
    const currentListings = database.restaurants.map((r) => ({
      name: r.name,
      cuisine: r.cuisineType,
      city: r.locationName,
      address: r.address,
      rating: r.rating,
      views: r.viewCount,
      famousFoodItems: r.menuItems.map((m) => m.name).join(", "),
    }));

    const userPrompt = messages[messages.length - 1]?.text || "Hello";
    const systemInstruction = `You are a warm, extremely polite, and brilliant Indian Food Discovery AI Assistant named "BiteFinder Guide". 
Your goal is to assist customers or restaurant owners looking for amazing local spots across India.

Here is the current real-time dataset of Indian restaurants on our platform:
${JSON.stringify(currentListings, null, 2)}

User Location Details: ${userLocation ? JSON.stringify(userLocation) : "Not shared yet. Encourage user to grant geolocation permission or select a simulated Indian area (e.g., Indiranagar block, Bengaluru, Corporate Delhi Hubs)."}

Guidelines:
1. ONLY discuss Indian states, cities, Indian cuisines, and local delicacies (e.g., Butter Chicken, Crispy Masala Dosa, MTR Filter Coffee, Biryanis, Chole Bhature, Kebabs) with rich state-wise cultural background.
2. Answer based on the matching records in our real-time dataset. Quote restaurant names, address locations, and specific signature items if available.
3. Inform the user that they can click "Order WhatsApp" on any restaurant popup, details modal, or card to add items to their active order cart, fill out their dispatch address, and instantly send an autofilled WhatsApp delivery message directly to the owner!
4. Encourage them to explore our newly added "Interactive Routing Map" and "Food Trends Analytics" tabs to visually calculate distances and track live state trends.
5. Provide helpful and polite answers formatted with bullet points for easy scanning, concise headers (e.g., using "### Header" of "## Header"), and bold texts for emphasis.
6. If the user is a restaurant owner, guide them on how to onboard their Indian kitchen outlet 100% free of charge via the Owner claimant workspace.`;

    try {
      // Use the gemini-3.5-flash model for smart conversational response
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || "I apologize, let me think and try again!";
      return res.json({ response: text });
    } catch (e: any) {
      console.error("Gemini Assistant error:", e);
      return res.json({
        response: `Namaste! I got slightly full of thoughts. Here is a friendly hint: Please verify your GEMINI_API_KEY. I will guide you to our registered Indian restaurants in Mumbai, Delhi, and Bengaluru: ${database.restaurants.map(r => r.name).join(", ")}.`,
      });
    }
  });

  // Serve static files and wire Vite server
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res, next) => {
      // Avoid intercepting API calls
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        const transformed = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(transformed);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server launched successfully at http://0.0.0.0:${port}`);
  });
}

startServer().catch((e) => {
  console.error("Server start failure:", e);
});
