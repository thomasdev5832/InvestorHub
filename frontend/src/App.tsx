import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import LandingPage from './pages/landing-page';
import Opportunities from './pages/opportunities';
import InvestmentDetails from './pages/investment-details';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Portfolio />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="settings" element={<div>Settings</div>} />
          <Route path="/dashboard/investment/:index" element={<InvestmentDetails />} /> {/* Movido para cá */}
        </Route>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;