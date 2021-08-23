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

  const util = taskrouter.util;

  const TaskRouterCapability = taskrouter.TaskRouterCapability;
  const Policy = TaskRouterCapability.Policy;

  const accountSid = context.ACCOUNT_SID;
  const authToken = context.AUTH_TOKEN;
  const workspaceSid = context.WORKSPACE_SID;
  const workerSid = event.workerSid;

  const TASKROUTER_BASE_URL = 'https://taskrouter.twilio.com';
  const version = 'v1';

  const capability = new TaskRouterCapability({
    accountSid: accountSid,
    authToken: authToken,
    workspaceSid: workspaceSid,
    channelId: workerSid,
  });

  // Helper function to create Policy
  function buildWorkspacePolicy(options) {
    options = options || {};
    var resources = options.resources || [];
    var urlComponents = [
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

  // Event Bridge Policies
  var eventBridgePolicies = util.defaultEventBridgePolicies(
    accountSid,
    workerSid
  );

  // Worker Policies
  var workerPolicies = util.defaultWorkerPolicies(
    version,
    workspaceSid,
    workerSid
  );

  var workspacePolicies = [
    // Workspace fetch Policy
    buildWorkspacePolicy(),
    // Workspace subresources fetch Policy
    buildWorkspacePolicy({ resources: ['**'] }),
    // Workspace Activities Update Policy
    buildWorkspacePolicy({ resources: ['Activities'], method: 'POST' }),
    // Workspace Activities Worker Reserations Policy
    buildWorkspacePolicy({
      resources: ['Workers', workerSid, 'Reservations', '**'],
      method: 'POST',
    }),
  ];

  eventBridgePolicies
    .concat(workerPolicies)
    .concat(workspacePolicies)
    .forEach(function (policy) {
      capability.addPolicy(policy);
    });

  var token = capability.toJwt();

  response.setBody(token);
  return callback(null, response);
};
