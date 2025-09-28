import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ContactPage from "./pages/ContactPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Gdpr from "./pages/Gdpr";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
  return(
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/auth" element={<Auth/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard/></ProtectedRoute>
        }/>
        <Route path="/terms" element={<Terms/>} />
        <Route path="/privacy" element={<Privacy/>} />
        <Route path="/gdpr" element={<Gdpr/>} />
      </Routes>
    </Router>
  );
}
export default App;
