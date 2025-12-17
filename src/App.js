import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import UploadPage from './Pages/UploadPage';
import SuggestionsPage from './Pages/SuggestionsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
