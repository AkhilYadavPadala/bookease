import express from "express";
import supabase from "../supabase.js";

const router = express.Router();

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      resource_id,
      selected_services, // array of service names like ["Haircut", "Beard Trim"]
      booking_date,
      booked_slot,
    } = req.body;

    if (!user_id || !resource_id || !booking_date || !booked_slot || !selected_services) {
      return res.status(400).json({ error: "Missing required fields in request body" });
    }

    // 🟩 1️⃣ Fetch resource details (for available services and prices)
    const { data: resourceData, error: resourceError } = await supabase
      .from("resources")
      .select("services, prices")
      .eq("id", resource_id)
      .maybeSingle();

    if (resourceError) throw resourceError;
    if (!resourceData) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const { services, prices } = resourceData;

    // 🟨 2️⃣ Validate selected services
    if (!Array.isArray(selected_services) || selected_services.length === 0) {
      return res.status(400).json({ error: "selected_services must be a non-empty array" });
    }

    const invalidServices = selected_services.filter(svc => !services.includes(svc));
    if (invalidServices.length > 0) {
      return res.status(400).json({
        error: `Invalid services selected: ${invalidServices.join(", ")}`,
      });
    }

    // 🟧 3️⃣ Calculate total price
    let total_price = 0;
    for (const service of selected_services) {
      const price = prices[service];
      if (price === undefined) {
        return res.status(400).json({
          error: `Price not found for service: ${service}`,
        });
      }
      total_price += parseFloat(price);
    }

    // 🟦 4️⃣ Fetch available slots for that date
    const { data: slotData, error: fetchError } = await supabase
      .from("available_slots")
      .select("id, time_slots")
      .eq("resource_id", resource_id)
      .eq("date", booking_date)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!slotData) {
      return res.status(404).json({ error: "No available slots found for that date" });
    }

    if (!Array.isArray(slotData.time_slots)) {
      return res.status(400).json({ error: "Invalid slot data format in DB" });
    }

    // 🟥 5️⃣ Check if requested slot exists
    if (!slotData.time_slots.includes(booked_slot)) {
      return res.status(400).json({ error: "This time slot is no longer available" });
    }

    // 🟩 6️⃣ Remove booked slot from available_slots
    const updatedSlots = slotData.time_slots.filter(t => t !== booked_slot);
    const { error: updateError } = await supabase
      .from("available_slots")
      .update({ time_slots: updatedSlots })
      .eq("id", slotData.id);

    if (updateError) throw updateError;
    const nowIST = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
});
    // 🟦 7️⃣ Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          user_id,
          resource_id,
          selected_services,
          total_price,
          booking_time: nowIST,
          booking_date,
          booked_slot,
        },
      ])
      .select()
      .single();

    if (bookingError) throw bookingError;

    res.status(201).json({
      message: "Booking successful",
      total_price,
      booking,
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        booking_time,
        total_price,
        booked_slot,
        selected_services,
        status,
        created_at,
        resources (
          shop_name,
          location,
          image_url
        )
      `)
      .eq("user_id", user_id)
      .order("booking_date", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/appointments/:provider_id", async (req, res) => {
  try {
    const { provider_id } = req.params;

    if (!provider_id) {
      return res.status(400).json({ error: 'Provider ID is required' });
    }

    // 1. Find resources managed by this provider
    const { data: resources, error: resourceError } = await supabase
      .from('resources')
      .select('id')
      .eq('provider_id', provider_id);

    if (resourceError) throw resourceError;
    if (!resources || resources.length === 0) {
      return res.json([]); // No resources, so no appointments
    }

    const resourceIds = resources.map(r => r.id);

    // 2. Fetch bookings for those resources, joining with user data for client name
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booked_slot,
        selected_services,
        status,
        created_at,
        users ( full_name ), 
        resources ( shop_name ) 
      `)
      .in('resource_id', resourceIds) // Filter by the provider's resources
      .order('booking_date', { ascending: true }) // Show upcoming first
      .order('booked_slot', { ascending: true });

    if (bookingError) throw bookingError;

    res.json(bookings || []);

  } catch (err) {
    console.error("Error fetching admin appointments:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
