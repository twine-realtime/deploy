import { Command } from 'commander';
import { v4 as uuid4 } from 'uuid';
import { readFileSync } from 'fs';
import { CloudFormationClient, CreateStackCommand, Capability } from "@aws-sdk/client-cloudformation";
import { EC2Client, DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-provider-ini";
const inquirer = require('inquirer');

const program = new Command();

program
  .name('Twine CLI')
  .description('Deploy Twine with AWS CloudFormation')
  .version('0.1.0');

  program
  .command('deploy')
  .description('Interactively deploy Twine')
  .action(async () => {
    const questions = [
      {
        type: 'input',
        name: 'profile',
        message: 'AWS CLI profile name for credentials and settings:',
        validate: (input: string) => input.length > 0 ? true : "Profile name cannot be empty."
      },
      {
        type: 'input',
        name: 'region',
        message: 'AWS region for deployment:',
        validate: (input: string) => input.length > 0 ? true : "Region cannot be empty."
      },
      {
        type: 'input',
        name: 'certificateArn',
        message: 'ARN of the ACM TLS certificate for the Load Balancer:',
        validate: (input: string) => input.length > 0 ? true : "Certificate ARN cannot be empty."
      }
      // add one for domain name, then use below
    ];

    const answers = await inquirer.prompt(questions);
    const { profile, region, certificateArn } = answers;

    const ec2Client = new EC2Client({ region: "us-east-1" }); // Default to a common region to fetch list of regions

    try {
      const regionsResult = await ec2Client.send(new DescribeRegionsCommand({}));
      const validRegions = regionsResult.Regions?.map(r => r.RegionName) ?? [];

      // Check if the supplied region is a current AWS region
      if (!validRegions.includes(region)) {
        console.error(`The specified region "${region}" is not a valid AWS region.`);
        process.exit(1);
      }

      // Check if the certificate ARN includes the supplied region
      if (!certificateArn.includes(region)) {
        console.error(`The certificate ARN must be from the same region as the specified region: ${region}`);
        process.exit(1);
      }

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
        process.exit(1);
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
        process.exit(1);
      }

    } catch (error) {
      console.error('Error fetching AWS regions:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
