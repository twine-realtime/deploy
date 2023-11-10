import { v4 as uuid4 } from 'uuid';
import { readFileSync } from 'fs';
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { CloudFormationClient, CreateStackCommand, Capability } from '@aws-sdk/client-cloudformation';
import {
  promptReadyToProceed,
  promptProfile,
  parseRegion,
  promptCertificateArn,
  promptReadyToDeploy } from '../utils/helpers.js';

(async () => {
  const isReady = await promptReadyToProceed();

  if (!isReady) {
    console.log('\nTwine deployment cancelled.');
    return; // Exit the process if the user is not ready
  }

  try {
    const profile = await promptProfile();
    const certificateArn = await promptCertificateArn();
    const region = parseRegion(certificateArn);
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
