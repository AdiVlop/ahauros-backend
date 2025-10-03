import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Overview from "./pages/Overview";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ContactPage from "./pages/ContactPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Gdpr from "./pages/Gdpr";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import AndreeaOrchestrator from "./components/AndreeaOrchestrator";
import { dashboardRoutes } from "./config/routesConfig";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<ContactPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          {dashboardRoutes.map(({ path, name }) => {
            const relativePath = path.replace("/dashboard/", "");
            let Element;
            switch (relativePath) {
              case "overview":
                Element = Overview;
                break;
              case "mentoring":
                Element = AndreeaOrchestrator;
                break;
              default:
                Element = () => (
                  <div className="p-8 text-white">
                    {name} (mock placeholder)
                  </div>
                );
            }
            return <Route key={path} path={relativePath} element={<Element />} />;
          })}
        </Route>

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/gdpr" element={<Gdpr />} />
      </Routes>
    </Router>
  );
}

export default App;
