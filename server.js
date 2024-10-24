require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

// Google Cloud Storage setup
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n'),
  },
});
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Local file storage setup
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Multer file upload setup
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// File upload route (local storage)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
});

// OpenAI prompt route (Agent Zero)
app.post('/api/openai-prompt', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await openai.completions.create({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 100,
    });
    res.json(response.data.choices[0].text);
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Error with OpenAI API' });
  }
});

// Smithsonian collections route
app.get('/api/smithsonian-collections', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.si.edu/openaccess/api/v1.0/search?q=art&api_key=${process.env.SMITHSONIAN_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Smithsonian data:', error);
    res.status(500).json({ error: 'Error fetching Smithsonian data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});