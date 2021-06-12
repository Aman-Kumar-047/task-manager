const dao = require('./db.js');
const loginService = require('./login.js');
const taskService = require('./task.js');
const utils = require('./utils.js');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 9004;
app.use(cors());

app.listen(port, () => {
    console.log('Server started on: ' + port);
    dao.connectDb();
});

app.get('/healthcheck', function(req, res){
     return res.status(200).json({ status: "OK" });
});

app.post('/login', function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body +=chunk;
    })
    req.on('end', () => {
        loginService.login(JSON.parse(body).userName,JSON.parse(body).password,res);
    })
});

app.post('/signUp', function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body +=chunk;
    })
    req.on('end', () => {
        loginService.signUp(JSON.parse(body).userName,JSON.parse(body).password,res);
    })
});

app.get('/users', function(req, res){
    const tokenId = req.header('authorization');
    const verifyPromise = utils.verifyToken(tokenId)
    verifyPromise.then((user) => {
        if(user == null){
            return res.status(401).json({ errorMessage: "Unauthorized" });
        } else{
            loginService.searchUser(req.query.userName,res);
        }
    })
});

app.get('/tasks', function(req,res){
    const tokenId = req.header('authorization');
    const verifyPromise = utils.verifyToken(tokenId)
    verifyPromise.then((user) => {
        if(user == null){
            return res.status(401).json({ errorMessage: "Unauthorized" });
        } else{
            taskService.getAllTasks(res);
        }
    })
});

app.post('/task/create', function(req,res){
    const tokenId = req.header('authorization');
    const verifyPromise = utils.verifyToken(tokenId)
    verifyPromise.then((user) => {
        if(user == null){
            return res.status(401).json({ errorMessage: "Unauthorized" });
        } else{
            let body = '';
            req.on('data', chunk => {
                body +=chunk;
            })
            req.on('end', () => {
                taskService.createTask(body,user,res);
            })
        }
    })
});

app.get('/task/detail/:taskId', function(req,res){
    const tokenId = req.header('authorization');
    const verifyPromise = utils.verifyToken(tokenId)
    verifyPromise.then((user) => {
        if(user == null){
            return res.status(401).json({ errorMessage: "Unauthorized" });
        } else{
            taskService.getTaskDetail(req.params.taskId, res);
        }
    })
});
