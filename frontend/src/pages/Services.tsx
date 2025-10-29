import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, ArrowRight, LocateFixed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

// Backend base URL
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000';

// --- INTERFACES ---
interface Resource {
  id: string; 
  shop_name: string;
  location: string;
  category: string;
  description: string | null;
  image_url: string | null;
}

interface DisplayService {
  id: string;
  name: string;
  category: string;
  rating: number; 
  reviews: number; 
  distance: string; 
  location: string;
  price: string; 
  image: string;
  description: string;
  availability: string;
}

const categories = [
  { id: "all", name: "All Services" },
  { id: "salon", name: "Salon & Spa" },
  { id: "healthcare", name: "Healthcare" }, 
  { id: "restaurant", name: "Dining" },
  { id: "fitness", name: "Fitness" }, 
];

const ServiceCardSkeleton = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="bg-muted h-48 w-full" />
    <div className="p-5 space-y-3">
      <div className="h-6 w-3/4 bg-muted rounded-md"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded-md"></div>
        <div className="h-4 w-5/6 bg-muted rounded-md"></div>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <div className="h-5 w-24 bg-muted rounded-md"></div>
        <div className="h-5 w-20 bg-muted rounded-md"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/2 bg-muted rounded-md"></div>
        <div className="h-9 w-28 bg-muted rounded-md"></div>
      </div>
    </div>
  </Card>
);


