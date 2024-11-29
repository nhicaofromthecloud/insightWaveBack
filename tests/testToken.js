const jwt = require('jsonwebtoken');

// Mock user ID
const testUserId = '65f97a5d98f8d65b34c0b123';  // Example MongoDB ObjectId

// Your secret from config.env
const SECRET_JWT = 'Gju!hWLSLPIN6%$5q1P1K7*3qGoP6hdhhdehdhdhhdndbbebgygddhdehd';

// Create token function (same as your createToken.js)
function createToken(_id) {
  return jwt.sign({ _id }, SECRET_JWT, {
    algorithm: "HS256",
    expiresIn: '1d',
  });
}

// Test the flow
try {
  // 1. Create a token
  console.log('Creating token...');
  const token = createToken(testUserId);
  console.log('Created Token:', token);
  
  // 2. Decode token without verification (to see payload)
  console.log('\nDecoding token without verification...');
  const decoded = jwt.decode(token);
  console.log('Decoded payload:', decoded);
  
  // 3. Verify token
  console.log('\nVerifying token...');
  const verified = jwt.verify(token, SECRET_JWT);
  console.log('Verified payload:', verified);
  
  console.log('\nSuccess! Token creation and verification working correctly');
} catch (error) {
  console.error('\nError:', error.name, error.message);
} 