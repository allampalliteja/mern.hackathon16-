import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DealsPage from "./pages/DealsPage";
import MyDealsPage from "./pages/MyDealsPage"; // ✅ Import My Deals Page
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Profile from "./components/Profile";
import PrivateRoute from "./components/PrivateRoute";
import AddDealPage from "./pages/AddDealPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);

  // Simple page transition effect
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className={`transition-opacity duration-300 ${pageTransition ? "opacity-0" : "opacity-100"}`}>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/my-deals" element={ // ✅ My Deals Page Route
              <PrivateRoute>
                <MyDealsPage />
              </PrivateRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/add-deal" element={<PrivateRoute><AddDealPage /></PrivateRoute>} />
            <Route path="*" element={<div className="text-center py-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h2>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>} />
          </Routes>
        </main>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default App;
