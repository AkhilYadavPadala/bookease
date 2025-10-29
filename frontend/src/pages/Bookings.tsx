import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "../context/Authcontext";
import { API_BASE } from "../config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const API_BASE_URL = API_BASE;

// ✅ --- NEW SKELETON COMPONENT ---
// This component mimics the layout of your BookingCard for a smooth loading experience.
const BookingCardSkeleton = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-48 h-48 md:h-auto bg-muted" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded-md" />
            <div className="h-5 w-24 bg-muted rounded-md" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="h-4 w-3/4 bg-muted rounded-md" />
          <div className="h-4 w-3/4 bg-muted rounded-md" />
          <div className="h-4 w-full bg-muted rounded-md" />
          <div className="h-4 w-full bg-muted rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="h-9 w-24 bg-muted rounded-md" />
          <div className="h-9 w-24 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  </Card>
);


const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const user_id = user?.id; // Safely access user.id

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user_id) {
        console.log("No user_id found, waiting for auth context...");
        setLoading(false); // Stop loading if no user
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/${user_id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        setBookings(data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]); // Clear bookings on error
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user_id]);

  const upcomingBookings = bookings.filter(b => b.status === "confirmed" || b.status === "pending");
  const pastBookings = bookings.filter(b => b.status === "completed" || b.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-primary text-primary-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      case "cancelled": return "bg-destructive text-destructive-foreground";
      case "pending": return "bg-yellow-500 text-black";
      default: return "bg-secondary";
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="overflow-hidden hover:shadow-hover transition-all duration-300 shadow-card">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto">
          <img
            src={booking.resources?.image_url || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400"}
            alt={booking.resources?.shop_name || "Service"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{booking.resources?.shop_name || "Service"}</h3>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{booking.booked_slot}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{booking.resources?.location || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{booking.resources?.contact_number || "N/A"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {booking.status === "confirmed" && (
              <>
                <Button variant="outline" size="sm">Reschedule</Button>
                <Button variant="destructive" size="sm">Cancel</Button>
              </>
            )}
            {booking.status === "completed" && (
              <Button variant="outline" size="sm">Book Again</Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedBooking(booking);
                setOpen(true);
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your appointments</p>
        </div>

        {/* ✅ MODIFIED: Swapped simple text for the skeleton loader */}
        {loading ? (
          <div className="space-y-4">
            <BookingCardSkeleton />
            <BookingCardSkeleton />
            <BookingCardSkeleton />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold">No bookings found.</h3>
            <p className="text-muted-foreground mt-2">Time to book a new service!</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6" onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="animate-fade-in-up">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {bookings.map((booking, index) => (
                <div key={booking.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <BookingCard booking={booking} />
                </div>
              ))}
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.map((booking, index) => (
                <div key={booking.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <BookingCard booking={booking} />
                </div>
              ))}
            </TabsContent>
            <TabsContent value="past" className="space-y-4">
              {pastBookings.map((booking, index) => (
                <div key={booking.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <BookingCard booking={booking} />
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Full information about your appointment
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="font-semibold">Services:</p>
                <p>{selectedBooking.selected_services?.join(", ") || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Date:</p>
                <p>{new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">Time:</p>
                <p>{selectedBooking.booked_slot}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status.charAt(0).toUpperCase() +
                    selectedBooking.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="font-semibold">Total Price:</p>
                <p>₹{selectedBooking.total_price || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Location:</p>
                <p>{selectedBooking.resources?.location || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Contact:</p>
                <p>{selectedBooking.resources?.contact_number || "N/A"}</p>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;