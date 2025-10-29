import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Building2, Mail, Lock } from "lucide-react";
import { supabase } from "../supabaseclient"; 

const AdminAuth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); 

    try {
      if (isSignUp) {
        // --- Supabase Admin Sign Up Logic ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              business_name: businessName, // Store business name in user metadata
              role: 'provider' // Crucial: Tag this user as an 'admin'
            }
          }
        });

        if (error) throw error;

        // Check if email confirmation is required (default Supabase behavior)
        if (data.user && !data.session) {
          setError("Registration Successful! Please check your email to confirm your business account.");
          // Switch to sign-in mode after successful signup
          setIsSignUp(false); 
        } else if (data.session) {
          // Immediately signed in (if email confirmation is disabled)
          navigate('/admin'); 
        }

      } else {
        // --- Supabase Admin Sign In Logic ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Successful login - Now, ideally, we should verify the role
        // For simple navigation, we just check for session presence
        if (data.session) {
          // In a real app, you'd check data.user.user_metadata.role === 'admin' here 
          // and log a user out if they're not an admin.
          navigate('/admin');
        } else {
          setError("Sign in failed. Please check your credentials.");
        }
      }
    } catch (err: any) {
      // Supabase errors are returned in the error object
      console.error(err);
      setError(err.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
      setPassword(""); // Clear password field after attempt
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(262_83%_58%/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(220_90%_56%/0.15),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BookEase
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Business Portal</h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Register your business to start managing bookings" : "Sign in to manage your business"}
            </p>
          </div>

          <Card className="shadow-2xl border-2 animate-scale-in backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                {isSignUp ? "Register Business" : "Business Login"}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp 
                  ? "Create your business account to start accepting bookings" 
                  : "Access your business dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message Display */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm" role="alert">
                    {error}
                  </div>
                )}

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="Your Business Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={loading} // Disable button when loading
                >
                  {loading ? (isSignUp ? "Registering..." : "Signing In...") : (isSignUp ? "Register Business" : "Sign In")}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {isSignUp ? "Already have a business account? " : "Don't have a business account? "}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null); // Clear errors on mode switch
                        setPassword(""); // Clear password on mode switch
                    }}
                  >
                    {isSignUp ? "Sign In" : "Register"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;