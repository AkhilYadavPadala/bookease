import express from "express";
import supabase from "../supabase.js";

const router = express.Router();

// POST /api/slots/add
router.post("/add", async (req, res) => {
  try {
    const { resource_id, date, time_slots } = req.body;

    if (!resource_id || !date || !Array.isArray(time_slots)) {
      return res.status(400).json({
        error: "resource_id, date, and time_slots (as array) are required",
      });
    }

    // 1️⃣ Check if a row already exists for this resource and date
    const { data: existingRow, error: fetchError } = await supabase
      .from("available_slots")
      .select("id, time_slots")
      .eq("resource_id", resource_id)
      .eq("date", date)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingRow) {
      // 2️⃣ Merge the new time slots with existing ones
      const mergedSlots = Array.from(
        new Set([...existingRow.time_slots, ...time_slots])
      );

      // 3️⃣ Update existing record
      const { data, error: updateError } = await supabase
        .from("available_slots")
        .update({ time_slots: mergedSlots })
        .eq("id", existingRow.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.status(200).json({
        message: "Slots updated successfully",
        available_slots: data,
      });
    } else {
      // 4️⃣ No existing row → Insert a new one
      const { data, error: insertError } = await supabase
        .from("available_slots")
        .insert([{ resource_id, date, time_slots }])
        .select()
        .single();

      if (insertError) throw insertError;

      return res.status(201).json({
        message: "New slots added successfully",
        available_slots: data,
      });
    }
  } catch (err) {
    console.error("Available slots error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/slots
// Optional query params: resource_id, date, page=1, limit=50
router.get("/day", async (req, res) => {
  try {
    const { resource_id, date } = req.query;

    if (!resource_id || !date) {
      return res.status(400).json({ error: "resource_id and date query parameters are required" });
    }

    const { data, error } = await supabase
      .from("available_slots")
      .select("id, resource_id, date, time_slots")
      .eq("resource_id", resource_id)
      .eq("date", date)
      .maybeSingle();

    if (error) {
      console.error("Fetch day slots error:", error);
      return res.status(500).json({ error: error.message });
    }

    // If no slots are found for that day, return a default empty structure
    // This is friendly for the frontend and prevents errors.
    if (!data) {
      return res.status(200).json({
        id: null,
        resource_id,
        date,
        time_slots: [],
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Fetch day slots unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// DELETE /api/slots/remove
router.delete("/remove", async (req, res) => {
  try {
    const { slot_id } = req.body;

    const { error } = await supabase
      .from("available_slots")
      .delete()
      .eq("id", slot_id);

    if (error) throw error;
    res.status(200).json({ message: "Slot removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
