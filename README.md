# TaskRouter Serverless Token Generation
This repo can be used to deploy a series of serverless functions via Twilio Functions that return capability tokens for use with the TaskRouter SDK. The implementations are based from Twilio documentation here: https://www.twilio.com/docs/taskrouter/js-sdk/workspace.

Endpoints:
1) A workspace token endpoint. This expects a post request with a JSON body: {"workerSid": <WORKERSID>} 
2) A worker token endpoint. This expects a post request with a JSON body: {"workerSid": <WORKERSID>} 

## Instructions
1. Install the Twilio Serverless toolkit if you haven't already following the instructions: https://www.twilio.com/docs/labs/serverless-toolkit/getting-started#install-the-twilio-serverless-toolkit.

2. Add a .env file with the parameters included in example.env

3. Deploy the app to Twilio
```
twilio serverless:deploy
```
