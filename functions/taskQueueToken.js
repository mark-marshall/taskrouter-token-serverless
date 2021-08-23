// Download the Node helper library from twilio.com/docs/node/install
// These consts are your accountSid and authToken from https://www.twilio.com/console
const taskrouter = require('twilio').jwt.taskrouter;

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  // Set the CORS headers to allow Flex to make an error-free HTTP request
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const TaskRouterCapability = taskrouter.TaskRouterCapability;
  const Policy = TaskRouterCapability.Policy;
  const accountSid = context.ACCOUNT_SID;
  const authToken = context.AUTH_TOKEN;
  const workspaceSid = context.WORKSPACE_SID;
  const taskqueueSid = event.taskqueueSid;
  const TASKROUTER_BASE_URL = 'https://taskrouter.twilio.com';
  const version = 'v1';
  // By default, tokens are good for one hour.
  // Override this default timeout by specifiying a new value (in seconds).
  // For example, to generate a token good for 8 hours:
  const ttl = 28800; // 60 * 60 * 8
  const capability = new TaskRouterCapability({
    accountSid: accountSid,
    authToken: authToken,
    workspaceSid: workspaceSid,
    channelId: taskqueueSid,
    ttl: ttl,
  });
  // Helper function to create Policy
  function buildWorkspacePolicy(options) {
    options = options || {};
    const resources = options.resources || [];
    const urlComponents = [
      TASKROUTER_BASE_URL,
      version,
      'Workspaces',
      workspaceSid,
    ];

    return new Policy({
      url: urlComponents.concat(resources).join('/'),
      method: options.method || 'GET',
      allow: true,
    });
  }
  const allowFetchSubresources = buildWorkspacePolicy({
    resources: ['TaskQueue', taskqueueSid, '**'],
  });
  const allowUpdates = buildWorkspacePolicy({
    resources: ['TaskQueue', taskqueueSid],
    method: 'POST',
  });
  capability.addPolicy(allowFetchSubresources);
  capability.addPolicy(allowUpdates);
  const token = capability.toJwt();

  response.setBody(token);
  return callback(null, response);
};
