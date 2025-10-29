import { useState, useEffect,useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { 
    Clock, 
    Plus, 
    Loader2, 
    LocateFixed, 
    Trash2, 
    Edit,
    CalendarDays
} from "lucide-react";
import { useAuth } from "../../context/Authcontext";
import { toast } from "sonner";
import { supabase } from "../../supabaseclient";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000';

// This is the shape of the nested `available_slots` data from the backend
interface SlotRow {
    date: string;
    time_slots: string[];
}

// This interface represents the transformed data used in the component's state
interface ServiceResource {
  id: string;
  shop_name: string;
  location: string;
  category: string;
  description: string | null;
  image_url: string | null;
  services: string[];
  prices: Record<string, number | string>;
  // This is now an object mapping dates to slot arrays
  available_slots: TransformedSlots; 
  provider_id?: string;
}

// This interface represents the raw data structure coming from the API
interface RawServiceResource extends Omit<ServiceResource, 'available_slots'> {
    available_slots: SlotRow[]; // The API sends an array of rows
}

// Frontend will transform the SlotRow[] into this structure for easier state management
interface TransformedSlots {
    [date: string]: string[];
}


function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ServicesView = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceResource[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResource | null>(null);

  // Form State
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);
  const [serviceEntries, setServiceEntries] = useState([{ service: "", price: "" }]);

  // Slots Modal State
  const [selectedServiceForSlots, setSelectedServiceForSlots] = useState<ServiceResource | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSlotTime, setNewSlotTime] = useState("");
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<string[]>([]);
  const [allSlotsData, setAllSlotsData] = useState<Record<string, string[]>>({});

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingGeoLocation, setIsFetchingGeoLocation] = useState(false);
  const [isUpdatingSlots, setIsUpdatingSlots] = useState(false);

  const fetchProviderServices = async () => {
    if (!user?.id) return;
    setLoadingServices(true);
    try {
      const response = await fetch(`${API_BASE}/service?provider_id=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      
      const transformedServices = (data.data || []).map((s: RawServiceResource) => {
          let transformedSlots: TransformedSlots = {}; // Default to empty object

          // ✅ FIX: Safely check if available_slots is an array before trying to reduce it
          if (Array.isArray(s.available_slots)) {
            transformedSlots = s.available_slots.reduce((acc: TransformedSlots, slotRow: SlotRow) => {
                const formattedDate = slotRow.date.split('T')[0];
                acc[formattedDate] = slotRow.time_slots;
                return acc;
            }, {});
          }

          return {
              ...s,
              available_slots: transformedSlots,
              prices: s.prices || {}
          };
      });
      
      setServices(transformedServices);
    } catch (error: any) {
      console.error("Error during service fetch or transformation:", error);
      toast.error("Error fetching services: " + error.message);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
        fetchProviderServices();
    }
  }, [user?.id]);

  const handleGetLocation = async () => {
    if (isFetchingGeoLocation) return;
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingGeoLocation(true);
    const toastId = toast.loading("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geoApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const response = await fetch(geoApiUrl);
          if (!response.ok) throw new Error("Failed to reverse geocode.");
          const data = await response.json();
          const addr = data.address;
          const locationName = [addr.city, addr.town, addr.village, addr.municipality, addr.state_district, addr.state]
            .filter(Boolean).slice(0, 3).join(", ");
          if (locationName) {
            setLocation(locationName);
            toast.success(`Location set to ${locationName}`, { id: toastId });
          } else {
            toast.error("Could not determine location name.", { id: toastId });
          }
        } catch (err: any) {
          toast.error(err.message, { id: toastId });
        } finally {
          setIsFetchingGeoLocation(false);
        }
      },
      (geoError) => {
        toast.error(`Geolocation error: ${geoError.message}`, { id: toastId });
        setIsFetchingGeoLocation(false);
      }
    );
  };

  const handleServiceEntryChange = (index: number, field: 'service' | 'price', value: string) => {
    const newEntries = [...serviceEntries];
    newEntries[index][field] = value;
    setServiceEntries(newEntries);
  };

  const addServiceEntry = () => {
    setServiceEntries([...serviceEntries, { service: "", price: "" }]);
  };

  const removeServiceEntry = (index: number) => {
    const newEntries = serviceEntries.filter((_, i) => i !== index);
    setServiceEntries(newEntries);
  };
  
  const resetForm = () => {
      setEditingService(null);
      setShopName("");
      setLocation("");
      setCategory("");
      setDescription("");
      setImageFile(null);
      setImageUrlPreview(null);
      setServiceEntries([{ service: "", price: "" }]);
  }

  const openAddModal = () => {
    resetForm();
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (service: ServiceResource) => {
    setEditingService(service);
    setShopName(service.shop_name);
    setLocation(service.location);
    setCategory(service.category);
    setDescription(service.description || "");
    setImageUrlPreview(service.image_url || null);
    setImageFile(null);
    const entries = service.services.map(s => ({
      service: s,
      price: service.prices[s]?.toString() || ""
    }));
    setServiceEntries(entries.length > 0 ? entries : [{ service: "", price: "" }]);
    setIsAddEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in.");
    setIsSubmitting(true);

    let finalImageUrl = editingService?.image_url || null;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(filePath, imageFile);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from('service-images').getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      const services = serviceEntries.map(entry => entry.service.trim()).filter(Boolean);
      const prices = serviceEntries.reduce((acc, entry) => {
        if (entry.service.trim() && entry.price.trim()) {
          acc[entry.service.trim()] = parseFloat(entry.price);
        }
        return acc;
      }, {} as Record<string, number>);

      if (services.length === 0) throw new Error("Please add at least one service with name and price.");
      if (Object.keys(prices).length !== services.length) throw new Error("Each service must have a valid price.");

      const payload = { 
        shop_name: shopName,
        location,
        category,
        description,
        image_url: finalImageUrl,
        services,
        prices,
        provider_id: user.id,
      };

      const isEditing = !!editingService;
      const url = isEditing ? `${API_BASE}/service/${editingService.id}` : `${API_BASE}/service`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} service.`);

      toast.success(`Service ${isEditing ? 'updated' : 'created'} successfully!`);
      setIsAddEditModalOpen(false);
      resetForm();
      fetchProviderServices();

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSlotsModal = (service: ServiceResource) => {
    setSelectedServiceForSlots(service);
    setAllSlotsData(service.available_slots || {});
    setSelectedDate(new Date());
    setIsSlotsModalOpen(true);
  };

  useEffect(() => {
    if (selectedDate && allSlotsData) {
      const ymd = toYMD(selectedDate);
      setSlotsForSelectedDate(allSlotsData[ymd] || []);
    } else {
      setSlotsForSelectedDate([]);
    }
  }, [selectedDate, allSlotsData]);


  const handleAddSlot = () => {
    if (!newSlotTime.match(/^\d{1,2}:\d{2}(\s?[AP]M)?$/i)) {
      toast.error("Invalid time format. Use HH:MM or HH:MM AM/PM.");
      return;
    }
    if (!selectedDate) return;

    const ymd = toYMD(selectedDate);
    const currentTimeSlots = allSlotsData[ymd] || [];

    if (currentTimeSlots.includes(newSlotTime)) {
        toast.warning("This slot already exists for this date.");
        return;
    }

    const updatedSlotsForDate = [...currentTimeSlots, newSlotTime].sort();

    setAllSlotsData(prev => ({
      ...prev,
      [ymd]: updatedSlotsForDate
    }));
    setNewSlotTime("");
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    if (!selectedDate) return;
    const ymd = toYMD(selectedDate);
    const updatedSlotsForDate = (allSlotsData[ymd] || []).filter(slot => slot !== slotToRemove);

    setAllSlotsData(prev => ({
      ...prev,
      [ymd]: updatedSlotsForDate
    }));
  };

  const handleSaveSlots = async () => {
      if (!selectedServiceForSlots || !user?.id) return;
      setIsUpdatingSlots(true);
      try {
          const payload = {
              available_slots: allSlotsData,
              provider_id: user.id
          };
          const response = await fetch(`${API_BASE}/service/${selectedServiceForSlots.id}/slots`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (!response.ok) {
              throw new Error(result.error || "Failed to update slots.");
          }
          toast.success("Available slots updated successfully!");
          setIsSlotsModalOpen(false);
          fetchProviderServices();
      } catch (error: any) {
          toast.error("Error saving slots: " + error.message);
      } finally {
          setIsUpdatingSlots(false);
      }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold">Service Management</h3>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-hover w-full sm:w-auto" onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>
      <Card className="p-4 sm:p-6 shadow-card animate-fade-in-up">
        {loadingServices ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : services.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">You haven't added any services yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="p-4 border border-border rounded-lg hover:shadow-card transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{service.shop_name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{service.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{service.location}</p>
                   <p className="text-xs text-muted-foreground mb-3 truncate">{service.description || "No description"}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2 border-t border-border/50">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => openEditModal(service)}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => openSlotsModal(service)}>
                    <CalendarDays className="h-4 w-4" /> Slots
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit Service Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-lg w-[90vw] rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>{editingService ? "Update the details for this service listing." : "Fill out the details for your new service listing."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <Input placeholder="Shop Name" value={shopName} onChange={e => setShopName(e.target.value)} required />
            <div className="relative">
              <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={handleGetLocation} disabled={isFetchingGeoLocation}>
                {isFetchingGeoLocation ? <Loader2 className="h-4 w-4 animate-spin"/> : <LocateFixed className="h-4 w-4" />}
              </Button>
            </div>
            <Select onValueChange={setCategory} value={category} required>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="salon">Salon</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div>
              <label className="text-sm font-medium">Shop Image</label>
              {imageUrlPreview && !imageFile && <img src={imageUrlPreview} alt="Current shop" className="mt-2 h-20 w-auto rounded"/>}
              <Input type="file" accept="image/*" onChange={e => { setImageFile(e.target.files ? e.target.files[0] : null); setImageUrlPreview(null); }} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Leave blank to keep existing image when editing.</p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-medium">Services & Prices</h4>
              {serviceEntries.map((entry, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
                  <Input placeholder={`Service Name ${index + 1}`} value={entry.service} onChange={e => handleServiceEntryChange(index, 'service', e.target.value)} required/>
                  <Input type="number" step="0.01" placeholder="Price" value={entry.price} onChange={e => handleServiceEntryChange(index, 'price', e.target.value)} required/>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeServiceEntry(index)} disabled={serviceEntries.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addServiceEntry}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setIsAddEditModalOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" className="bg-gradient-primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {editingService ? "Update Service" : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Slots Modal */}
      <Dialog open={isSlotsModalOpen} onOpenChange={setIsSlotsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-[90vw] rounded-lg">
           <DialogHeader>
                <DialogTitle>Manage Available Slots</DialogTitle>
                <DialogDescription>
                    Select a date and add or remove available time slots for "{selectedServiceForSlots?.shop_name}".
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                   <h4 className="font-medium mb-2 text-center">Select Date</h4>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                        className="rounded-md border flex justify-center"
                    />
                </div>
                <div>
                    <h4 className="font-medium mb-2">
                        Slots for {selectedDate ? selectedDate.toLocaleDateString() : 'selected date'}
                    </h4>
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="Add time (e.g., 10:00 AM)"
                            value={newSlotTime}
                            onChange={e => setNewSlotTime(e.target.value)}
                        />
                        <Button onClick={handleAddSlot} disabled={!newSlotTime.trim() || !selectedDate}>Add</Button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-muted/50">
                        {slotsForSelectedDate.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground">No slots added for this date.</p>
                        ) : (
                            slotsForSelectedDate.map(slot => (
                                <div key={slot} className="flex items-center justify-between bg-background p-2 rounded text-sm">
                                    <span>{slot}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveSlot(slot)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
             <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsSlotsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveSlots} className="bg-gradient-primary" disabled={isUpdatingSlots}>
                    {isUpdatingSlots && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Slots
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServicesView;

