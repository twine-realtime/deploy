import { v4 as uuid4 } from 'uuid';
import { readFileSync } from 'fs';
import { CloudFormationClient, CreateStackCommand, Capability } from "@aws-sdk/client-cloudformation";
import { EC2Client, DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-provider-ini";
const inquirer = require('inquirer');

const promptProfile = async () => {
  let profile = '';
  const question = {
    type: 'input',
    name: 'profile',
    prefix: 'Twine ~',
    message: 'AWS CLI profile name:',
    validate: async (input: string) => {
      if (input.length === 0) {
        return "Profile name cannot be empty.";
      }
      try {
        // Try to load the credentials to check if the profile exists
        await fromIni({ profile: input })();
        return true;
      } catch (error) {
        // If an error occurs, the profile does not exist
        return `The specified profile "${input}" does not exist or could not be loaded.`;
      }
    }
  };

  // Keep prompting until valid input is received
  while (profile === '') {
    try {
      const answer = await inquirer.prompt(question);
      profile = answer.profile;
    } catch (error) {
      console.error('An error occurred while validating the AWS profile:', error);
      // If an error occurs during validation, the profile variable stays empty and the loop continues
    }
  }
  return profile;
};

const promptRegion = async () => {
  let region = '';
  const question = {
    type: 'input',
    name: 'region',
    prefix: 'Twine ~',
    message: 'AWS region for deployment:',
    // The region validation is now handled in the prompt itself
    validate: async (input: string) => {
      if (input.length === 0) {
        return "Region cannot be empty.";
      }

      // Instantiate an EC2 client to verify the region
      const ec2Client = new EC2Client({ region: "us-east-1" }); // Default to a common region to fetch list of regions
      const regionsResult = await ec2Client.send(new DescribeRegionsCommand({}));
      const validRegions = regionsResult.Regions?.map(r => r.RegionName) ?? [];
      return validRegions.includes(input) ? true : `The specified region "${input}" is not a valid AWS region.`;
    }
  };

  // Keep prompting until valid input is received
  while (region === '') {
    const answer = await inquirer.prompt(question);
    region = answer.region;
  }
  return region;
};

const validateCertificateArn = (input: string, region: string) => {
  // Check structure of input certificate ARN
  const arnRegex = /^arn:aws:acm:[a-z0-9-]+:\d{12}:certificate\/[a-zA-Z0-9-]+$/;

  if (input.length === 0) {
    return "Certificate ARN cannot be empty.";
  }

  if (!arnRegex.test(input)) {
    return "The ARN format is invalid.";
  }

  if (!input.includes(`:acm:${region}:`)) {
    return `The certificate ARN must be from the same region as the deployment region: ${region}`;
  }

  return true;
};

const promptCertificateArn = async (region: string) => {
  let certificateArn = '';
  const question = {
    type: 'input',
    name: 'certificateArn',
    prefix: 'Twine ~',
    message: 'ARN of the ACM TLS certificate:',
    validate: (input: string) => validateCertificateArn(input, region)
  };

  // Keep prompting until valid input is received
  while (certificateArn === '') {
    const answer = await inquirer.prompt(question);
    certificateArn = answer.certificateArn;
  }
  return certificateArn;
};

const promptReadyToProceed = async () => {
  const question = {
    type: 'confirm',
    name: 'readyToProceed',
    prefix: '',
    message: `\x1b[0m- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

\x1b[0mThis process deploys the Twine architecture on your AWS account.

\x1b[0mYou will be asked to provide:

\x1b[0m1) An AWS CLI profile name for credentials
\x1b[0m2) The AWS region for deployment
\x1b[0m3) The ARN of an ACM TLS certificate hosted within the deployment region

\x1b[0mIf you have not already done so, read the documentation 
\x1b[0mand complete the prerequisite steps in this README:
\x1b[0mhttps://github.com/twine-realtime/deploy/blob/main/README.md

\x1b[0mAre you ready to proceed?`,
    default: false // Default answer
  };

  const answer = await inquirer.prompt(question);
  return answer.readyToProceed;
};

const promptReadyToDeploy = async () => {
  const question = {
    type: 'confirm',
    name: 'readyToDeploy',
    prefix: 'Twine ~',
    message: 'Deploy Twine in your AWS account?',
    default: false // Default answer
  };

  const answer = await inquirer.prompt(question);
  return answer.readyToDeploy;
};

(async () => {
  const isReady = await promptReadyToProceed();

  if (!isReady) {
    console.log('\nTwine deployment cancelled.');
    return; // Exit the process if the user is not ready
  }

  try {
    // Validate one at a time
    const profile = await promptProfile();
    const region = await promptRegion();
    const certificateArn = await promptCertificateArn(region);
    const confirmDeployment = await promptReadyToDeploy();

    if (!confirmDeployment) {
      console.log('\nTwine deployment cancelled.');
      return; // Exit the process if the user is not ready
    }

    // New client from validated profile and region
    const cloudFormationClient = new CloudFormationClient({
      region: region,
      credentials: fromIni({ profile }),
    });

    // Parse Cloud Formation template
    let templateContent;
    try {
      const templateBody = './templates/cloudformation.yaml';
      templateContent = readFileSync(templateBody, 'utf8');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Failed to read CloudFormation template: ${err.message}`);
      } else {
        console.error('An unknown error occurred while reading the CloudFormation template');
      }
    }

    // Set values for the parameters established in the template
    const cfParams = {
      Parameters: [
        {
          ParameterKey: 'ACMCertificateARN',
          ParameterValue: certificateArn,
        },
        {
          ParameterKey: 'GeneratedApiKey',
          ParameterValue: uuid4(),
        },
        {
          ParameterKey: 'EnvironmentRegion',
          ParameterValue: region,
        },
        {
          ParameterKey: 'S3BucketParam',
          ParameterValue: `twine-${region}`,
        },
      ],
      TemplateBody: templateContent,
      Capabilities: [
        Capability.CAPABILITY_IAM,
        Capability.CAPABILITY_NAMED_IAM
      ],
      StackName: 'TwineStack'
    };

    // Combine the user input and template to create a stack
    try {
      console.log(`Deploying Twine stack to region ${region}...`);
      const createStackCommand = new CreateStackCommand(cfParams);
      const stackResult = await cloudFormationClient.send(createStackCommand);
      console.log(`Stack creation initiated, StackId: ${stackResult.StackId}`);
    } catch (cfError) {
      console.error('Error creating AWS CloudFormation stack:', cfError);
    }

  } catch (error) {
    console.error('An error occurred:', error);
  }
})();

