const mongo = require('mongodb').MongoClient
const uuid = require('uuid')
const url = 'mongodb+srv://amanDev:qwertyuiop123@personal-dev.erfmz.mongodb.net/test?retryWrites=true&w=majority&ssl=true'
let client;
let date = new Date();
async function connectDb(){
    mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err, con) => {
//      console.log("con ",con);
      if (err) {
        console.error(err)
        return
      }
      const db = con.db('Task-Manager')
      console.log("Connection success")
      client = db
    })
}
//DATABASE layer----queries---

function searchUser(userName, regex){
    const userCollection = client.collection('users')
    let searchPromise = new Promise(function(myResolve, myReject) {
    if(regex){
        userCollection.find({name:new RegExp(userName,"i")}).toArray((err, users) => {
            if (users.length > 0) {myResolve(users);}
            else{ myReject();}
        });
    } else {
         userCollection.findOne({name:userName}, (err, user) => {
            if (user) {myResolve(user);}
            else { myReject();}
        });
    }
    });
    return searchPromise;
}

function fetchUserForUserId(userId){
    const userCollection = client.collection('users')
    let searchPromise = new Promise(function(myResolve, myReject) {
         userCollection.findOne({_id:userId}, (err, user) => {
            if (user) {myResolve(user);}
            else { myReject();}
        });
    });
    return searchPromise;
}

function insertUser(userName,password){
    const userCollection = client.collection('users')
    let insertPromise = new Promise(function(myResolve, myReject) {
        userCollection.insertOne({_id:uuid.v4(), name:userName, password:password}, (err, user) => {
                  if (user) { myResolve(user.ops); }
                  else { myReject(); }
        });
    });
    return insertPromise;
}

function getAllTasks(){
    const taskCollection = client.collection('tasks')
    let taskSearchPromise = new Promise(function(myResolve, myReject) {
        taskCollection.find().toArray((err, tasks) => {
            if (tasks.length > 0) {myResolve(tasks);}
            else{ myReject();}
        });
    });
    return taskSearchPromise;
}

function insertTask(body, user){
    const taskCollection = client.collection('tasks')
    const currentDateTime = Date.now();
    let task = {
                    "_id" : uuid.v4(),
                    "status" : "TO DO",
                    "title" : JSON.parse(body).title,
                    "data" : {
                        "desc" : JSON.parse(body).data.desc,
                        "images" : JSON.parse(body).data.images
                    },
                    "assignee" : JSON.parse(body).assignee,
                    "createdDtm" : currentDateTime,
                    "updatedDtm" : currentDateTime,
                    "createdBy" : user.userId
    };
    let insertPromise = new Promise(function(myResolve, myReject) {
        taskCollection.insertOne(task, (err, task) => {
                  if (task) { myResolve(task.ops); }
                  else { myReject(); }
        });
    });
    return insertPromise;
}

function getTaskDetailForTaskId(taskId){
    const taskCollection = client.collection('tasks')
    let taskSearchPromise = new Promise(function(myResolve, myReject) {
        taskCollection.aggregate([
                       {
                           $lookup:
                           {
                               from: "history",
                               localField: "_id",
                               foreignField: "taskId",
                               as: "histories"
                           }
                       },
                       {
                           $lookup:
                           {
                               from: "comments",
                               localField: "_id",
                               foreignField: "taskId",
                               as: "comments"
                           }
                       },
                       {
                           $match: { _id: taskId }
                       }
                       ]).toArray((err, taskDetails) => {
            if (taskDetails) {myResolve(taskDetails[0]);}
            else{ myReject();}
        });
    });
    return taskSearchPromise;
}

module.exports = {
    connectDb,
    searchUser,
    fetchUserForUserId,
    insertUser,
    getAllTasks,
    insertTask,
    getTaskDetailForTaskId
}