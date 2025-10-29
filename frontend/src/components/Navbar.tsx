import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarCheck, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/services" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BookEase
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/services">
              <Button 
                variant={isActive("/services") ? "default" : "ghost"} 
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Services</span>
              </Button>
            </Link>
            <Link to="/bookings">
              <Button 
                variant={isActive("/bookings") ? "default" : "ghost"} 
                size="sm"
                className="gap-2"
              >
                <CalendarCheck className="h-4 w-4" />
                <span className="hidden sm:inline">My Bookings</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
