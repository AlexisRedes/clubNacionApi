import express from 'express';
import apiAccount from './src/routes/account.js';
import dotenv from 'dotenv';
dotenv.config()

const app = express();
const port = process.env.PROT || 8081;

const verifyApiKey = (req, res, next) => {
    const apiKey = req.header('x-api-key');
  
    if (apiKey && apiKey === process.env.API_KEY) {
      return next(); 
    } else {
      res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
  };


app.use(verifyApiKey);

app.use('/api', apiAccount);

app.listen(port, () => {
  console.log(`API exposed on port: ${port}`);
});