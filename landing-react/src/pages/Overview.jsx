import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export default function Overview() {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{t("dashboard_title")}</h1>
        <p className="text-gray-300 text-lg">Welcome to your Ahauros AI dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{t("total_revenue")}</p>
              <p className="text-2xl font-bold">€12,450</p>
            </div>
            <DollarSign className="w-8 h-8 text-[#e0bd40]" />
          </div>
        </div>
        
        <div className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{t("active_users")}</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <BarChart3 className="w-8 h-8 text-[#e0bd40]" />
          </div>
        </div>
        
        <div className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{t("growth_rate")}</p>
              <p className="text-2xl font-bold">+23%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#e0bd40]" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="bg-gray-900/80 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6">{t("ai_insights")}</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-[#e0bd40] pl-4">
            <h3 className="font-semibold">{t("pricing_optimization")}</h3>
            <p className="text-gray-300">Your AI has identified 15 products that could benefit from price adjustments.</p>
          </div>
          <div className="border-l-4 border-[#e0bd40] pl-4">
            <h3 className="font-semibold">Inventory Forecast</h3>
            <p className="text-gray-300">Stock levels are optimal for the next 30 days based on demand predictions.</p>
          </div>
          <div className="border-l-4 border-[#e0bd40] pl-4">
            <h3 className="font-semibold">Marketing ROI</h3>
            <p className="text-gray-300">Campaign performance is 23% above average this month.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
