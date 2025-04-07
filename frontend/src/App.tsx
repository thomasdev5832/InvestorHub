import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Portfolio from './pages/portfolio';
import LandingPage from './pages/landing-page';
import Opportunities from './pages/opportunities';
// Importe outras páginas como Opportunities e Settings quando criá-las

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Portfolio />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="settings" element={<div>Settings</div>} />
        </Route>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;