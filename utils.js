var jwt = require('jsonwebtoken');

// generate token and return it
function generateToken(uid, name) {
  //1. Don't use password and other sensitive fields
  //2. Use the information that are useful in other parts
  if (!name) return null;
  var u = {
    userId: uid,
    username: name
  };
  return jwt.sign(u, "T@$KM@N@GER", {
    expiresIn: 60 * 60 * 24 // expires in 24 hours
  });
}
// return basic user details
function getCleanUser(uid, name) {
  if (!name) return null;

  return {
    userId: uid,
    username: name
  };
}
// verify token
async function verifyToken(token){
    if (!token) {
      return null;
    }
    // check token that was passed by decoding token using secret
    const verifyPromise = await jwt.verify(token, "T@$KM@N@GER", function (err, user) {
      if (err) return null;
      // get basic user details
      return user;
    });
    return verifyPromise;
}

module.exports = {
  generateToken,
  getCleanUser,
  verifyToken
}