const dao = require('./db.js');
const utils = require('./utils.js');

function searchUser(userName, res){
let searchPromise = dao.searchUser(userName, true);
    searchPromise.then(
      function(users){
        let searchResults = users.map( user => {
            let searchResult = {
                "userName" : user.name
            }
            return searchResult;
        });
       res.status(200).send(searchResults);
      },
      function(error) {
        console.log(" No users found");
        res.status(404).json({
            errorMessage : "NOT_FOUND"
        });
      }
    );
}

function login(userName, password, res){
    // return 400 status if username/password is not exist
    if (!userName || !password ) {
      return res.status(400).json({
        errorMessage: "Both Username and Password is required."
      });
    }
    // return 401 status if the credential is not match.
    let searchPromise = dao.searchUser(userName, false);
    searchPromise.then(
      function(user){
        if(password!==user.password){
            return res.status(401).json({
                errorMessage: "Password is incorrect."
            });
        } else{
            let token = utils.generateToken(user._id, user.name);
            let userObj = utils.getCleanUser(user._id, user.name);
            return res.status(200).json({ user: userObj, token })
        }
      },
      function(error) {
        console.log("No users found");
        return res.status(404).json({
            errorMessage : "User does not exist. Signup required."
        });
      }
    );
}

function signUp(userName, password, res){
    // return 400 status if username/password is not exist
    if (!userName || !password ) {
      return res.status(400).json({
        errorMessage: "Both Username and Password is required."
      });
    }
    let searchPromise = dao.searchUser(userName, false);
    searchPromise.then(
      function(user){
        console.log("user already exists : ",user);
        return res.status(400).json({
          errorMessage: "User Already Exists."
        });
      },
      function(error) {
          let insertPromise = dao.insertUser(userName, password);
          insertPromise.then(
            function(users){
              let token = utils.generateToken(users[0]._id, users[0].name);
              let userObj = utils.getCleanUser(users[0]._id, users[0].name);
              return res.status(200).json({ user: userObj, token })
            },
            function(error) {
              return res.status(500).json({
                  errorMessage : "Internal Server Occured while inserting User."
              });
            }
          );
      }
    );
}

module.exports = {
    searchUser,
    login,
    signUp
}
