import { LayoutDashboard, Users, LineChart, ShieldAlert, Brain, Plug, Package, BarChart3, UserSquare2, CreditCard, Settings, Book } from "lucide-react";

export const dashboardRoutes = [
  { name: "Overview", path: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Profit & Ads", path: "/dashboard/profit-ads", icon: LineChart },
  { name: "Forecast & Stock", path: "/dashboard/forecast-stock", icon: BarChart3 },
  { name: "Fraud & Returns", path: "/dashboard/fraud-returns", icon: ShieldAlert },
  { name: "Neuromarketing", path: "/dashboard/neuromarketing", icon: Brain },
  { name: "Integrations", path: "/dashboard/integrations", icon: Plug },
  { name: "Stock & Suppliers", path: "/dashboard/stock-suppliers", icon: Package },
  { name: "Supplier Optimizer", path: "/dashboard/supplier-optimizer", icon: BarChart3 },
  { name: "Mentoring (Andreea)", path: "/dashboard/mentoring", icon: UserSquare2 },
  { name: "Billing", path: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
  { name: "Instructions", path: "/dashboard/instructions", icon: Book },
];
