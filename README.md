# Twine Deployment

### Twine AWS Requirements
- IAM User
- Route 53
- DynamoDB
- Secrets Manager
- Elastic Beanstalk
- Certificate Manager
- ElastiCache for Redis
- Application Load Balancer

The Twine architecture is extensive and requires broad permissions. For smooth deployment, we recommend creating a new AWS account and ensuring that Node.js v18.x or greater is installed in your local environment. Complete the steps below to deploy Twine.

## Create an AWS Account and IAM User
1. [Sign up for a new AWS Account](https://portal.aws.amazon.com/billing/signup#/start/email)
2. Sign in to your new AWS Account
3. Click the second rightmost button in the top navbar
4. Select the region where you will deploy Twine
4. Type 'IAM' in the search bar at the top of the page
5. Click on the 'IAM' service
6. Click 'Users' in the sidebar
7. Click 'Create User'
8. Choose a user name and click 'Next'
9. Select 'Attach Policies Directly'
10. Type 'AdministratorAccess' in the 'Permissions Policies' searchbar
11. Select 'AdministratorAccess' and click 'Next'
12. Click 'Create User'
13. Click 'Users' in the sidebar and select the user you created
14. Click the 'Security Credentials' tab
15. Click 'Create Access Key'
16. Select 'Command Line Interface (CLI)'
17. Click 'Next' and then click 'Create Access Key'
18. Prepare to provide your access key and secret access key

## Create an AWS CLI profile
1. [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Execute `aws configure --profile new-profile-name` in terminal
3. Provide your access key and secret access key
4. Provide the region that you previously determined (must match)

## Register a Route 53 Domain
1. Enter the [AWS Console](http://console.aws.amazon.com) and search for 'Route 53'
2. Click 'Dashboard' in the Route 53 page sidebar
3. Check the top right of the webpage and ensure you are in the previously determined region
4. Register a Route 53 domain (you will later use the domain name with the Twine client library)

## Request a TLS Certificate
1. Search for 'Certificate Manager'
2. Click 'Request Certificate' in the Certificate Manager sidebar
3. 'Request a Public Certificate' should be selected; click 'Next'
4. Enter your new domain name
5. Select your validation method of choice
6. Select the 'RSA 2048' key algorithm
7. Click 'Request'
8. Validate the request

## Deploy the Twine Architecture
1. Clone this repository
2. Open your terminal
3. Navigate to the repository directory 
4. Execute `aws configure list`
5. If the 'Name' value is not your newly-created AWS CLI profile name, execute `export AWS_PROFILE=new-profile-name` (this command is different for Windows users)
6. Execute `aws configure list` again to confirm the change occurred
7. Execute `npm install` to install the Twine deployment dependencies
8. Execute `npm start` to launch the deployment process
9. Follow the instructions in your terminal
<img width="619" alt="Screenshot 2023-11-10 at 6 52 06 PM" src="https://github.com/twine-realtime/deploy/assets/85587848/de8ea4d6-9818-42cf-a547-fb2fdd76097a">

The creation process can be observed in the 'Stacks' section of the AWS Cloud Formation page. After the process is complete, the Twine server will be running in the Elastic Beanstalk environment. However, to satisfy browser requirements, Twine must use your newly-created domain name instead of the load balancer endpoint.

## Create a DNS Record
1. Enter the [AWS Console](http://console.aws.amazon.com) and search for 'Route 53'
2. Click 'Hosted Zones' in the AWS Route 53 sidebar
3. Click on the listed domain name
4. Click 'Create Record'
5. Ensure the Record Type is 'A' then click 'Alias'
6. Set the 'Endpoint' to 'Alias to Application and Classic Load Balancer'
7. Select the region name that you previously determined
8. Select the single option for 'Choose Load Balancer'
9. Click 'Create Records'

Record creation will take a few minutes. The Twine architecture will then be complete and ready for the Twine server/client library implementation. Please note that Twine issues third-party cookies for sticky sessions and to store WebSocket session data for connection state recovery.
