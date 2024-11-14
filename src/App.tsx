import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MarvelCharacters from './components/HomePage/MarvelCharacters';
import CharacterDetail from './components/DetailsPage/CharacterDetail';

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
