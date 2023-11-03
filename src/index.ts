import { Command } from 'commander';
import { CloudFormationClient } from "@aws-sdk/client-cloudformation";
import { EC2Client, DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-provider-ini";

const program = new Command();

program
  .name('Twine CLI')
  .description('Deploy Twine with AWS CloudFormation')
  .version('0.1.0');

program
  .command('deploy')
  .description('Supply AWS CLI profile and deploy Twine')
  .requiredOption('-p, --profile <name>', 'AWS CLI profile name for credentials and settings')
  .requiredOption('-r, --region <region>', 'AWS region for deployment')
  .requiredOption('-c, --certificate-arn <arn>', 'ARN of the ACM SSL/TLS certificate for the Load Balancer')
  .action(async (options) => {
    const { profile, region, certificateArn } = options;

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

      // Add step to provision architecture

    } catch (error) {
      console.error('Error fetching AWS regions:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
