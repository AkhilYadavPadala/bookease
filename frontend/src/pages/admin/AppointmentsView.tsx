import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useAuth } from "../../context/Authcontext";
import { toast } from "sonner";

// Interface for appointment data
interface AdminAppointment {
  id: number;
  users: { full_name: string } | null;
  resources: { shop_name: string } | null;
  selected_services: string[] | string;
  booking_date: string;
  booked_slot: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000';

// Helper function to handle the 'selected_services' data format.
const formatServices = (services: string[] | string | null | undefined): string => {
  if (!services) return 'No service specified';
  if (Array.isArray(services)) return services.join(', ');
  if (typeof services === 'string') {
    return services.replace(/[{}"']/g, '').split(',').map(s => s.trim()).join(', ');
  }
  return 'Invalid service format';
};

const AppointmentsView = () => {
  const { user } = useAuth();
  const [adminAppointments, setAdminAppointments] = useState<AdminAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const fetchAdminAppointments = async () => {
        setLoadingAppointments(true);
        setAppointmentsError(null);
        try {
          const providerId = user.id;
          const response = await fetch(`${API_BASE}/bookings/appointments/${providerId}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch appointments: ${response.statusText}`);
          }

          const data: AdminAppointment[] = await response.json();
          setAdminAppointments(data || []);
        } catch (err: any) {
          console.error("Error fetching admin appointments:", err);
          const errorMessage = err.message || "An unknown error occurred.";
          setAppointmentsError(errorMessage);
          toast.error(`Could not load appointments: ${errorMessage}`);
          setAdminAppointments([]);
        } finally {
          setLoadingAppointments(false);
        }
      };
      fetchAdminAppointments();
    }
  }, [user?.id]);

  const handleViewDetails = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <Card className="p-6 shadow-card animate-fade-in-up">
        <h3 className="text-xl font-semibold mb-4">All Appointments</h3>
        
        {loadingAppointments && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading appointments...</span>
          </div>
        )}

        {!loadingAppointments && appointmentsError && (
          <div className="text-center py-10 text-destructive">
            <p className="font-semibold">Error loading appointments:</p>
            <p className="text-sm mt-1">{appointmentsError}</p>
          </div>
        )}

        {!loadingAppointments && !appointmentsError && (
          <div className="space-y-3">
            {adminAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No appointments found.</p>
            ) : (
              adminAppointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                      {appointment.users?.full_name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                    </div>
                    <div>
                      <div className="font-semibold">{appointment.users?.full_name || 'Unknown Client'}</div>
                      <div className="text-sm text-muted-foreground">{formatServices(appointment.selected_services)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(appointment.booking_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      {appointment.booked_slot}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs text-center font-medium ${appointment.status === 'confirmed' ? 'bg-primary/20 text-primary' : appointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' : appointment.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-destructive/20 text-destructive'}`}>
                      {appointment.status}
                    </span>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-8" onClick={() => handleViewDetails(appointment)}>View</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Full details for the selected appointment.</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1"><span className="text-sm font-medium text-muted-foreground">Client Name</span><span className="font-semibold">{selectedAppointment.users?.full_name || 'N/A'}</span></div>
              <div className="flex flex-col space-y-1"><span className="text-sm font-medium text-muted-foreground">Shop</span><span className="font-semibold">{selectedAppointment.resources?.shop_name || 'N/A'}</span></div>
              <div className="flex flex-col space-y-1"><span className="text-sm font-medium text-muted-foreground">Services</span><span className="font-semibold">{formatServices(selectedAppointment.selected_services)}</span></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1"><span className="text-sm font-medium text-muted-foreground">Date</span><span className="font-semibold">{new Date(selectedAppointment.booking_date).toLocaleDateString()}</span></div>
                <div className="flex flex-col space-y-1"><span className="text-sm font-medium text-muted-foreground">Time</span><span className="font-semibold">{selectedAppointment.booked_slot}</span></div>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span className={`w-fit px-3 py-1 rounded-full text-xs text-center font-medium ${selectedAppointment.status === 'confirmed' ? 'bg-primary/20 text-primary' : selectedAppointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' : selectedAppointment.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-destructive/20 text-destructive'}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentsView;
