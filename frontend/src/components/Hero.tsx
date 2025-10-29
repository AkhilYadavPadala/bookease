import { Button } from "@/components/ui/button";
import { Calendar, Star, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Multi-Image Background Grid */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 grid grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2 gap-1"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          {/* Array of images for easier mapping */}
          {[
            { src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=600&auto=format&fit=crop", alt: "Healthcare services" },
            { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop", alt: "Beauty salon services" },
            { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop", alt: "Restaurant services" },
            { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop", alt: "Fitness services" },
            { src: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=600&auto=format&fit=crop", alt: "Auto services" },
            { src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop", alt: "Home services" },
            { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop", alt: "Spa and wellness" },
            { src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=600&auto=format&fit=crop", alt: "Professional services" }
          ].map((image, index) => (
            <div key={index} className="relative overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center min-h-[90vh] flex flex-col justify-center py-20">
          {/* Main Headline */}
          <div className="space-y-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight text-white">
              Book Appointments
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Effortlessly
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-neutral-300 max-w-3xl mx-auto">
              From healthcare to beauty, dining to fitness—discover and book trusted professionals near you in seconds
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button
              size="lg"
              className="text-lg h-14 px-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 group"
              onClick={() => navigate('/auth')}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="text-lg h-14 px-10 border-2 border-neutral-600 bg-black/20 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/admin-auth')}
            >
              For Businesses
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-400 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to get started</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade to dark background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
};
