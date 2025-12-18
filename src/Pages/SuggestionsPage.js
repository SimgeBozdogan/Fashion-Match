import React, { useState, useEffect } from 'react';
import './SuggestionsPage.css';
import { useNavigate } from 'react-router-dom';

const SuggestionsPage = () => {
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    generateSuggestions();
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/weather');
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  const generateSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/suggestions/generate', {
        method: 'POST'
      });
      const data = await response.json();
      setCombinations(data.combinations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setLoading(false);
    }
  };

  const handlePurchaseLink = (link) => {
    if (link && link !== 'https://example.com/shoes') {
      window.open(link, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="suggestions-page">
        <div className="loading">Kombinler oluşturuluyor...</div>
      </div>
    );
  }

  return (
    <div className="suggestions-page">
      <div className="suggestions-header">
        <h1>Kombin Önerileri</h1>
        <button onClick={() => navigate('/')} className="back-btn">Ana Sayfaya Dön</button>
      </div>

      {weather && (
        <div className="weather-banner-bar">
          <div className="weather-icon-bar">
            {weather.condition === 'sunny' && '☀️'}
            {weather.condition === 'cloudy' && '☁️'}
            {weather.condition === 'rainy' && '🌧️'}
            {weather.condition === 'cold' && '❄️'}
          </div>
          <div className="weather-temp-bar">{weather.temperature}°C</div>
          <div className="weather-desc-bar">
            {weather.condition === 'sunny' && 'Güneşli'}
            {weather.condition === 'cloudy' && 'Bulutlu'}
            {weather.condition === 'rainy' && 'Yağmurlu'}
            {weather.condition === 'cold' && 'Soğuk'}
          </div>
          <div className="weather-recommendation-bar">
            {weather.recommendation === 'cold' && '🧥 Kalın giysiler önerilir'}
            {weather.recommendation === 'hot' && '👕 İnce ve hafif giysiler önerilir'}
            {weather.recommendation === 'rainy' && '☔ Yağmurluk veya şemsiye almanızı öneririz'}
            {weather.recommendation === 'normal' && '👔 Normal giyim uygundur'}
          </div>
        </div>
      )}

      {combinations.length === 0 ? (
        <div className="no-suggestions">
          <p>Henüz yeterli kıyafet eklenmemiş. Önce gardırobuna kıyafet ekleyin!</p>
          <button onClick={() => navigate('/upload')}>Kıyafet Ekle</button>
        </div>
      ) : (
        <div className="combinations-grid">
          {combinations.map((combination, index) => (
            <div key={index} className="combination-card">
              <h3>{combination.name}</h3>
              
              <div className="combination-items">
                {combination.items.map((item, itemIndex) => (
                  item && (
                    <div key={itemIndex} className="item-preview">
                      {item.image_url && (
                        <img 
                          src={`http://localhost:5001${item.image_url}`} 
                          alt={item.name || 'Item'} 
                          className="item-image"
                        />
                      )}
                      <p className="item-name">{item.name || 'Untitled'}</p>
                    </div>
                  )
                ))}
              </div>

              {combination.missingItems && combination.missingItems.length > 0 && (
                <div className="missing-items">
                  <h4>Bu Parçayı da Ekleyebilirsiniz:</h4>
                  {combination.missingItems.map((missing, missingIndex) => (
                    <div key={missingIndex} className="missing-item">
                      <div className="missing-item-info">
                        <p className="missing-item-name">{missing.itemName || missing.category}</p>
                        <p className="missing-item-desc">{missing.description || `${missing.category} bu kombini tamamlar`}</p>
                      </div>
                      {missing.purchaseLink && (
                        <button 
                          className="purchase-btn"
                          onClick={() => handlePurchaseLink(missing.purchaseLink)}
                        >
                          Mağazada Gör
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {combination.suggestions && combination.suggestions.length > 0 && (
                <div className="suggestions-list">
                  <h4>Öneriler:</h4>
                  {combination.suggestions.map((suggestion, sugIndex) => (
                    <div key={sugIndex} className="suggestion-item">
                      <p>{suggestion.description}</p>
                      {suggestion.purchaseLink && (
                        <button 
                          className="purchase-btn"
                          onClick={() => handlePurchaseLink(suggestion.purchaseLink)}
                        >
                          Satın Al
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsPage;

