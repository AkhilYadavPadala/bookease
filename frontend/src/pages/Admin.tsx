import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Settings,
  BarChart3,
  LayoutDashboard,
  CalendarClock
} from "lucide-react";

// Import the new view components
import DashboardView from "./admin/DashboardView";
import AppointmentsView from "./admin/AppointmentsView";
import ServicesView from "./admin/ServicesView";
import { useAuth } from "@/context/Authcontext"; // Make sure the path is correct

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarClock },
  // { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "services", label: "Services", icon: Settings },
];

// Helper to render the correct component based on the active section
const renderActiveSection = (activeSection: string) => {
  switch (activeSection) {
    case "dashboard":
      return <DashboardView />;
    case "appointments":
      return <AppointmentsView />;
    case "services":
      return <ServicesView />;
    default:
      return <DashboardView />;
  }
};

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  // ✅ Correctly call the useAuth hook inside the component
  const { user } = useAuth(); 

  // ✅ Create a user-friendly display name
  // It checks for a full name in metadata, then falls back to email, then to 'Admin'.
  const userName = user?.user_metadata?.full_name || user?.email || 'Admin';

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card/50 backdrop-blur-sm border-r border-border p-6 hidden lg:block animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage everything</p>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === item.id
                  ? "bg-gradient-primary text-white shadow-hover"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <Card className="p-2 shadow-hover bg-card/80 backdrop-blur-lg">
          <div className="flex justify-around gap-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={activeSection === item.id ? "default" : "ghost"}
                onClick={() => setActiveSection(item.id)}
                className={`flex-1 ${activeSection === item.id ? "bg-gradient-primary" : ""}`}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-24 lg:pb-0">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {sidebarItems.find(item => item.id === activeSection)?.label}
              </h1>
              {/* ✅ Use the dynamic userName variable */}
              <p className="text-muted-foreground">Welcome back, {userName}!</p>
            </div>
            {/* {activeSection === "services" && (
              <Button className="bg-gradient-primary hover:opacity-90 shadow-hover">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            )} */}
          </div>
          
          {/* Render the active component */}
          {renderActiveSection(activeSection)}

        </div>
      </div>
    </div>
  );
};

export default Admin;