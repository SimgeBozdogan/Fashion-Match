import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [filteredWardrobe, setFilteredWardrobe] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCombinations, setLoadingCombinations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadWardrobe();
  }, []);

  useEffect(() => {
    if (wardrobe.length >= 2) {
      loadCombinations();
    }
  }, [wardrobe]);

  useEffect(() => {
    filterWardrobe();
  }, [wardrobe, searchTerm, selectedCategory, selectedColor, selectedStyle]);

  const loadWardrobe = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/wardrobe');
      const data = await response.json();
      setWardrobe(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      setLoading(false);
    }
  };

  const loadCombinations = async () => {
    setLoadingCombinations(true);
    try {
      const response = await fetch('http://localhost:5001/api/suggestions/generate', {
        method: 'POST'
      });
      const data = await response.json();
      setCombinations(data.combinations || []);
      setLoadingCombinations(false);
    } catch (error) {
      console.error('Error loading combinations:', error);
      setLoadingCombinations(false);
    }
  };

  const filterWardrobe = () => {
    let filtered = [...wardrobe];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(item => item.color === selectedColor);
    }

    if (selectedStyle !== 'all') {
      filtered = filtered.filter(item => item.style === selectedStyle);
    }

    setFilteredWardrobe(filtered);
  };

  const getUniqueColors = () => {
    const colors = wardrobe
      .map(item => item.color)
      .filter(color => color && color !== 'unknown')
      .filter((color, index, self) => self.indexOf(color) === index);
    return colors;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kıyafeti silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/wardrobe/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          loadWardrobe();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedStyle('all');
  };

  const handlePurchaseLink = (link) => {
    if (link && link !== 'https://example.com/shoes') {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="homepage">
      <div className="hero-section">
        <h1>Fashion Match</h1>
        <p className="hero-subtitle">Gardırobunu yönet, eksiklerini fark et, harika kombinasyonlar oluştur!</p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => navigate('/upload')}>
            Kıyafet Ekle
          </button>
          {wardrobe.length > 0 && (
            <button className="secondary-btn" onClick={() => navigate('/suggestions')}>
              Tüm Kombinasyonlar
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="wardrobe-section">
          <h2>Gardırobunuz ({wardrobe.length} kıyafet)</h2>

          {wardrobe.length > 0 && (
            <div className="filters-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Kıyafet ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-controls">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="top">Üst</option>
                  <option value="bottom">Alt</option>
                  <option value="shoes">Ayakkabı</option>
                  <option value="outerwear">Dış Giyim</option>
                  <option value="accessories">Aksesuar</option>
                  <option value="other">Diğer</option>
                </select>

                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tüm Renkler</option>
                  {getUniqueColors().map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>

                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tüm Stiller</option>
                  <option value="casual">Gündelik</option>
                  <option value="formal">Resmi</option>
                  <option value="sporty">Spor</option>
                  <option value="elegant">Şık</option>
                  <option value="bohemian">Bohem</option>
                  <option value="minimalist">Minimalist</option>
                </select>

                {(searchTerm || selectedCategory !== 'all' || selectedColor !== 'all' || selectedStyle !== 'all') && (
                  <button onClick={clearFilters} className="clear-filters-btn">
                    Filtreleri Temizle
                  </button>
                )}
              </div>

              <div className="filter-results">
                {filteredWardrobe.length !== wardrobe.length && (
                  <p>{filteredWardrobe.length} sonuç gösteriliyor</p>
                )}
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : wardrobe.length === 0 ? (
            <div className="empty-wardrobe">
              <p>Henüz gardırobunuza kıyafet eklenmemiş.</p>
              <p>İlk kıyafetinizi ekleyerek başlayın!</p>
              <button onClick={() => navigate('/upload')}>Kıyafet Ekle</button>
            </div>
          ) : filteredWardrobe.length === 0 ? (
            <div className="empty-wardrobe">
              <p>Filtrelere uygun kıyafet bulunamadı.</p>
              <button onClick={clearFilters}>Filtreleri Temizle</button>
            </div>
          ) : (
            <div className="wardrobe-grid">
              {filteredWardrobe.map((item) => (
                <div key={item.id} className="wardrobe-item">
                  {item.image_url && (
                    <img 
                      src={`http://localhost:5001${item.image_url}`} 
                      alt={item.name || 'Item'} 
                      className="item-image"
                    />
                  )}
                  <div className="item-info">
                    <h3>{item.name || 'İsimsiz Kıyafet'}</h3>
                    <div className="item-tags">
                      <span className="tag category">{item.category}</span>
                      {item.color && item.color !== 'unknown' && (
                        <span className="tag color">{item.color}</span>
                      )}
                      <span className="tag style">{item.style}</span>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {wardrobe.length >= 2 && (
          <div className="combinations-sidebar">
            <h2>Kombinasyon Önerileri</h2>
            {loadingCombinations ? (
              <div className="loading">Kombinasyonlar oluşturuluyor...</div>
            ) : combinations.length === 0 ? (
              <p>Henüz kombinasyon oluşturulmadı.</p>
            ) : (
              <div className="combinations-list">
                {combinations.slice(0, 5).map((combination, index) => (
                  <div key={index} className="combination-preview">
                    <h4>{combination.name}</h4>
                    <div className="combination-items-preview">
                      {combination.items.map((item, itemIndex) => (
                        item && item.image_url && (
                          <img 
                            key={itemIndex}
                            src={`http://localhost:5001${item.image_url}`}
                            alt={item.name || 'Item'}
                            className="preview-item-image"
                          />
                        )
                      ))}
                    </div>
                    {combination.missingItems && combination.missingItems.length > 0 && (
                      <div className="missing-items-preview">
                        <p className="missing-hint">Eksik: {combination.missingItems[0].itemName}</p>
                        {combination.missingItems[0].purchaseLink && (
                          <button
                            className="purchase-link-btn"
                            onClick={() => handlePurchaseLink(combination.missingItems[0].purchaseLink)}
                          >
                            Mağazada Gör
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {combinations.length > 5 && (
              <button 
                className="view-all-btn"
                onClick={() => navigate('/suggestions')}
              >
                Tüm Kombinasyonları Gör ({combinations.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
