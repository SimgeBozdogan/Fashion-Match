const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const db = new sqlite3.Database('./fashion_match.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS wardrobe_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    color TEXT,
    style TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS combinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    items TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    combination_id INTEGER,
    missing_item TEXT,
    purchase_link TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (combination_id) REFERENCES combinations(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    style_preference TEXT,
    color_preference TEXT,
    occasion_preference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.post('/api/wardrobe/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { name, category, color, style } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  db.run(
    `INSERT INTO wardrobe_items (name, category, color, style, image_url) 
     VALUES (?, ?, ?, ?, ?)`,
    [name || 'Untitled Item', category || 'other', color || 'unknown', style || 'casual', imageUrl],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        name: name || 'Untitled Item',
        category: category || 'other',
        color: color || 'unknown',
        style: style || 'casual',
        image_url: imageUrl
      });
    }
  );
});

app.get('/api/wardrobe', (req, res) => {
  db.all('SELECT * FROM wardrobe_items ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.delete('/api/wardrobe/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM wardrobe_items WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Item deleted', changes: this.changes });
  });
});

app.post('/api/combinations', (req, res) => {
  const { name, items, description } = req.body;
  const itemsJson = JSON.stringify(items);

  db.run(
    `INSERT INTO combinations (name, items, description) VALUES (?, ?, ?)`,
    [name || 'New Combination', itemsJson, description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        name: name || 'New Combination',
        items: items,
        description: description || ''
      });
    }
  );
});

app.get('/api/combinations', (req, res) => {
  db.all('SELECT * FROM combinations ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const combinations = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
    res.json(combinations);
  });
});

function generateCombinations(wardrobeItems) {
  const combinations = [];
  const categories = {
    'top': wardrobeItems.filter(item => ['top', 'shirt', 't-shirt', 'blouse', 'sweater'].includes(item.category?.toLowerCase())),
    'bottom': wardrobeItems.filter(item => ['bottom', 'pants', 'jeans', 'skirt', 'shorts'].includes(item.category?.toLowerCase())),
    'shoes': wardrobeItems.filter(item => ['shoes', 'sneakers', 'boots', 'heels'].includes(item.category?.toLowerCase())),
    'outerwear': wardrobeItems.filter(item => ['jacket', 'coat', 'blazer', 'cardigan'].includes(item.category?.toLowerCase())),
    'accessories': wardrobeItems.filter(item => ['accessory', 'bag', 'belt', 'hat', 'scarf'].includes(item.category?.toLowerCase()))
  };

  for (let i = 0; i < Math.min(5, categories.top.length); i++) {
    for (let j = 0; j < Math.min(5, categories.bottom.length); j++) {
      const combination = {
        items: [categories.top[i], categories.bottom[j]],
        name: `${categories.top[i]?.name || 'Top'} + ${categories.bottom[j]?.name || 'Bottom'}`,
        missingItems: [],
        suggestions: []
      };

      if (categories.shoes.length > 0) {
        combination.items.push(categories.shoes[Math.floor(Math.random() * categories.shoes.length)]);
      } else {
        combination.missingItems.push({
          category: 'shoes',
          description: 'Shoes would complete this look',
          purchaseLink: 'https://example.com/shoes'
        });
      }

      if (categories.outerwear.length > 0 && Math.random() > 0.5) {
        combination.items.push(categories.outerwear[Math.floor(Math.random() * categories.outerwear.length)]);
      }

      if (categories.accessories.length > 0 && Math.random() > 0.6) {
        combination.items.push(categories.accessories[Math.floor(Math.random() * categories.accessories.length)]);
      }

      combinations.push(combination);
    }
  }

  return combinations.slice(0, 10);
}

app.post('/api/suggestions/generate', (req, res) => {
  db.all('SELECT * FROM wardrobe_items', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (rows.length < 2) {
      return res.json({
        combinations: [],
        message: 'Add at least 2 items to your wardrobe to generate combinations'
      });
    }

    const combinations = generateCombinations(rows);
    res.json({ combinations });
  });
});

app.post('/api/suggestions/missing', (req, res) => {
  const { combinationId, missingItem, purchaseLink, description } = req.body;

  db.run(
    `INSERT INTO suggestions (combination_id, missing_item, purchase_link, description) 
     VALUES (?, ?, ?, ?)`,
    [combinationId, missingItem, purchaseLink, description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        combination_id: combinationId,
        missing_item: missingItem,
        purchase_link: purchaseLink,
        description: description
      });
    }
  );
});

app.post('/api/preferences', (req, res) => {
  const { stylePreference, colorPreference, occasionPreference } = req.body;

  db.run(
    `INSERT INTO user_preferences (style_preference, color_preference, occasion_preference) 
     VALUES (?, ?, ?)`,
    [stylePreference || 'casual', colorPreference || 'all', occasionPreference || 'daily'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        style_preference: stylePreference || 'casual',
        color_preference: colorPreference || 'all',
        occasion_preference: occasionPreference || 'daily'
      });
    }
  );
});

app.get('/api/preferences', (req, res) => {
  db.get('SELECT * FROM user_preferences ORDER BY created_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || {});
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

