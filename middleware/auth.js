const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const verifyTokenWithRetry = async (token, secret, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await jwt.verify(token, secret);
    } catch (error) {
      console.log(`JWT verification attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

const requireAuth = async (req, res, next) => {
  // Skip auth check if appscript header is true
  if (req.headers.appscript === 'true') {
    return next();
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = authorization.split(' ')[1];
  console.log(token);

  try {
    await verifyTokenWithRetry(token, process.env.SECRET_JWT);
    next();
  } catch (error) {
    console.error('JWT verification failed after all retries. Restarting server...');
    process.on('exit', () => {
      require('child_process').spawn(process.argv.shift(), process.argv, {
        cwd: process.cwd(),
        detached: true,
        stdio: 'inherit'
      });
    });
    process.exit();
  }
};

module.exports = requireAuth;