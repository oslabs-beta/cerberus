```javascript
// Basic Express server with passkeys only
// Example: Basic server setup with Cerberus
import express from 'express';
const { setupCerberus } = require('cerberus-auth');

const app = express();

// Setup core middleware
app.use(express.json());

// Initialize Cerberus
const cerberusOptions = {
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  rpName: 'My Application',
  rpID: 'myapp.com',
  origin: 'https://myapp.com',
  redisUrl: process.env.REDIS_URL,
};

setupCerberus(app, cerberusOptions).then(() => {
  console.log('Cerberus authentication initialized!');

  // Start server after Cerberus is set up
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
});
// Full authentication with both methods

// React client integration
```
