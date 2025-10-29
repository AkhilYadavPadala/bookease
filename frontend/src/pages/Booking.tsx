// Booking.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Clock, MapPin, Star, Check, PartyPopper, CalendarCheck, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "../context/Authcontext";

// ✅ UPDATED: Added new optional fields for richer details
type Resource = {
  id: string;
  shop_name: string;
  location?: string;
  category?: string;
  description?: string;
  image_url?: string;
  services?: string[];
  prices?: Record<string, number | string>;
  rating?: number;
  reviews_count?: number;
  duration?: string;
  price_range?: string; // e.g., "$", "$$", "$$$"
};

type DaySlots = {
  id: string | null;
  resource_id: string;
  date: string; // YYYY-MM-DD
  time_slots: string[];
};

const api = {
  getResource: async (id: string): Promise<Resource> => {
    const res = await fetch(`http://localhost:3000/service/${id}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error("Resource not found");
      throw new Error("Failed to fetch resource details");
    }
    return res.json();
  },

  getDaySlots: async (resource_id: string, date: string): Promise<DaySlots> => {
    const url = `http://localhost:3000/slots/day?resource_id=${encodeURIComponent(resource_id)}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch slots");
    return res.json();
  },

  createBooking: async (body: {
    user_id: string;
    resource_id: string;
    selected_services: string[];
    booking_date: string;
    booked_slot: string;
  }) => {
    const res = await fetch(`http://localhost:3000/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Booking failed");
    }
    return res.json();
  },
};

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const Booking = () => {
  const { user } = useAuth();
  const { id: resourceIdParam } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [daySlots, setDaySlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [resource, setResource] = useState<Resource | null>(null);
  const [loadingResource, setLoadingResource] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [bookingSummary, setBookingSummary] = useState<{
    shop_name: string;
    service_name: string;
    booked_slot: string;
    booked_date: string;
    total_price: number;
  } | null>(null);

  const resourceId = resourceIdParam ?? "";

  useEffect(() => {
    if (!resourceId) {
        setLoadingResource(false);
        toast.error("No resource ID provided.");
        return;
    }
    let active = true;
    (async () => {
      try {
        setLoadingResource(true);
        const res = await api.getResource(resourceId);
        if (!active) return;
        setResource(res);
      } catch (e: any) {
        if (!active) return;
        toast.error(e?.message || "Failed to load resource");
        setResource(null);
      } finally {
        if (active) setLoadingResource(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [resourceId]);

  useEffect(() => {
    if (!date || !resourceId) return;
    let active = true;
    (async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot("");
        const ymd = toYMD(date);
        const payload = await api.getDaySlots(resourceId, ymd);
        if (!active) return;
        setDaySlots(payload.time_slots || []);
      } catch (e: any) {
        setDaySlots([]);
      } finally {
        if (active) setLoadingSlots(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [date, resourceId]);

  const servicesAvailable = useMemo<string[]>(() => {
    return resource?.services ?? [];
  }, [resource]);

  const formattedDate =
    date
      ? new Intl.DateTimeFormat(undefined, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date)
      : "";

  const handleToggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }
    if (!user) {
      toast.error("You must be signed in to make a booking.");
      navigate('/auth');
      return;
    }
    try {
      const user_id = user.id;
      const booking_date = toYMD(date);

      const res = await api.createBooking({
        user_id,
        resource_id: resourceId,
        selected_services: selectedServices,
        booking_date,
        booked_slot: selectedSlot,
      });

      const total_price = Number(res.total_price ?? 0);
      const shop_name = resource?.shop_name ?? "Unknown Shop";
      const service_name = selectedServices.join(", ");
      const booked_slot = selectedSlot;
      const booked_date = formattedDate;

      setBookingSummary({
        shop_name,
        service_name,
        booked_slot,
        booked_date,
        total_price,
      });
      setShowSuccessModal(true);
      toast.success("Booking confirmed");
    } catch (e: any) {
      toast.error(e?.message || "Booking failed");
    }
  };

  // ✅ UPDATED: Skeleton loader now includes placeholders for the new details
  const ServiceDetailsSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="bg-muted h-48 w-full rounded-lg"></div>
        <div className="bg-muted h-8 w-3/4 rounded"></div>
        <div className="flex items-center gap-2">
            <div className="bg-muted h-5 w-5 rounded-full"></div>
            <div className="bg-muted h-5 w-24 rounded"></div>
        </div>
        <div className="bg-muted h-5 w-full rounded"></div>
        <div className="space-y-2 pt-4">
            <div className="bg-muted h-4 w-full rounded"></div>
            <div className="bg-muted h-4 w-5/6 rounded"></div>
        </div>
        <div className="space-y-3 border-t pt-4 mt-4">
            <div className="bg-muted h-5 w-full rounded"></div>
            <div className="bg-muted h-5 w-full rounded"></div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 p-6 h-fit animate-fade-in shadow-card">
            {loadingResource ? (
                <ServiceDetailsSkeleton />
            ) : resource ? (
                <>
                    {resource.image_url && (
                        <img
                        src={resource.image_url}
                        alt={resource.shop_name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                    )}
                    <h2 className="text-2xl font-bold mb-2">{resource.shop_name}</h2>
                    
                    {/* ✅ FIX: Display rating and reviews from API */}
                    {typeof resource.rating === 'number' && (
                      <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-medium">{resource.rating.toFixed(1)}</span>
                          {typeof resource.reviews_count === 'number' && (
                              <span className="text-muted-foreground">({resource.reviews_count} reviews)</span>
                          )}
                      </div>
                    )}

                    {resource.location && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <MapPin className="h-4 w-4" />
                            <span>{resource.location}</span>
                        </div>
                    )}
                    {resource.description && (
                        <p className="text-muted-foreground mb-4">
                            {resource.description}
                        </p>
                    )}

                    {/* ✅ FIX: Display duration and price range from API */}
                    <div className="space-y-2 border-t pt-4 mt-4">
                        {resource.duration && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">{resource.duration}</span>
                            </div>
                        )}
                        {resource.price_range && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Price Range</span>
                                <span className="font-medium">{resource.price_range}</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>Sorry, this service could not be found.</p>
                </div>
            )}
            </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 animate-fade-in-up shadow-card">
              <h3 className="text-xl font-semibold mb-4">Select Date</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                className="rounded-lg border"
              />
            </Card>

            <Card className="p-6 animate-fade-in-up shadow-card" style={{ animationDelay: "60ms" }}>
              <h3 className="text-xl font-semibold mb-4">Select Services</h3>
              <div className="flex flex-wrap gap-2">
                {servicesAvailable.length > 0 ? (
                    servicesAvailable.map((svc) => {
                    const active = selectedServices.includes(svc);
                    return (
                        <Button
                        key={svc}
                        variant={active ? "default" : "outline"}
                        onClick={() => handleToggleService(svc)}
                        className={active ? "bg-gradient-primary" : ""}
                        >
                        {svc}
                        </Button>
                    );
                    })
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {loadingResource ? "Loading services..." : "No services available for this provider."}
                    </p>
                )}
              </div>
            </Card>

            <Card className="p-6 animate-fade-in-up shadow-card" style={{ animationDelay: "100ms" }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Available Time Slots
              </h3>
              {loadingSlots ? (
                <div className="text-muted-foreground">Loading slots…</div>
              ) : daySlots.length === 0 ? (
                <div className="text-muted-foreground">No slots available for the selected date.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {daySlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      onClick={() => setSelectedSlot(slot)}
                      className={`relative ${selectedSlot === slot ? "bg-gradient-primary" : ""}`}
                    >
                      {slot}
                      {selectedSlot === slot && (
                        <Check className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white rounded-full p-0.5" />
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 bg-gradient-card animate-fade-in-up shadow-card" style={{ animationDelay: "200ms" }}>
              <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shop</span>
                  <span className="font-medium">{resource?.shop_name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{selectedServices.length ? selectedServices.join(", ") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formattedDate || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedSlot || "Not selected"}</span>
                </div>
                {bookingSummary && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-semibold">
                      {Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }).format(bookingSummary.total_price)}
                    </span>
                  </div>
                )}
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-primary hover:opacity-90 shadow-hover"
                onClick={handleBooking}
                disabled={!resource || !selectedSlot || !date || selectedServices.length === 0}
              >
                Confirm Booking
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent
          className="
            sm:max-w-md
            max-h-[90dvh] overflow-y-auto
            border-none bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-xl
            p-0
          "
        >
          <div className="text-center space-y-6 py-6 animate-scale-in px-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse opacity-20"></div>
              <div className="relative bg-gradient-primary rounded-full w-24 h-24 flex items-center justify-center shadow-hover">
                <CalendarCheck className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <PartyPopper className="h-8 w-8 text-accent animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Booking Confirmed!
              </h3>
              <p className="text-muted-foreground">Appointment scheduled successfully.</p>
            </div>

            <Card className="p-5 bg-secondary/50 border-primary/20 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Service
                </span>
                <span className="font-semibold">
                  {bookingSummary?.service_name || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date
                </span>
                <span className="font-semibold">{bookingSummary?.booked_date || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </span>
                <span className="font-semibold">{bookingSummary?.booked_slot || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  Shop
                </span>
                <span className="font-semibold">{bookingSummary?.shop_name || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  Total
                </span>
                <span className="font-semibold">
                  {bookingSummary
                    ? Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }).format(bookingSummary.total_price)
                    : "-"}
                </span>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/services");
                }}
              >
                Book Another
              </Button>
              <Button
                className="flex-1 bg-gradient-primary hover:opacity-90 shadow-hover"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/bookings");
                }}
              >
                View My Bookings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Booking;