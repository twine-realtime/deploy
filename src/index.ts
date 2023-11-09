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

(async () => {
  try {
    const profile = await promptProfile();
    const region = await promptRegion();
    const certificateArn = await promptCertificateArn(region);

    const cloudFormationClient = new CloudFormationClient({
      region: region,
      credentials: fromIni({ profile }),
    });

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
      ],
      TemplateBody: templateContent,
      Capabilities: [
        Capability.CAPABILITY_IAM,
        Capability.CAPABILITY_NAMED_IAM
      ],
      StackName: 'TwineStack'
    };

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