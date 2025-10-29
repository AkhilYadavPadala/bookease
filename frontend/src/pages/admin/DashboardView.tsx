import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Clock,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Data (Static for now, but structured for dynamic replacement) ---

const mainStats = [
  { label: "Today's Bookings", value: "12", change: "+5%", icon: Calendar, color: "text-blue-500" },
  { label: "Weekly Revenue", value: "$2,150", change: "+18%", icon: DollarSign, color: "text-green-500" },
  { label: "New Clients", value: "8", change: "-3%", icon: Users, color: "text-purple-500" },
  { label: "Avg. Rating", value: "4.9", change: "+0.1", icon: TrendingUp, color: "text-yellow-500" },
];

const bookingChartData = [
  { day: "Mon", bookings: 18 },
  { day: "Tue", bookings: 22 },
  { day: "Wed", bookings: 25 },
  { day: "Thu", bookings: 19 },
  { day: "Fri", bookings: 30 },
  { day: "Sat", bookings: 45 },
  { day: "Sun", bookings: 35 },
];

const upcomingAppointments = [
  { id: 1, client: "John Doe", service: "Haircut & Beard Trim", time: "10:00 AM", initial: "JD" },
  { id: 2, client: "Jane Smith", service: "Color Treatment", time: "11:30 AM", initial: "JS" },
  { id: 3, client: "Mike Johnson", service: "Deep Tissue Massage", time: "02:00 PM", initial: "MJ" },
];

const popularServices = [
    { name: "Haircut", percentage: 85 },
    { name: "Color Treatment", percentage: 70 },
    { name: "Styling", percentage: 55 },
    { name: "Beard Trim", percentage: 40 },
]

// --- Main Component ---

const DashboardView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card 
            key={index}
            className="p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-scale-in shadow-card"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <div className={`p-3 bg-muted rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
             <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} vs last week
            </p>
          </Card>
        ))}
      </div>

      {/* Main Grid: Charts and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Trends Chart */}
        <Card className="lg:col-span-2 p-6 shadow-card animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <h3 className="text-xl font-semibold mb-4">Booking Trends (Last 7 Days)</h3>
          <div className="h-72 w-full">
             <BarChart bookings={bookingChartData} />
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="p-6 shadow-card animate-fade-in-up" style={{animationDelay: '150ms'}}>
          <h3 className="text-xl font-semibold mb-4">Upcoming Today</h3>
          <div className="space-y-4">
            {upcomingAppointments.map(app => (
              <div key={app.id} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {app.initial}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{app.client}</div>
                  <div className="text-sm text-muted-foreground">{app.service}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{app.time}</span>
                </div>
              </div>
            ))}
             <Button variant="outline" className="w-full mt-4">View All Appointments</Button>
          </div>
        </Card>
      </div>
      
      {/* Popular Services and Revenue */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Popular Services */}
        <Card className="lg:col-span-2 p-6 shadow-card animate-fade-in-up" style={{animationDelay: '200ms'}}>
          <h3 className="text-xl font-semibold mb-4">Popular Services</h3>
          <div className="space-y-4">
            {popularServices.map((service) => (
              <div key={service.name} className="flex items-center justify-between gap-4">
                <span className="font-medium truncate flex-1">{service.name}</span>
                <div className="w-1/2 bg-secondary rounded-full h-2.5">
                  <div className="bg-gradient-primary h-2.5 rounded-full" style={{ width: `${service.percentage}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-muted-foreground w-12 text-right">{service.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Overview Placeholder */}
        <Card className="p-6 shadow-card animate-fade-in-up" style={{animationDelay: '250ms'}}>
           <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
           <div className="h-48 flex items-center justify-center bg-secondary/30 rounded-lg">
             <TrendingUp className="h-16 w-16 text-muted-foreground" />
             <span className="ml-4 text-muted-foreground">Chart Placeholder</span>
           </div>
        </Card>
      </div>

    </div>
  );
};

// --- SVG Bar Chart Component ---
const BarChart = ({ bookings }: { bookings: { day: string; bookings: number }[] }) => {
  const maxBookings = Math.max(...bookings.map(b => b.bookings), 0) + 5;
  
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 200" className="font-sans">
      {/* Y-Axis Lines and Labels */}
      {[0, 0.25, 0.5, 0.75, 1].map(multiple => {
        const y = 180 - (multiple * 170);
        const value = Math.round(maxBookings * multiple);
        return (
          <g key={multiple}>
            <line x1="30" y1={y} x2="390" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" />
            <text x="25" y={y + 3} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">
              {value}
            </text>
          </g>
        );
      })}
      
      {/* Bars and X-Axis Labels */}
      {bookings.map((item, index) => {
        const barHeight = (item.bookings / maxBookings) * 170;
        const x = 40 + index * 50;
        return (
          <g key={item.day}>
            <rect 
              x={x} 
              y={180 - barHeight} 
              width="30" 
              height={barHeight} 
              fill="url(#barGradient)" 
              rx="3"
            />
            <text x={x + 15} y="195" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
              {item.day}
            </text>
          </g>
        );
      })}
      
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.5)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default DashboardView;

