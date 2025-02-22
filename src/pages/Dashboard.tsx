
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Users, Database, FileCheck } from "lucide-react";
import type { Profile, UserRole } from "@/types/supabase";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            created_at,
            updated_at,
            user_roles (
              id,
              role,
              created_at
            )
          `)
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          // Ensure the data matches the Profile type
          const profileData: Profile = {
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            created_at: data.created_at,
            updated_at: data.updated_at,
            user_roles: data.user_roles as UserRole[]
          };
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
        <h1 className="heading-lg mb-2">Welcome back, {profile?.first_name || 'User'}!</h1>
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
