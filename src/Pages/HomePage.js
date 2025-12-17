import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWardrobe();
  }, []);

  const loadWardrobe = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/wardrobe');
      const data = await response.json();
      setWardrobe(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kıyafeti silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/wardrobe/${id}`, {
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
              Kombinasyonları Gör
            </button>
          )}
        </div>
      </div>

      <div className="wardrobe-section">
        <h2>Gardırobunuz ({wardrobe.length} kıyafet)</h2>
        
        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : wardrobe.length === 0 ? (
          <div className="empty-wardrobe">
            <p>Henüz gardırobunuza kıyafet eklenmemiş.</p>
            <p>İlk kıyafetinizi ekleyerek başlayın!</p>
            <button onClick={() => navigate('/upload')}>Kıyafet Ekle</button>
          </div>
        ) : (
          <div className="wardrobe-grid">
            {wardrobe.map((item) => (
              <div key={item.id} className="wardrobe-item">
                {item.image_url && (
                  <img 
                    src={`http://localhost:5000${item.image_url}`} 
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
    </div>
  );
};

export default HomePage;
