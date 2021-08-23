exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  // Set the CORS headers to allow Flex to make an error-free HTTP request
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const twilioClient = context.getTwilioClient();
  let workersWithReservations = [];
  const workersList = await twilioClient.taskrouter
    .workspaces(context.WORKSPACE_SID)
    .workers.list();
  for (i = 0; i < workersList.length; i++) {
    const curWorker = workersList[i];
    const reservations = await twilioClient.taskrouter
      .workspaces(context.WORKSPACE_SID)
      .workers(curWorker.sid)
      .reservations.list();
    const completeWorker = { curWorker, reservations };
    workersWithReservations.push(completeWorker);
  }
  response.setBody(workersWithReservations);
  return callback(null, response);
};
