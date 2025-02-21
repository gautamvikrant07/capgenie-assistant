import { Bot, Users, LineChart, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card hover-card rounded-xl p-6 flex flex-col items-start gap-4"
  >
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="heading-xl mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Regulatory Reporting Made Simple
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Revolutionize your regulatory compliance with CapGenie's intelligent chatbot, 
              powered by advanced AI and automation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary" onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 inline" />
              </button>
              <button className="btn-secondary">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-6 py-20 bg-gradient-to-b from-transparent to-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground">
              Transform your regulatory reporting workflow with powerful AI capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Bot}
              title="AI-Powered Chatbot"
              description="Interact naturally with your regulatory data using our intelligent chatbot assistant."
            />
            <FeatureCard
              icon={LineChart}
              title="Smart Analytics"
              description="Generate instant insights and visualizations from your compliance data."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Automated Validation"
              description="Ensure accuracy with AI-driven data validation and comparison tools."
            />
          </div>
        </div>
      </section>

      {/* User Personas Section */}
      <section className="container px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4">Tailored for Every Role</h2>
            <p className="text-lg text-muted-foreground">
              Customized features and access for different user roles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card hover-card rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Regulatory SME</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Natural Language Queries
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Data Validation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Impact Analysis
                </li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card hover-card rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Research Analyst</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  AI Insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Regulatory Research
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Data Visualization
                </li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card hover-card rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Developer</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  JIRA & GIT Integration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  API Documentation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Automation Tools
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-lg mb-6">
            Ready to Transform Your Regulatory Reporting?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the future of regulatory compliance with CapGenie's AI-powered platform.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            onClick={handleGetStarted}
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5 inline" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Index;
