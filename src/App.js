import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import StockPage from './pages/StockPage';
import HeatmapPage from './pages/HeatmapPage';
const App = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Stock Aggregator</Typography>
          <Button color="inherit" component={Link} to="/">Stock Page</Button>
          <Button color="inherit" component={Link} to="/heatmap">Correlation Heatmap</Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
      </Routes>
    </Router>
  );
};

export default App;