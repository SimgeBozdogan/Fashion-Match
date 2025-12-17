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
  const [activeSidebarCategory, setActiveSidebarCategory] = useState('all');
  const navigate = useNavigate();

  const sidebarCategories = [
    { id: 'all', label: 'Tümü', icon: '👔', category: null },
    { id: 'top', label: 'Kıyafetlerim', icon: '👕', keywords: ['top', 'shirt', 't-shirt', 'blouse', 'sweater', 'tshirt'], category: 'top' },
    { id: 'bottom', label: 'Alt Giyim', icon: '👖', keywords: ['bottom', 'pants', 'jeans', 'skirt', 'shorts', 'pantolon'], category: 'bottom' },
    { id: 'shoes', label: 'Ayakkabılarım', icon: '👠', keywords: ['shoes', 'sneakers', 'boots', 'heels', 'shoe', 'ayakkabi'], category: 'shoes' },
    { id: 'outerwear', label: 'Dış Giyim', icon: '🧥', keywords: ['jacket', 'coat', 'blazer', 'cardigan', 'outerwear', 'hırka', 'ceket'], category: 'outerwear' },
    { id: 'accessories', label: 'Takılarım & Aksesuarlarım', icon: '💍', keywords: ['accessory', 'accessories', 'bag', 'belt', 'hat', 'scarf', 'aksesuar', 'canta', 'kemer', 'sapka', 'atki'], category: 'accessories' }
  ];

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
  }, [wardrobe, searchTerm, selectedCategory, selectedColor, selectedStyle, activeSidebarCategory]);

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

    if (activeSidebarCategory !== 'all') {
      const category = sidebarCategories.find(cat => cat.id === activeSidebarCategory);
      if (category && category.keywords) {
        filtered = filtered.filter(item => 
          category.keywords.some(keyword => 
            item.category?.toLowerCase().includes(keyword.toLowerCase()) ||
            item.name?.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }
    }

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

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return wardrobe.length;
    const category = sidebarCategories.find(cat => cat.id === categoryId);
    if (!category || !category.keywords) return 0;
    return wardrobe.filter(item => 
      category.keywords.some(keyword => 
        item.category?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.name?.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;
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
        <p className="hero-subtitle">Gardırobunu yönet, eksiklerini fark et, harika kombinler oluştur!</p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => navigate('/upload')}>
            Kıyafet Ekle
          </button>
          {wardrobe.length > 0 && (
            <button className="secondary-btn" onClick={() => navigate('/suggestions')}>
              Tüm Kombinler
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="categories-sidebar">
          <h3>Kategoriler</h3>
          <ul className="category-list">
            {sidebarCategories.map(cat => (
              <li 
                key={cat.id}
                className={`category-item ${activeSidebarCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveSidebarCategory(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
                <span className="category-count">({getCategoryCount(cat.id)})</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="wardrobe-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>
              {activeSidebarCategory === 'all' 
                ? `Gardırobum (${wardrobe.length})`
                : `${sidebarCategories.find(c => c.id === activeSidebarCategory)?.label} (${getCategoryCount(activeSidebarCategory)})`
              }
            </h2>
            {activeSidebarCategory !== 'all' && (() => {
                const selectedCategory = sidebarCategories.find(c => c.id === activeSidebarCategory);
                const buttonText = selectedCategory?.label === 'Kıyafetlerim' ? 'Kıyafet Ekle' :
                                  selectedCategory?.label === 'Ayakkabılarım' ? 'Ayakkabı Ekle' :
                                  selectedCategory?.label === 'Takılarım & Aksesuarlarım' ? 'Aksesuar Ekle' :
                                  selectedCategory?.label === 'Alt Giyim' ? 'Alt Giyim Ekle' :
                                  selectedCategory?.label === 'Dış Giyim' ? 'Dış Giyim Ekle' :
                                  'Ürün Ekle';
                return (
                  <button 
                    className="add-item-btn"
                    onClick={() => {
                      if (selectedCategory && selectedCategory.category) {
                        navigate(`/upload?category=${selectedCategory.category}`);
                      } else {
                        navigate('/upload');
                      }
                    }}
                  >
                    + {buttonText}
                  </button>
                );
              })()}
          </div>

          {wardrobe.length > 0 && (
            <div className="filters-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder={(() => {
                    const selectedCategory = sidebarCategories.find(c => c.id === activeSidebarCategory);
                    if (selectedCategory?.label === 'Kıyafetlerim') return 'Kıyafet ara...';
                    if (selectedCategory?.label === 'Ayakkabılarım') return 'Ayakkabı ara...';
                    if (selectedCategory?.label === 'Takılarım & Aksesuarlarım') return 'Aksesuar ara...';
                    if (selectedCategory?.label === 'Alt Giyim') return 'Alt giyim ara...';
                    if (selectedCategory?.label === 'Dış Giyim') return 'Dış giyim ara...';
                    return 'Kıyafet ara...';
                  })()}
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

                {(searchTerm || selectedCategory !== 'all' || selectedColor !== 'all' || selectedStyle !== 'all' || activeSidebarCategory !== 'all') && (
                  <button onClick={() => {
                    clearFilters();
                    setActiveSidebarCategory('all');
                  }} className="clear-filters-btn">
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
              <p>Henüz gardırobuna kıyafet eklenmemiş.</p>
              <p>İlk kıyafetinizi ekleyerek başlayın!</p>
              <button onClick={() => navigate('/upload')}>Kıyafet Ekle</button>
            </div>
          ) : filteredWardrobe.length === 0 ? (
            <div className="empty-wardrobe">
              <p>Filtrelere uygun kıyafet bulunamadı.</p>
              <button onClick={() => {
                clearFilters();
                setActiveSidebarCategory('all');
              }}>Filtreleri Temizle</button>
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
          <div className="combinations-sidebar" onClick={() => navigate('/suggestions')} style={{ cursor: 'pointer' }}>
            <h2>Kombin Önerileri</h2>
            {loadingCombinations ? (
              <div className="loading">Kombinler oluşturuluyor...</div>
            ) : combinations.length === 0 ? (
              <p>Henüz kombin oluşturulmadı.</p>
            ) : (
              <div className="combinations-list">
                {combinations.slice(0, 5).map((combination, index) => (
                  <div 
                    key={index} 
                    className="combination-preview"
                  >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchaseLink(combination.missingItems[0].purchaseLink);
                            }}
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
                Tüm Kombinleri Gör ({combinations.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
