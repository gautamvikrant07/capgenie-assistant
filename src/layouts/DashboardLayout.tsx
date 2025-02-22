
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Command } from "cmdk";
import { 
  Search, Bell, User, ChevronDown, ChevronRight,
  LineChart, Database, FileCode, Menu, X, Play, 
  CheckSquare, TrendingUp, LogOut, Settings, UserCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>("Database Interaction");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole] = useState("analyst");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/auth/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const sidebarLinks = [
    { icon: LineChart, label: "Dashboard", path: "/dashboard" },
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
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const searchItems = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Run Query", path: "/database/query" },
    { title: "Data Validation", path: "/database/validation" },
    { title: "Impact Analysis", path: "/database/analysis" },
    { title: "Settings", path: "/settings" },
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
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg"
            >
              <Search size={18} className="text-muted-foreground" />
              <span className="text-muted-foreground">Search...</span>
              <kbd className="ml-3 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            
            <button className="p-2 hover:bg-muted rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
                  <User size={20} />
                  <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      {isSearchOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-1/2 top-1/4 w-full max-w-xl -translate-x-1/2 rounded-xl border bg-background shadow-lg">
            <Command className="rounded-lg border shadow-md">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2 p-1 hover:bg-muted rounded"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {searchItems
                  .filter(item => 
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted"
                    >
                      {item.title}
                    </button>
                  ))}
              </div>
            </Command>
          </div>
        </div>
      )}

      <main className={`pt-[60px] min-h-[calc(100vh-60px)] transition-all duration-300 ${
        isSidebarOpen ? 'ml-[250px]' : 'ml-0'
      }`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
