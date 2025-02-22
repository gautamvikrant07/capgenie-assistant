
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Users, Database, FileCheck } from "lucide-react";
import type { Profile, UserRole } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";

interface DashboardProfile extends Profile {
  user_roles: UserRole[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const chartData = [
    { name: 'Jan', queries: 65, validations: 28 },
    { name: 'Feb', queries: 59, validations: 48 },
    { name: 'Mar', queries: 80, validations: 40 },
    { name: 'Apr', queries: 81, validations: 67 },
    { name: 'May', queries: 56, validations: 43 },
    { name: 'Jun', queries: 55, validations: 55 },
  ];

  const stats = [
    { title: 'Total Queries', value: '1,234', icon: Database, change: '+12.3%' },
    { title: 'Data Validations', value: '567', icon: FileCheck, change: '+8.6%' },
    { title: 'Active Users', value: '89', icon: Users, change: '+23.1%' },
  ];

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in to access the dashboard."
        });
        navigate('/login');
        return;
      }

      // First fetch the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data."
        });
        return;
      }

      // Then fetch the roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user roles."
        });
        return;
      }

      if (profile) {
        setProfileData({
          ...profile,
          user_roles: roles || []
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-2">Welcome back, {profileData?.first_name || 'User'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your regulatory data.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card hover-card rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 flex items-center">
                {stat.change} <ArrowUpRight className="w-4 h-4 ml-1" />
              </span>
              <span className="text-muted-foreground ml-2">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Activity Overview</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="queries" 
                stroke="#0088CC" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="validations" 
                stroke="#22C55E" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
