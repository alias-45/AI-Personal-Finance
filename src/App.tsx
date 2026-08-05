import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LoginOnboarding } from "./components/LoginOnboarding";
import { DashboardHome } from "./components/DashboardHome";
import { BudgetExpense } from "./components/BudgetExpense";
import { AIInsights } from "./components/AIInsights";
import { Gamification } from "./components/Gamification";
import { ScenarioSimulator } from "./components/ScenarioSimulator";
import { AnomalyDetection } from "./components/AnomalyDetection";
import { Settings } from "./components/Settings";
import {FinanceNews} from "./components/FinanceNews";
import { CarbonFootprint } from "./components/CarbonFootprint";
import VoiceAssistant from "./components/VoiceAssistant";
import { NotificationBell } from "./components/NotificationBell";
import { Button } from "./components/ui/button";
import {
  Home,
  Wallet,
  Brain,
  Trophy,
  TrendingUp,
  Shield,
  Settings as SettingsIcon,
  Newspaper,
  Leaf,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";

type Page =
  | "home"
  | "budget"
  | "insights"
  | "gamification"
  | "simulator"
  | "anomaly"
  | "settings"
  | "news"
  | "carbon";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const menuItems = [
    { id: "home" as Page, label: "Dashboard", icon: Home },
    {
      id: "budget" as Page,
      label: "Budget & Expenses",
      icon: Wallet,
    },
    {
      id: "insights" as Page,
      label: "AI Insights",
      icon: Brain,
    },
    {
      id: "gamification" as Page,
      label: "Challenges",
      icon: Trophy,
    },
    {
      id: "simulator" as Page,
      label: "Scenario Simulator",
      icon: TrendingUp,
    },
    {
      id: "anomaly" as Page,
      label: "Fraud Detection",
      icon: Shield,
    },
    {
      id: "news" as Page,
      label: "Finance News",
      icon: Newspaper,
    },
    {
      id: "carbon" as Page,
      label: "Carbon Tracker",
      icon: Leaf,
    },
    {
      id: "settings" as Page,
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  if (!isLoggedIn) {
    return (
      <LoginOnboarding onComplete={() => setIsLoggedIn(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed lg:sticky top-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40 transition-transform ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } w-72`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3>FinanceAI</h3>
                <p className="text-muted-foreground">
                  Wellness Hub
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <span>Dark Mode</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1>
                {menuItems.find(
                  (item) => item.id === currentPage,
                )?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-950 rounded-xl">
                <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
                <span className="text-teal-700 dark:text-teal-300">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === "home" && (
              <DashboardHome userName="Alex" />
            )}
            {currentPage === "budget" && <BudgetExpense />}
            {currentPage === "insights" && <AIInsights />}
            {currentPage === "gamification" && <Gamification />}
            {currentPage === "simulator" && (
              <ScenarioSimulator />
            )}
            {currentPage === "anomaly" && <AnomalyDetection />}
            {currentPage === "settings" && (
              <Settings
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
              />
            )}
            {currentPage === "news" && <FinanceNews />}
            {currentPage === "carbon" && <CarbonFootprint />}
          </motion.div>
        </div>
      </main>

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}