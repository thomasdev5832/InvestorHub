import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import LandingPage from './pages/landing-page';
import Opportunities from './pages/opportunities';
import InvestmentDetails from './pages/investment-details';
import Pools from './pages/pools';
import PoolDetails from './pages/pool-details';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Portfolio />} />
          <Route path="pools" element={<Pools />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="settings" element={<div>Settings</div>} />
          <Route path="/dashboard/investment/:index" element={<InvestmentDetails />} />
          <Route path="pool/:index" element={<PoolDetails />} />
        </Route>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;