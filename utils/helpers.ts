import { fromIni } from "@aws-sdk/credential-provider-ini";
const inquirer = require('inquirer');

export const promptProfile = async () => {
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

export const validateCertificateArn = (input: string) => {
  // Check structure of input certificate ARN
  const arnRegex = /^arn:aws:acm:[a-z0-9-]+:\d{12}:certificate\/[a-zA-Z0-9-]+$/;

  if (input.length === 0) {
    return "Certificate ARN cannot be empty.";
  }

  if (!arnRegex.test(input)) {
    return "The ARN format is invalid.";
  }

  return true;
};

export const promptCertificateArn = async () => {
  let certificateArn = '';
  const question = {
    type: 'input',
    name: 'certificateArn',
    prefix: 'Twine ~',
    message: 'ARN of the ACM TLS certificate:',
    validate: (input: string) => validateCertificateArn(input)
  };

  // Keep prompting until valid input is received
  while (certificateArn === '') {
    const answer = await inquirer.prompt(question);
    certificateArn = answer.certificateArn;
  }
  return certificateArn;
};

export const promptInstanceType = async () => {
  const question = {
    type: 'input',
    name: 'instanceType',
    prefix: 'Twine ~',
    message: 'Your chosen EC2 instance type:',
  };

  const answer = await inquirer.prompt(question);

  return answer.instanceType;
};

export const promptCacheType = async () => {
  const question = {
    type: 'input',
    name: 'cacheType',
    prefix: 'Twine ~',
    message: 'Your chosen ElastiCache for Redis type:',
  };

  const answer = await inquirer.prompt(question);
  console.log(answer.cacheType);
  return answer.cacheType;
};

export const promptReadyToProceed = async () => {
  const question = {
    type: 'confirm',
    name: 'readyToProceed',
    prefix: '',
    message: `\x1b[0m- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

\x1b[0mThis process deploys the Twine architecture on your AWS account.

\x1b[0mYou will be asked to provide:

\x1b[0m1) An AWS CLI profile name for credentials
\x1b[0m2) The ARN of an ACM TLS certificate hosted within the deployment region
\x1b[0m3) The EC2 instance type you wish to use
\x1b[0m4) The ElastiCache Redis type you wish to use

\x1b[0mIf you have not already done so, read the documentation 
\x1b[0mand complete the prerequisite steps in this README:
\x1b[0mhttps://github.com/twine-realtime/deploy/blob/main/README.md

\x1b[0mAre you ready to proceed?`,
    default: false // Default answer
  };

  const answer = await inquirer.prompt(question);
  return answer.readyToProceed;
};

export const promptReadyToDeploy = async () => {
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

export const parseRegion = (certificateArn: string): string => {
  const arnParts = certificateArn.split(':');
  const region = arnParts[3];
  return region;
};