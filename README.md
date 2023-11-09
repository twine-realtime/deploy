# Twine Deployment

Twine uses Cloud Formation to deploy on AWS. The Twine architecture is extensive and requires broad permissions. For smooth deployment, we recommend creating a new AWS account and creating an AWS CLI profile for either that account's root credentials or for an IAM role on that account with the AdministratorAccess permission policy. That profile name is to be provided when answering the deployment questions.

A TLS certificate is required to secure your Twine server's WebSocket connection to your clients: In your new AWS account, create a Route 53 domain. (You will later use that domain name with the Twine client library.) Next, use Certificate Manager to request a TLS certificate with an RSA 2048 key for that domain: The AWS region in which you do this determines the region of your Twine deployment.

Once those steps are complete, clone this repo > npm install > npm start and follow the instructions in your terminal.

The creation process can be observed in AWS Management Console > Cloud Formation > Stacks. After the process is complete, the Twine server will be running in the Elastic Beanstalk Environment. However, to satisfy browser requirements, Twine must use the newly-created domain name instead of the load balancer endpoint. A DNS record for the load balancer is necessary:

- Navigate to AWS Management Console > Route 53 > Hosted Zones and click on the listed domain name
- Click Create Record
- Ensure the Record Type is A then click Alias
- Set the Endpoint to 'Alias to Application and Classic Load Balancer'
- Select the region name that you previously determined
- Select the single option for Choose Load Balancer
- Click Create Records

Record creation may take a few minutes. The Twine architecture will then be complete and ready for Twine server/client library implementation. Please note that Twine issues third-party cookies for sticky sessions and to store WebSocket session data for connection state recovery.
