const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'indexmain.html'));
});

app.get('/indexmain.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'indexmain.html'));
});

app.get('/api/screenshot', async (req, res) => {
  try {
    console.log('Screenshot request received');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 800,
      height: 2800,
      deviceScaleFactor: 1
    });
    
    await page.goto(`http://localhost:${PORT}/index.html`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    console.log('Page loaded successfully');
    
    await page.waitForTimeout(1000);
    
    console.log('Taking screenshot...');
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png'
    });
    console.log('Screenshot taken successfully');
    
    await browser.close();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename=pinterest-infographic.png');
    
    console.log('Sending screenshot to client');
    res.send(screenshotBuffer);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Screenshot endpoint available at http://localhost:${PORT}/api/screenshot`);
});
