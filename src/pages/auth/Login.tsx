
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/supabase";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, user_roles(*)')
          .eq('id', data.user.id)
          .single();

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log in",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Home Button */}
        <div className="absolute top-4 left-4">
          <Link to="/" className="btn-ghost p-2 rounded-full hover:bg-muted">
            <Home className="w-6 h-6" />
          </Link>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="heading-lg text-primary mb-2">CapGenie</h1>
          <p className="text-muted-foreground">Welcome back! Please login to continue.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background 
                         focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background 
                           focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          {" • "}
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
