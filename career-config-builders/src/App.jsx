import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ReferralBuilder from "./pages/ReferralBuilder.jsx";
import LandingBuilder from "./pages/LandingBuilder.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/referral-builder" replace />} />
        <Route path="/referral-builder" element={<ReferralBuilder />} />
        <Route path="/landing-builder" element={<LandingBuilder />} />
        <Route path="*" element={<Navigate to="/referral-builder" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
