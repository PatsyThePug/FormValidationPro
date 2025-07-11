import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";
import PaymentForm from "@/pages/payment-form";
import AdminDashboard from "@/pages/admin-dashboard";
import { CreditCard, Settings, Home } from "lucide-react";
import elNacionalLogo from "@assets/elnacional-logo.png";

function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
        </div>
        
        <div className="flex space-x-2">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "ghost"} 
              size="sm"
              className={`flex items-center gap-2 ${location === "/" ? "bg-[#2563eb] hover:bg-[#1e40af] text-white" : "text-[#2563eb] hover:bg-[#2563eb]/10"}`}
            >
              <CreditCard className="h-4 w-4" />
              Payment Form
            </Button>
          </Link>
          
          <Link href="/admin">
            <Button 
              variant={location === "/admin" ? "default" : "ghost"} 
              size="sm"
              className={`flex items-center gap-2 ${location === "/admin" ? "bg-[#2563eb] hover:bg-[#1e40af] text-white" : "text-[#2563eb] hover:bg-[#2563eb]/10"}`}
            >
              <Settings className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Logo at top left of page */}
      <div className="bg-white dark:bg-gray-900 py-6 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex justify-start">
          <img 
            src={elNacionalLogo} 
            alt="El Nacional Logo" 
            className="h-48 w-auto object-contain"
          />
        </div>
      </div>
      
      <Navigation />
      
      <Switch>
        <Route path="/" component={PaymentForm} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
