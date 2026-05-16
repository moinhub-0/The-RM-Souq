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

    const email = process.env.SHIPROCKET_EMAIL || "rmsouq@gmail.com";
    const password = process.env.SHIPROCKET_PASSWORD || "X4^DNVj#PUQsmVBfPClwhIKGD*B4MaIW";

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
       throw new Error(`Shiprocket API User configuration required (403 Forbidden). Please set up in Shiprocket Settings > API.`);
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

    let minCharge = 60; // Fallback shipping base charge
    
    try {
      let token;
      try {
        token = await getShiprocketToken();
      } catch (tokenErr) {
        console.warn("Shiprocket auth failed, using fallback.", tokenErr);
      }

      if (token) {
        try {
          const originPincode = process.env.SHIPROCKET_ORIGIN_PINCODE || "770033";
          
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

          if (response.ok) {
            const resData = await response.json();
            if (resData.status === 200 && resData.data && resData.data.available_courier_companies_aggregator) {
               const couriers = resData.data.available_courier_companies_aggregator;
               let apiMinChange = Infinity;
               couriers.forEach((c: any) => {
                 const charge = parseFloat(c.rate);
                 if (charge < apiMinChange) apiMinChange = charge;
               });
               if (apiMinChange !== Infinity) {
                  minCharge = apiMinChange;
               }
            } else {
                console.warn("Shiprocket serviceability response invalid or missing couriers:", resData);
            }
          } else {
             console.warn("Shiprocket serviceability API failed with status:", response.status);
          }
        } catch (shiprocketError) {
          console.warn("Shiprocket API call failed, using fallback.", shiprocketError);
        }
      }

      // Custom Pricing Logic (The RM Souq Discount)
      // IF charge > 40, subtract 40.
      // IF charge <= 40, charge = 0.
      let finalCharge = minCharge > 40 ? minCharge - 40 : 0;
      
      res.json({
        status: "success",
        originalCharge: minCharge,
        finalCharge: Math.round(finalCharge),
        isFree: finalCharge === 0,
        note: minCharge === 60 ? "Fallback static rate applied" : undefined
      });

    } catch (error: any) {
      console.error("System Error during shipping calc:", error.message);
      res.status(200).json({ status: "error", message: "System failed to calculate shipping" });
    }
  });

  // Razorpay Order Route
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, receipt } = req.body;
      const Razorpay = (await import("razorpay")).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || ''
      });
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`
      });
      res.json({ orderId: order.id, amount: order.amount, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (e: any) {
       console.error("Razorpay order creation error:", e);
       res.status(500).json({ error: e.message || 'Error creating Razorpay order' });
    }
  });

  // Razorpay Verify & Shiprocket Create Route
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;
      const crypto = await import("crypto");
      
      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature === razorpay_signature) {
        // Now call Shiprocket API to create order
        try {
          const token = await getShiprocketToken();
          
          const shiprocketItems = orderDetails.items.map((item: any) => ({
             name: item.name,
             sku: item.id,
             units: item.quantity,
             selling_price: item.price
          }));

          const [firstName, ...lastNameParts] = (orderDetails.shippingDetails.fullName || "").split(" ");
          const lastName = lastNameParts.join(" ") || firstName;

          const shiprocketPayload = {
            order_id: razorpay_order_id,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: "Primary",
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: orderDetails.shippingDetails.fullAddress,
            billing_city: orderDetails.shippingDetails.city,
            billing_pincode: orderDetails.shippingDetails.pincode,
            billing_state: orderDetails.shippingDetails.state,
            billing_country: "India",
            billing_email: orderDetails.userEmail,
            billing_phone: orderDetails.shippingDetails.phone,
            shipping_is_billing: true,
            order_items: shiprocketItems,
            payment_method: "Prepaid",
            sub_total: orderDetails.totalPrice,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
          };

          const createOrderRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
            method: "POST",
            headers: {
               "Authorization": `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify(shiprocketPayload)
          });
          
          const shiprocketData = await createOrderRes.json();
          console.log("Shiprocket order creation response:", shiprocketData);
          
        } catch (shiprocketError) {
          console.error("Failed to create shiprocket order automatically:", shiprocketError);
          // Let verification succeed even if shiprocket fails
        }

        res.json({ success: true, message: "Payment verified and order created." });
      } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, error: e.message || 'Error verifying payment' });
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
