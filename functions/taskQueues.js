exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  // Set the CORS headers to allow Flex to make an error-free HTTP request
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const twilioClient = context.getTwilioClient();
  let taskQueues = [];
  const taskQueuesList = await twilioClient.taskrouter
    .workspaces(context.WORKSPACE_SID)
    .taskQueues.list();
  for (i = 0; i < taskQueuesList.length; i++) {
    const curTaskQueue = taskQueuesList[i];
    const taskQueueStats = await twilioClient.taskrouter
      .workspaces(context.WORKSPACE_SID)
      .taskQueues(curTaskQueue.sid)
      .realTimeStatistics()
      .fetch();
    const completeTaskQueue = { curTaskQueue, taskQueueStats };
    taskQueues.push(completeTaskQueue);
  }
  response.setBody(taskQueues);
  return callback(null, response);
};
