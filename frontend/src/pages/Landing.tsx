import { Hero } from "@/components/Hero";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// Import motion from framer-motion for animations
import { motion } from "framer-motion";

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0); // Added for CTA parallax (matching Hero)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered booking system that finds the perfect time slots for you",
      image: "image1", // Using placeholder for the first image
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Discover highly-rated services within your preferred distance",
      image: "image2", // Using placeholder for the second image
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap, // Changed from Shield as per request for 'Instant Confirmations' image
      title: "Instant Confirmations", // Changed from 'Secure Payments'
      description: "Get real-time notifications and booking confirmations instantly", // Updated description
      image: "image3", // Using placeholder for the third image
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const services = [
    {
      name: "Healthcare",
      description: "Doctors, Dentists, Specialists",
      bookings: "150K+ bookings",
      image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=500&auto=format&fit=crop",
      icon: "🏥"
    },
    {
      name: "Beauty & Wellness",
      description: "Salons, Spas, Massage",
      bookings: "200K+ bookings",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=500&auto=format&fit=crop",
      icon: "💇"
    },
    {
      name: "Restaurants",
      description: "Fine Dining, Cafes, Bars",
      bookings: "300K+ bookings",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=500&auto=format&fit=crop",
      icon: "🍽️"
    },
    {
      name: "Fitness",
      description: "Gyms, Yoga, Personal Training",
      bookings: "100K+ bookings",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500&auto-format&fit=crop",
      icon: "💪"
    },
    {
      name: "Auto Services",
      description: "Mechanics, Car Wash, Detailing",
      bookings: "80K+ bookings",
      image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=500&auto=format&fit=crop",
      icon: "🚗"
    },
    {
      name: "Home Services",
      description: "Cleaning, Repair, Maintenance",
      bookings: "120K+ bookings",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500&auto-format&fit=crop",
      icon: "🏠"
    }
  ];

  // --- UPDATED FUNCTION ---
  // Removed max-h-48 to let the image be larger
  const renderFeatureImage = (imageKey) => {
    let src = "";
    let alt = "";

    switch (imageKey) {
      case "image1":
        src = "/1.png";
        alt = "Smart Scheduling Illustration";
        break;
      case "image2":
        src = "/2.png";
        alt = "Location Intelligence Illustration";
        break;
      case "image3":
        src = "/3.png";
        alt = "Instant Confirmations Illustration";
        break;
      default:
        return null; // Return null if no image key matches
    }

    // Return the <img> element
    return <img src={src} alt={alt} className="w-full h-auto object-contain rounded-lg" />;
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <Hero />

      {/* Features Section */}
<section className="py-24 bg-white relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-white opacity-70" />
  <div className="container mx-auto px-6 lg:px-8 relative z-10">
    <motion.div
      className="grid md:grid-cols-3 gap-12 place-items-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.2 },
        },
      }}
    >
      {[
        {
          img: "/1.png",
          title: "Smart Scheduling",
          desc: "Simplify appointment management with intelligent scheduling.",
        },
        {
          img: "/2.png",
          title: "Instant Confirmations",
          desc: "Get real-time notifications and booking confirmations instantly.",
        },
        {
          img: "/3.png",
          title: "Location Intelligence",
          desc: "Discover highly-rated services within your preferred distance.",
        },
      ].map((feature, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="relative w-full max-w-[320px] text-center flex flex-col items-center"
        >
          {/* Illustration Container (fixed height for alignment) */}
          <div className="relative h-[240px] flex items-center justify-center mb-6">
            <div className="absolute inset-0 blur-[80px] bg-gradient-to-br from-purple-400/30 via-pink-300/20 to-indigo-400/30 rounded-full scale-125" />
            <img
              src={feature.img}
              alt={feature.title}
              className="relative z-10 max-h-[220px] w-auto drop-shadow-2xl object-contain"
            />
          </div>

          {/* Title and Description */}
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto text-base leading-relaxed">
            {feature.desc}
          </p>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>





      {/* Services Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Book Services Across
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-primary">
                Multiple Categories
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From healthcare to home services, find and book trusted professionals near you
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            {services.map((service) => (
              <motion.div
                key={service.name}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl h-80 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-all duration-300" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <motion.div
                    className="text-5xl mb-3"
                    whileHover={{ scale: 1.1 }}
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-300 mb-2">{service.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{service.bookings}</span>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(262_83%_58%/0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Book your appointment in just 3 simple steps
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            {[
              { step: "01", title: "Search & Discover", description: "Browse services by category or search for specific providers near you", icon: MapPin, color: "from-blue-500 to-cyan-500" },
              { step: "02", title: "Choose Time Slot", description: "View real-time availability and select a convenient time that works for you", icon: Clock, color: "from-purple-500 to-pink-500" },
              { step: "03", title: "Confirm Booking", description: "Complete your booking and receive instant confirmation with reminders", icon: CheckCircle, color: "from-green-500 to-emerald-500" }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative text-center group"
                variants={itemVariants}
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10" style={{ transform: 'translateX(50%)' }} />
                )}
                <div className="relative inline-block mb-6">
                  <motion.div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br ${step.color} p-1 shadow-2xl`}
                    whileHover={{ scale: 1.1, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <step.icon className="h-12 w-12 text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                  </motion.div>
                  <div className={`absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section (Updated to match Hero theme) */}
      <motion.section
        className="py-24 relative min-h-[70vh] flex items-center overflow-hidden bg-black"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0, y: 60 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
          }
        }}
      >
        {/* Multi-Image Background Grid (matching Hero) */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 grid grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2 gap-1"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            {/* Array of images for easier mapping (matching Hero) */}
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

          {/* Dark overlay for text readability (matching Hero) */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          variants={{
            visible: {
              transition: { staggerChildren: 0.2, delayChildren: 0.1 }
            }
          }}
        >
          <motion.div
            className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[70vh] py-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" }
              }
            }}
          >
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" }
                }
              }}
            >
              Ready to Simplify Your
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Bookings?
              </span>
            </ motion.h2>
            <motion.p
              className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" }
                }
              }}
            >
              Join thousands of satisfied users who book their appointments effortlessly every day
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                }
              }}
            >
              <motion.div variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" }
                }
              }}>
                <Button
                  size="lg"
                  className="text-lg h-14 px-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 group"
                  onClick={() => navigate('/auth')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Get Started Free
                  <motion.div
                    className="ml-2 h-5 w-5"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut", delay: 0.1 }
                }
              }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-10 border-2 border-neutral-600 bg-black/20 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105"
                  onClick={() => navigate('/admin-auth')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  For Businesses
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators (matching Hero style) */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 text-sm text-neutral-400"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                }
              }}
            >
              <motion.div
                className="flex items-center gap-2"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut" }
                  }
                }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut", delay: 0.1 }
                  }
                }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free forever plan</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
                  }
                }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Fade to dark background (matching Hero) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </motion.section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">BookEase</h3>
              <p className="text-muted-foreground text-sm">
                Your one-stop solution for booking appointments across all services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Healthcare</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Beauty & Salons</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Restaurants</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Fitness</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 BookEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;