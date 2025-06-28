import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import LandingPage from './pages/landing-page';
import Opportunities from './pages/opportunities';
import InvestmentDetails from './pages/investment-details';
import Pools from './pages/pools';
import NewPosition from './pages/new-position';
import LearningPage from './pages/learning-page';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Portfolio />} />
          <Route path="pools" element={<Pools />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="settings" element={<div>Settings</div>} />
          <Route path="/dashboard/investment/:index" element={<InvestmentDetails />} />
          <Route path="new-position/:index" element={<NewPosition />} />
        </Route>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;