import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let shiprocketToken = "";
  let tokenExpiry = 0;

  async function getShiprocketToken() {
    if (shiprocketToken && Date.now() < tokenExpiry) {
      return shiprocketToken;
    }

    const email = process.env.SHIPROCKET_EMAIL || "moincomp06@gmail.com";
    const password = process.env.SHIPROCKET_PASSWORD || "yKP4D6^ox4i4d!EvN2a^Ve8^HKfY!nfa";

    if (!email || !password) {
      throw new Error("SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environments are required");
    }

    // Shiprocket V2 API endpoint
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
       const errorText = await response.text();
       console.error(`Shiprocket Login Failed (Status ${response.status}):`, errorText);
       
       if (response.status === 403) {
         throw new Error("Shiprocket 403 Forbidden: You MUST create a dedicated 'API User' in Shiprocket Settings > API > Configure. Main account credentials usually result in this error. Also, ensure 'IP Whitelisting' is DISABLED.");
       }
       throw new Error(`Shiprocket login failed: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    if (data.token) {
      shiprocketToken = data.token;
      // Tokens are usually valid for 10 days, let's set it to 1 day for safety
      tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      return shiprocketToken;
    }
    throw new Error("No token received from Shiprocket");
  }

  // API Routes
  app.post("/api/shipping-calc", async (req, res) => {
    const { deliveryPincode } = req.body;
    
    if (!deliveryPincode) {
      return res.status(400).json({ error: "Delivery pincode is required" });
    }

    try {
      const email = process.env.SHIPROCKET_EMAIL;
      const password = process.env.SHIPROCKET_PASSWORD;
      
      if (!email || !password) {
        return res.status(400).json({ status: "config_missing", message: "Shipping calculation is pending configuration." });
      }

      const token = await getShiprocketToken();
      const originPincode = process.env.SHIPROCKET_ORIGIN_PINCODE || "770033";
      
      // Calculate shipping for 0.5kg, 10x10x10
      const params = new URLSearchParams({
        pickup_postcode: originPincode,
        delivery_postcode: deliveryPincode,
        weight: "0.5",
        cod: "0", 
      });

      const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Shiprocket Serviceability Error:", errorData);
        return res.status(200).json({ status: "unavailable", message: "Shipping not available for this pincode" });
      }

      const resData = await response.json();
      
      if (resData.status !== 200 || !resData.data || !resData.data.available_courier_companies_aggregator) {
        return res.status(200).json({ status: "unavailable", message: "No couriers service this area" });
      }

      // Find the cheapest courier
      const couriers = resData.data.available_courier_companies_aggregator;
      let minCharge = Infinity;

      couriers.forEach((c: any) => {
        const charge = parseFloat(c.rate);
        if (charge < minCharge) {
          minCharge = charge;
        }
      });

      if (minCharge === Infinity) {
        return res.status(200).json({ status: "unavailable", message: "Couriers are currently unavailable" });
      }

      // Custom Pricing Logic (The RM Souq Discount)
      // IF charge > 50, subtract 50.
      // IF charge <= 50, charge = 0.
      let finalCharge = minCharge > 50 ? minCharge - 50 : 0;
      
      res.json({
        status: "success",
        originalCharge: minCharge,
        finalCharge: Math.round(finalCharge),
        isFree: finalCharge === 0
      });

    } catch (error: any) {
      console.error("Shiprocket API System Error:", error.message);
      res.status(200).json({ status: "error", message: error.message || "System failed to calculate shipping" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
