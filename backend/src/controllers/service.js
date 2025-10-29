import express from 'express'
import supabase from '../supabase.js'

const router = express.Router()

// Create a new resource
router.post('/', async (req, res) => {
  try {
    const {
      shop_name,
      location,
      services,
      prices,
      category,
      description,
      image_url,
      provider_id,
    } = req.body

    // Basic validation
    if (!shop_name || !location || !services || !prices || !category || !provider_id) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('resources')
      .insert([
        {
          shop_name,
          location,
          services,
          prices,
          category,
          description,
          image_url,
          provider_id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({
      message: 'Resource created successfully',
      data,
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Fetch resources with optional filters: ?search=...&category=...&location=...&provider_id=...
router.get('/', async (req, res) => {
  try {
    // ✅ FIX: Ensure `provider_id` is correctly destructured from the query parameters.
    const { search, category, location, provider_id } = req.query 

    let query = supabase
      .from('resources')
      .select('*') // Select all fields to be consistent for the admin view

    // Search filter
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = search.trim()
      query = query.or(
        `shop_name.ilike.%${term}%,` +
        `category.ilike.%${term}%,` +
        `services.cs.{${term}}`
      )
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      query = query.eq('category', category)
    }

    // Location filter
    if (
      location &&
      typeof location === 'string' &&
      location.trim().length > 0 &&
      location.trim().toLowerCase() !== 'current location'
    ) {
      const locTerm = location.trim()
      query = query.ilike('location', `%${locTerm}%`)
    }

    // Provider ID filter
    if (provider_id && typeof provider_id === 'string' && provider_id.trim().length > 0) {
        query = query.eq('provider_id', provider_id.trim());
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase fetch error:', error)
      return res.status(500).json({ error: error.message })
    }

    // The frontend expects the array in a 'data' property
    return res.status(200).json({ data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Get single resource by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch single resource error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { provider_id, ...updateData } = req.body;

    if (!provider_id) {
      return res.status(401).json({ error: 'Unauthorized: Provider ID is required.' });
    }

    const { data: existingResource, error: fetchError } = await supabase
      .from('resources')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (existingResource.provider_id !== provider_id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this resource.' });
    }

    const { data, error } = await supabase
      .from('resources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Service updated successfully', data });
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ --- REWRITTEN: UPDATE AVAILABLE SLOTS IN THE DEDICATED TABLE ---
router.patch('/:id/slots', async (req, res) => {
    try {
        const { id: resource_id } = req.params; // aliasing id to resource_id
        const { available_slots, provider_id } = req.body;

        if (!provider_id) {
            return res.status(401).json({ error: 'Unauthorized: Provider ID is required.' });
        }
        if (!available_slots) {
            return res.status(400).json({ error: '`available_slots` data is required.' });
        }
        
        // Security Check: Verify ownership
        const { data: existingResource, error: fetchError } = await supabase
            .from('resources')
            .select('provider_id')
            .eq('id', resource_id)
            .single();

        if (fetchError) throw fetchError;
        if (existingResource.provider_id !== provider_id) {
            return res.status(403).json({ error: 'Forbidden: You do not own this resource.' });
        }

        // 1. Delete all existing slots for this resource to ensure a clean update
        const { error: deleteError } = await supabase
            .from('available_slots')
            .delete()
            .eq('resource_id', resource_id);

        if (deleteError) throw deleteError;
        
        // 2. Prepare new rows to insert from the available_slots object
        const rowsToInsert = Object.entries(available_slots)
            .filter(([date, time_slots]) => Array.isArray(time_slots) && time_slots.length > 0)
            .map(([date, time_slots]) => ({
                resource_id,
                date,
                time_slots,
            }));

        // 3. Insert the new rows if there are any
        if (rowsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('available_slots')
                .insert(rowsToInsert);
            
            if (insertError) throw insertError;
        }

        res.status(200).json({ message: 'Slots updated successfully' });

    } catch (err) {
        console.error('Update slots error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router

