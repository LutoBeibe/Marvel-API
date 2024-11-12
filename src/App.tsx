import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MarvelCharacters from './components/MarvelCharacters';
import CharacterDetail from './pages/CharacterDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarvelCharacters />} />
        <Route path="/character/:id" element={<CharacterDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