const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationInput, setLocationInput] = useState("");
  
  const [resources, setResources] = useState<Resource[]>([]);
  // loading state for fetching services (shows skeleton)
  const [loadingServices, setLoadingServices] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  // ✅ State to prevent multiple geolocation requests
  const [isFetchingGeoLocation, setIsFetchingGeoLocation] = useState(false); 

  const navigate = useNavigate();

  const handleGetLocation = async () => {
    if (isFetchingGeoLocation) {
      toast.info("Already fetching location...");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingGeoLocation(true);
    const loadingToastId = toast.loading("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let finalToastId = loadingToastId;
        try {
          const geoApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const response = await fetch(geoApiUrl);

          if (!response.ok) {
            throw new Error(`Failed to fetch location details (status: ${response.status})`);
          }

          const data = await response.json();
          const address = data.address;

          // ✅ --- NEW LOGIC: Combine location parts ---
          const locationParts = [
            address.city,
            address.town,
            address.village,
            address.municipality,
            address.state_district, // e.g., West Godavari
            address.state,          // e.g., Andhra Pradesh
            // You could add address.country here if needed
          ];

          // Filter out null/undefined parts and take the first 3 available
          const existingParts = locationParts.filter(part => part != null).slice(0, 3);

          let locationName = "";
          if (existingParts.length > 0) {
            locationName = existingParts.join(", "); // Join with comma and space
          }
          // --- END NEW LOGIC ---

          if (locationName) {
            setLocationInput(locationName);
            toast.success(`Location set to ${locationName}`, { id: loadingToastId });
            finalToastId = '';
          } else {
            console.warn("Could not determine location name parts from API response:", data);
            toast.error("Could not determine a location name.", { id: loadingToastId });
            finalToastId = '';
          }
        } catch (err: any) {
          console.error("Reverse geocoding error:", err);
          toast.error(`Failed to get location details: ${err.message}`, { id: loadingToastId });
          finalToastId = '';
        } finally {
          if (finalToastId) toast.dismiss(finalToastId);
          setIsFetchingGeoLocation(false);
        }
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        let message = "Unable to retrieve your location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message = "Location permission denied.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (geoError.code === geoError.TIMEOUT) {
          message = "Request for user location timed out.";
        }
        toast.error(message, { id: loadingToastId });
        setIsFetchingGeoLocation(false);
      }
    );
  };

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingServices(true); // Use dedicated loading state for services
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchQuery && searchQuery.trim().length > 0) params.set('search', searchQuery.trim());
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
        if (locationInput && locationInput.trim().length > 0) params.set('location', locationInput.trim());

        const url = `${API_BASE}/service${params.toString() ? `?${params.toString()}` : ''}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Backend error ${resp.status}: ${text}`);
        }
        
        const jsonResponse = await resp.json();
        const dataArray = Array.isArray(jsonResponse) ? jsonResponse : jsonResponse.data || [];

        if (!Array.isArray(dataArray)) {
          console.error("API did not return a valid array:", jsonResponse);
          throw new Error("Invalid data format received from server.");
        }

        setResources(dataArray as Resource[]);
        
      } catch (err: any) {
        console.error('[Services] Fetch error:', err);
        setError("Failed to load services: " + err.message);
        setResources([]);
      } finally {
        setLoadingServices(false); // Update service loading state
      }
    };

    // Use debounce only for search and location input, not category change
    const debounceDelay = (searchQuery || locationInput) ? 300 : 0; 
    const delayDebounceFn = setTimeout(() => {
      fetchResources();
    }, debounceDelay);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchQuery, locationInput]); 

  // ... (displayServices mapping logic remains the same) ...
  const displayServices: DisplayService[] = resources
    .map(resource => ({
      id: resource.id,
      name: resource.shop_name,
      category: resource.category,
      location: resource.location,
      description: resource.description || "No description provided.",
      image: resource.image_url || "https://images.unsplash.com/photo-1557424628-9c595304a95a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNTkyMzF8MHwxfGFsbHx8fHx8fHx8fDE2NzI5MzQzMDQ&ixlib=rb-4.0.3&q=80&w=400",
      rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)), 
      reviews: Math.floor(Math.random() * 500) + 100, 
      distance: (Math.random() * 3).toFixed(1) + " km", 
      price: (resource.category === 'healthcare' || resource.category === 'salon') ? '$$$' : '$$', 
      availability: (Math.random() > 0.5) ? "Available Today" : "Next available: Tomorrow", 
    }))
    .filter(service => {
        if (selectedCategory === 'fitness') {
            return service.category === 'fitness';
        }
        return true; 
    });


  const selectedCategoryLabel = categories.find(c => c.id === selectedCategory)?.name || "All Services";
  const trimmedQuery = (searchQuery || '').trim();
  let emptyStateMessage = trimmedQuery
    ? `No services found for "${trimmedQuery}" in ${selectedCategoryLabel}.`
    : `No services found in ${selectedCategoryLabel}.`;
  
   if (locationInput && locationInput.toLowerCase() !== 'current location') {
     emptyStateMessage += ` near ${locationInput}`;
   }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
            <p className="text-xl font-medium text-red-500">{error}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* ... (Header and Search/Location inputs remain the same) ... */}
         <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Discover Services</h1>
          <p className="text-muted-foreground">Find and book the perfect service near you</p>
        </div>
        <div className="mb-8 flex flex-col md:flex-row gap-4 animate-fade-in-up">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search services, shops, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="md:w-72 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Enter location..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="pl-10 pr-12 h-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-primary"
              onClick={handleGetLocation}
              title="Use current location"
              // ✅ Disable button while fetching
              disabled={isFetchingGeoLocation} 
            >
              <LocateFixed className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* ... (Category buttons remain the same) ... */}
         <div className="mb-8 flex flex-wrap gap-3 animate-fade-in-up">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full ${selectedCategory === category.id ? 'bg-gradient-primary' : ''}`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Use the dedicated loading state for services */}
          {loadingServices ? (
            Array.from({ length: 6 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))
          ) : displayServices.length > 0 ? (
            displayServices.map((service, index) => (
              <Card 
                key={service.id}
                className="overflow-hidden hover:shadow-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-scale-in border-border"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/booking/${service.id}`)}
              >
                 {/* ... (Card content remains the same) ... */}
                 <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="backdrop-blur-sm border-transparent hover:bg-secondary">
                      {service.availability}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <span className="text-muted-foreground font-medium">{service.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium">{service.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({service.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{service.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{service.location}</span>
                    <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-xl text-muted-foreground mt-8">{emptyStateMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;