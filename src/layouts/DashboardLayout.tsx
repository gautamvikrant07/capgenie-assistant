
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Bot, Search, Bell, User, ChevronDown, ChevronRight,
  LineChart, Database, FileCode, BarChart, Settings,
  Menu, X, Play, CheckSquare, TrendingUp
} from "lucide-react";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>("Database Interaction");
  const location = useLocation();
  const [userRole] = useState("analyst");

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
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-lg">
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
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`block p-3 hover:bg-muted rounded-lg transition-colors ${
                              location.pathname === subItem.path ? 'bg-primary/10 text-primary' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <subItem.icon size={16} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{subItem.label}</h4>
                                <p className="text-xs text-muted-foreground">{subItem.description}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
                      location.pathname === link.path ? 'bg-primary/10 text-primary' : ''
                    }`}
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
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
