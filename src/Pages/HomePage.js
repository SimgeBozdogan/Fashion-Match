import React from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <h1>Moda Asistanına Hoş Geldin!</h1>
      <p>Kıyafetini yükle, senin için harika kombinler bulalım!</p>
      <button onClick={() => navigate('/upload')}>Kıyafet Yükle</button>
    </div>
  );
};

export default HomePage;
