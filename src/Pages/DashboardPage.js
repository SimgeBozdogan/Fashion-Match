import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    totalValue: 0,
    unusedCount: 0,
    seasonalPercentage: 0,
    topColors: [],
    topStyles: [],
    unusedItems: []
  });
  const [weather, setWeather] = useState(null);
  const [smartCombinations, setSmartCombinations] = useState([]);
  const [unwornCombinations, setUnwornCombinations] = useState([]);
  const [colorHarmony, setColorHarmony] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState('daily');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    loadWeather();
  }, []);

  useEffect(() => {
    if (weather) {
      loadSmartCombinations();
    }
  }, [selectedOccasion, weather]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadWeather = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/weather');
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  const loadSmartCombinations = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/suggestions/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          occasion: selectedOccasion,
          weather: weather?.recommendation
        })
      });
      const data = await response.json();
      setSmartCombinations(data.combinations || []);
      setUnwornCombinations(data.unwornCombinations || []);
      setColorHarmony(data.colorHarmony);
    } catch (error) {
      console.error('Error loading smart combinations:', error);
    }
  };

  const handleMarkWorn = async (combination) => {
    try {
      const itemIds = combination.items.map(item => item.id);
      await fetch('http://localhost:5001/api/combinations/mark-worn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          combinationName: combination.name,
          items: itemIds,
          occasion: selectedOccasion,
          weather: weather?.recommendation
        })
      });
      loadDashboardData();
      loadSmartCombinations();
    } catch (error) {
      console.error('Error marking combination as worn:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Wardrobe Analytics</h1>
        <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Items</h3>
          <div className="stat-value">{statistics.totalItems}</div>
        </div>

        <div className="stat-card">
          <h3>Wardrobe Value</h3>
          <div className="stat-value">{statistics.totalValue.toFixed(2)} ₺</div>
        </div>

        <div className="stat-card">
          <h3>Unused</h3>
          <div className="stat-value warning">{statistics.unusedCount}</div>
          <p className="stat-hint">Not worn in over 30 days</p>
        </div>

        <div className="stat-card">
          <h3>Seasonal Match</h3>
          <div className="stat-value">{statistics.seasonalPercentage}%</div>
          <p className="stat-hint">Season-appropriate items</p>
        </div>
      </div>

      {weather && (
        <div className="weather-section">
          <h2>Weather</h2>
          <div className="weather-card">
            <div className="weather-temp">{weather.temperature}°C</div>
            <div className="weather-condition">
              {weather.condition === 'sunny' && '☀️ Sunny'}
              {weather.condition === 'cloudy' && '☁️ Cloudy'}
              {weather.condition === 'rainy' && '🌧️ Rainy'}
              {weather.condition === 'cold' && '❄️ Cold'}
            </div>
            <div className="weather-recommendation">
              {weather.recommendation === 'cold' && 'Thick clothing recommended'}
              {weather.recommendation === 'hot' && 'Light and thin clothing recommended'}
              {weather.recommendation === 'rainy' && 'Raincoat or umbrella recommended'}
              {weather.recommendation === 'normal' && 'Normal clothing is suitable'}
            </div>
          </div>
        </div>
      )}

      {statistics.topColors && statistics.topColors.length > 0 && (
        <div className="analytics-section">
          <h2>Most Used Colors</h2>
          <div className="color-chart">
            {statistics.topColors.map((item, index) => (
              <div key={index} className="color-bar-item">
                <div className="color-bar-label">{item.color}</div>
                <div className="color-bar-container">
                  <div 
                    className="color-bar" 
                    style={{ 
                      width: `${(item.count / statistics.totalItems) * 100}%`,
                      backgroundColor: getColorCode(item.color)
                    }}
                  >
                    <span className="color-bar-value">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {statistics.topStyles && statistics.topStyles.length > 0 && (
        <div className="analytics-section">
          <h2>Most Used Styles</h2>
          <div className="style-chart">
            {statistics.topStyles.map((item, index) => (
              <div key={index} className="style-item">
                <span className="style-label">
                  {item.style === 'casual' && 'Casual'}
                  {item.style === 'formal' && 'Formal'}
                  {item.style === 'sporty' && 'Sporty'}
                  {item.style === 'elegant' && 'Elegant'}
                  {item.style === 'bohemian' && 'Bohemian'}
                  {item.style === 'minimalist' && 'Minimalist'}
                </span>
                <div className="style-bar-container">
                  <div 
                    className="style-bar" 
                    style={{ width: `${(item.count / statistics.totalItems) * 100}%` }}
                  />
                </div>
                <span className="style-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {statistics.unusedItems && statistics.unusedItems.length > 0 && (
        <div className="unused-section">
          <h2>Never Worn or Long Unused Items</h2>
          <div className="unused-items-grid">
            {statistics.unusedItems.map(item => (
              <div key={item.id} className="unused-item-card">
                {item.image_url && (
                  <img 
                    src={`http://localhost:5001${item.image_url}`}
                    alt={item.name}
                    className="unused-item-image"
                  />
                )}
                <div className="unused-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.category} • {item.color}</p>
                  {item.last_worn && (
                    <p className="last-worn">Last worn: {new Date(item.last_worn).toLocaleDateString('en-US')}</p>
                  )}
                  {!item.last_worn && (
                    <p className="never-worn">Never worn</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="smart-suggestions-section">
        <div className="section-header">
          <h2>Smart Outfit Suggestions</h2>
          <select 
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="occasion-select"
          >
            <option value="daily">Daily</option>
            <option value="work">Work</option>
            <option value="school">School</option>
            <option value="sport">Sport</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        {colorHarmony && (
          <div className="harmony-stats">
            <div className="harmony-item excellent">
              <span>Excellent Match</span>
              <span>{colorHarmony.excellent}</span>
            </div>
            <div className="harmony-item good">
              <span>Good Match</span>
              <span>{colorHarmony.good}</span>
            </div>
            <div className="harmony-item average">
              <span>Average Match</span>
              <span>{colorHarmony.average}</span>
            </div>
            <div className="harmony-item poor">
              <span>Poor Match</span>
              <span>{colorHarmony.poor}</span>
            </div>
          </div>
        )}

        {unwornCombinations.length > 0 && (
          <div className="unworn-combinations">
            <h3>Unworn Combinations</h3>
            <div className="combinations-grid">
              {unwornCombinations.map((combination, index) => (
                <div key={index} className="combination-card-smart">
                  <h4>{combination.name}</h4>
                  <div className="combination-items-smart">
                    {combination.items.map((item, itemIndex) => (
                      item && item.image_url && (
                        <img 
                          key={itemIndex}
                          src={`http://localhost:5001${item.image_url}`}
                          alt={item.name}
                          className="smart-item-image"
                        />
                      )
                    ))}
                  </div>
                  <div className="combination-meta">
                    <span className="harmony-badge" style={{
                      backgroundColor: combination.harmonyScore >= 8 ? '#28a745' :
                                      combination.harmonyScore >= 6 ? '#ffc107' :
                                      combination.harmonyScore >= 4 ? '#fd7e14' : '#dc3545'
                    }}>
                      Color Harmony: {combination.harmonyScore}/10
                    </span>
                  </div>
                  <button 
                    className="mark-worn-btn"
                    onClick={() => handleMarkWorn(combination)}
                  >
                    I Wore This Combination
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {smartCombinations.length > 0 && (
          <div className="all-combinations">
            <h3>All Suggestions ({selectedOccasion})</h3>
            <div className="combinations-grid">
              {smartCombinations.slice(0, 12).map((combination, index) => (
                <div key={index} className="combination-card-smart">
                  <h4>{combination.name}</h4>
                  <div className="combination-items-smart">
                    {combination.items.map((item, itemIndex) => (
                      item && item.image_url && (
                        <img 
                          key={itemIndex}
                          src={`http://localhost:5001${item.image_url}`}
                          alt={item.name}
                          className="smart-item-image"
                        />
                      )
                    ))}
                  </div>
                  <div className="combination-meta">
                    <span className="harmony-badge" style={{
                      backgroundColor: combination.harmonyScore >= 8 ? '#28a745' :
                                      combination.harmonyScore >= 6 ? '#ffc107' :
                                      combination.harmonyScore >= 4 ? '#fd7e14' : '#dc3545'
                    }}>
                      Color Harmony: {combination.harmonyScore}/10
                    </span>
                  </div>
                  <button 
                    className="mark-worn-btn"
                    onClick={() => handleMarkWorn(combination)}
                  >
                    I Wore This Combination
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getColorCode(color) {
  const colorMap = {
    'siyah': '#000000',
    'beyaz': '#ffffff',
    'mavi': '#0066cc',
    'kırmızı': '#cc0000',
    'sarı': '#ffcc00',
    'yeşil': '#00cc00',
    'pembe': '#ff99cc',
    'mor': '#9933cc',
    'gri': '#808080',
    'kahverengi': '#8b4513',
    'black': '#000000',
    'white': '#ffffff',
    'blue': '#0066cc',
    'red': '#cc0000',
    'yellow': '#ffcc00',
    'green': '#00cc00',
    'pink': '#ff99cc',
    'purple': '#9933cc',
    'gray': '#808080',
    'brown': '#8b4513'
  };
  return colorMap[color?.toLowerCase()] || '#cccccc';
}

export default DashboardPage;

