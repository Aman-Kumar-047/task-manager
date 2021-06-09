const dao = require('./db.js');
const utils = require('./utils.js');

function getAllTasks(res){
    let searchPromise = dao.getAllTasks();
    searchPromise.then(
        function(tasks){
            let taskDTOs = tasks.map( task => {
                let taskDTO = {
                    "id" : task._id,
                    "status" : task.status,
                    "title" : task.title,
                    "assignee" : task.assignee
                }
                return taskDTO;
            });
           console.log(tasks);
           res.status(200).send(taskDTOs);
        },
        function(err){
            console.log(" No tasks found");
            res.status(404).json({
                errorMessage : "NOT_FOUND"
            });
        }
    )
}

function createTask(body, user, res){
    if (!body || !JSON.parse(body).title ) {
      return res.status(400).json({
        errorMessage: "Task title is mandatory"
      });
    }
    let insertPromise = dao.insertTask(body, user);
    insertPromise.then(
       function(tasks){
            let taskDTO = {
                           "id" : tasks[0]._id,
                           "status" : tasks[0].status,
                           "title" : tasks[0].title,
                           "assignee" : tasks[0].assignee
            }
            return res.status(200).send(taskDTO)
       },
       function(error) {
          return res.status(500).json({
              errorMessage : "Internal Server Occured while inserting Task."
          });
       }
    );
}

function getTaskDetail(taskId, res){
    let searchPromise = dao.getTaskDetailForTaskId(taskId);
    searchPromise.then(
        async function(taskDetail){
            let taskDetailDTO = {
                    "id" : taskDetail._id,
                    "status" : taskDetail.status,
                    "title" : taskDetail.title,
                    "assignee" : (await dao.fetchUserForUserId(taskDetail.assignee)).name,
                    "createdBy" : (await dao.fetchUserForUserId(taskDetail.createdBy)).name,
                    "createdDate" : taskDetail.createdDtm,
                    "updatedDate" : taskDetail.updatedDtm,
                    "data" : {
                        "desc" : taskDetail.data.desc,
                        "images" : taskDetail.data.images
                    },
                    "comments" : await Promise.all(taskDetail.comments.map( async comment => {
                                    let commentDTO = {
                                         "text" : comment.text,
                                         "time" : comment.createdDtm,
                                         "addedBy" : (await dao.fetchUserForUserId(comment.addedBy)).name
                                         };
                                    return commentDTO;
                                    })),
                    "history" :  await Promise.all(taskDetail.histories.map( async history => {
                                    let historyDTO = {
                                        "event" : history.eventType,
                                        "status" : history.status,
                                        "assignee" : (await dao.fetchUserForUserId(history.assignee)).name,
                                        "time" : history.createdDtm,
                                        "updatedBy" : (await dao.fetchUserForUserId(history.changeUser)).name
                                    }
                                    return historyDTO;
                    }))
           }
           res.status(200).send(taskDetailDTO);
        },
        function(err){
            console.log(err)
            console.log(" No tasks found");
            res.status(404).json({
                errorMessage : "NOT_FOUND"
            });
        }
    )
    .catch((error) =>{
        console.log(error);
    });
}

module.exports = {
    getAllTasks,
    createTask,
    getTaskDetail
}