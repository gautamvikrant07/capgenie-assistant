import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Bot, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  ChevronRight,
  LineChart, 
  Database, 
  FileCode, 
  BarChart, 
  Settings,
  Menu,
  X,
  Play,
  CheckSquare,
  TrendingUp
} from "lucide-react";

const QuickAccessWidget = ({ title, description, icon: Icon, onClick }: { 
  title: string; 
  description: string; 
  icon: any;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="glass-card p-6 rounded-xl cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </motion.div>
);

const RecentActivity = ({ type, description, time }: {
  type: string;
  description: string;
  time: string;
}) => (
  <div className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg">
    <div className="w-2 h-2 rounded-full bg-primary"></div>
    <div className="flex-1">
      <p className="text-sm font-medium">{type}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <p className="text-xs text-muted-foreground">{time}</p>
  </div>
);

const SubMenuItem = ({ icon: Icon, label, description, path }: {
  icon: any;
  label: string;
  description: string;
  path: string;
}) => (
  <Link
    to={path}
    className="block p-3 hover:bg-muted rounded-lg transition-colors"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon size={16} className="text-primary" />
      </div>
      <div>
        <h4 className="font-medium text-sm">{label}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [userRole] = useState("analyst");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sidebarLinks = [
    { icon: LineChart, label: "Dashboard", path: "/dashboard" },
    { icon: Bot, label: "AI Chatbot", path: "/chatbot" },
    {
      icon: Database,
      label: "Database Interaction",
      path: "/database",
      roles: ["sme", "analyst"],
      subItems: [
        {
          icon: Play,
          label: "Run Query",
          path: "/database/query",
          description: "Execute natural language queries on your data"
        },
        {
          icon: CheckSquare,
          label: "Data Validation",
          path: "/database/validation",
          description: "Validate regulatory data against defined rules"
        },
        {
          icon: TrendingUp,
          label: "Impact Analysis",
          path: "/database/analysis",
          description: "Analyze potential impacts of data changes"
        }
      ]
    },
    { icon: FileCode, label: "Beyond Compare", path: "/compare" },
    { icon: BarChart, label: "Visualization", path: "/visualization" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-[60px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 w-full z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 hover:bg-muted rounded-lg">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-semibold">CapGenie</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
              <Search size={18} className="text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none w-48"
              />
            </div>
            
            <button className="p-2 hover:bg-muted rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            
            <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
              <User size={20} />
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </nav>

      <aside className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] bg-background border-r transition-all duration-300 ${
        isSidebarOpen ? 'w-[250px]' : 'w-0 -translate-x-full'
      }`}>
        <div className="p-4 space-y-1">
          {sidebarLinks.map((link, index) => (
            link.roles === undefined || link.roles.includes(userRole) ? (
              <div key={index}>
                {link.subItems ? (
                  <div>
                    <button
                      onClick={() => setExpandedMenu(expandedMenu === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <link.icon size={20} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${
                          expandedMenu === link.label ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {expandedMenu === link.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-1 space-y-1"
                      >
                        {link.subItems.map((subItem, subIndex) => (
                          <SubMenuItem key={subIndex} {...subItem} />
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <link.icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                )}
              </div>
            ) : null
          ))}
        </div>
      </aside>

      <main className={`pt-[60px] min-h-[calc(100vh-60px)] transition-all duration-300 ${
        isSidebarOpen ? 'ml-[250px]' : 'ml-0'
      }`}>
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="heading-lg mb-2">Welcome back, User!</h1>
            <p className="text-muted-foreground">Here's what's happening with your reports.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <QuickAccessWidget
              title="Run Query"
              description="Execute natural language queries on your data"
              icon={Database}
              onClick={() => console.log("Run Query clicked")}
            />
            <QuickAccessWidget
              title="Data Validation"
              description="Validate your regulatory data against rules"
              icon={FileCode}
              onClick={() => console.log("Data Validation clicked")}
            />
            <QuickAccessWidget
              title="View Analytics"
              description="Check your reporting analytics and insights"
              icon={LineChart}
              onClick={() => console.log("Analytics clicked")}
            />
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              <RecentActivity
                type="Query Executed"
                description="SELECT * FROM regulatory_data WHERE date > '2024-01-01'"
                time="2 mins ago"
              />
              <RecentActivity
                type="Validation Completed"
                description="Basel III Capital Requirements validation"
                time="1 hour ago"
              />
              <RecentActivity
                type="Report Generated"
                description="Q1 2024 Regulatory Compliance Report"
                time="3 hours ago"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
