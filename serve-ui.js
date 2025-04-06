const express = require('express');
const path = require('path');

const app = express();
const PORT = 8081;

// Serve UI files from CyberCrawler/assets/ui at /ui/
app.use('/ui', express.static(path.join(__dirname, 'CyberCrawler/assets/ui')));

// Optional: serve other static assets if needed
// app.use('/assets', express.static(path.join(__dirname, 'CyberCrawler/assets')));

app.listen(PORT, () => {
  console.log(`Static UI server running at http://localhost:${PORT}/ui/`);
});
