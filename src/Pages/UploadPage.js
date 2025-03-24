import React, { useState } from 'react';
import './UploadPage.css';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    navigate('/suggestions');
  };

  return (
    <div className="upload-page">
      <h2>Kıyafetini Yükle</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && <img src={image} alt="preview" className="preview" />}
      <button onClick={handleSubmit}>Kombinleri Gör</button>
    </div>
  );
};

export default UploadPage;
