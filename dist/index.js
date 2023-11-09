"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var fs_1 = require("fs");
var client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
var client_ec2_1 = require("@aws-sdk/client-ec2");
var credential_provider_ini_1 = require("@aws-sdk/credential-provider-ini");
var inquirer = require('inquirer');
var promptProfile = function () { return __awaiter(void 0, void 0, void 0, function () {
    var profile, question, answer, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                profile = '';
                question = {
                    type: 'input',
                    name: 'profile',
                    prefix: 'Twine ~',
                    message: 'AWS CLI profile name:',
                    validate: function (input) { return __awaiter(void 0, void 0, void 0, function () {
                        var error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (input.length === 0) {
                                        return [2 /*return*/, "Profile name cannot be empty."];
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    // Try to load the credentials to check if the profile exists
                                    return [4 /*yield*/, (0, credential_provider_ini_1.fromIni)({ profile: input })()];
                                case 2:
                                    // Try to load the credentials to check if the profile exists
                                    _a.sent();
                                    return [2 /*return*/, true];
                                case 3:
                                    error_2 = _a.sent();
                                    // If an error occurs, the profile does not exist
                                    return [2 /*return*/, "The specified profile \"".concat(input, "\" does not exist or could not be loaded.")];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }
                };
                _a.label = 1;
            case 1:
                if (!(profile === '')) return [3 /*break*/, 6];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, inquirer.prompt(question)];
            case 3:
                answer = _a.sent();
                profile = answer.profile;
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('An error occurred while validating the AWS profile:', error_1);
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 1];
            case 6: return [2 /*return*/, profile];
        }
    });
}); };
var promptRegion = function () { return __awaiter(void 0, void 0, void 0, function () {
    var region, question, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                region = '';
                question = {
                    type: 'input',
                    name: 'region',
                    prefix: 'Twine ~',
                    message: 'AWS region for deployment:',
                    // The region validation is now handled in the prompt itself
                    validate: function (input) { return __awaiter(void 0, void 0, void 0, function () {
                        var ec2Client, regionsResult, validRegions;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (input.length === 0) {
                                        return [2 /*return*/, "Region cannot be empty."];
                                    }
                                    ec2Client = new client_ec2_1.EC2Client({ region: "us-east-1" });
                                    return [4 /*yield*/, ec2Client.send(new client_ec2_1.DescribeRegionsCommand({}))];
                                case 1:
                                    regionsResult = _c.sent();
                                    validRegions = (_b = (_a = regionsResult.Regions) === null || _a === void 0 ? void 0 : _a.map(function (r) { return r.RegionName; })) !== null && _b !== void 0 ? _b : [];
                                    return [2 /*return*/, validRegions.includes(input) ? true : "The specified region \"".concat(input, "\" is not a valid AWS region.")];
                            }
                        });
                    }); }
                };
                _a.label = 1;
            case 1:
                if (!(region === '')) return [3 /*break*/, 3];
                return [4 /*yield*/, inquirer.prompt(question)];
            case 2:
                answer = _a.sent();
                region = answer.region;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/, region];
        }
    });
}); };
var validateCertificateArn = function (input, region) {
    // Check structure of input certificate ARN
    var arnRegex = /^arn:aws:acm:[a-z0-9-]+:\d{12}:certificate\/[a-zA-Z0-9-]+$/;
    if (input.length === 0) {
        return "Certificate ARN cannot be empty.";
    }
    if (!arnRegex.test(input)) {
        return "The ARN format is invalid.";
    }
    if (!input.includes(":acm:".concat(region, ":"))) {
        return "The certificate ARN must be from the same region as the deployment region: ".concat(region);
    }
    return true;
};
var promptCertificateArn = function (region) { return __awaiter(void 0, void 0, void 0, function () {
    var certificateArn, question, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                certificateArn = '';
                question = {
                    type: 'input',
                    name: 'certificateArn',
                    prefix: 'Twine ~',
                    message: 'ARN of the ACM TLS certificate:',
                    validate: function (input) { return validateCertificateArn(input, region); }
                };
                _a.label = 1;
            case 1:
                if (!(certificateArn === '')) return [3 /*break*/, 3];
                return [4 /*yield*/, inquirer.prompt(question)];
            case 2:
                answer = _a.sent();
                certificateArn = answer.certificateArn;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/, certificateArn];
        }
    });
}); };
var promptReadyToProceed = function () { return __awaiter(void 0, void 0, void 0, function () {
    var question, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                question = {
                    type: 'confirm',
                    name: 'readyToProceed',
                    prefix: '',
                    message: "\u001B[0m- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n\u001B[0mThis process deploys the Twine architecture on your AWS account.\n\n\u001B[0mYou will be asked to provide:\n\n\u001B[0m1) An AWS CLI profile name for credentials\n\u001B[0m2) The AWS region for deployment\n\u001B[0m3) The ARN of an ACM TLS certificate hosted within the deployment region\n\n\u001B[0mIf you have not already done so, read the documentation \n\u001B[0mand complete the prerequisite steps in this README:\n\u001B[0mhttps://github.com/twine-realtime/deploy/blob/main/README.md\n\n\u001B[0mAre you ready to proceed?",
                    default: false // Default answer
                };
                return [4 /*yield*/, inquirer.prompt(question)];
            case 1:
                answer = _a.sent();
                return [2 /*return*/, answer.readyToProceed];
        }
    });
}); };
var promptReadyToDeploy = function () { return __awaiter(void 0, void 0, void 0, function () {
    var question, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                question = {
                    type: 'confirm',
                    name: 'readyToDeploy',
                    prefix: 'Twine ~',
                    message: 'Deploy Twine in your AWS account?',
                    default: false // Default answer
                };
                return [4 /*yield*/, inquirer.prompt(question)];
            case 1:
                answer = _a.sent();
                return [2 /*return*/, answer.readyToProceed];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var isReady, profile, region, certificateArn, confirmDeployment, cloudFormationClient, templateContent, templateBody, cfParams, createStackCommand, stackResult, cfError_1, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, promptReadyToProceed()];
            case 1:
                isReady = _a.sent();
                if (!isReady) {
                    console.log('\nTwine deployment cancelled.');
                    return [2 /*return*/]; // Exit the process if the user is not ready
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 11, , 12]);
                return [4 /*yield*/, promptProfile()];
            case 3:
                profile = _a.sent();
                return [4 /*yield*/, promptRegion()];
            case 4:
                region = _a.sent();
                return [4 /*yield*/, promptCertificateArn(region)];
            case 5:
                certificateArn = _a.sent();
                return [4 /*yield*/, promptReadyToDeploy()];
            case 6:
                confirmDeployment = _a.sent();
                if (!confirmDeployment) {
                    console.log('\nTwine deployment cancelled.');
                    return [2 /*return*/]; // Exit the process if the user is not ready
                }
                cloudFormationClient = new client_cloudformation_1.CloudFormationClient({
                    region: region,
                    credentials: (0, credential_provider_ini_1.fromIni)({ profile: profile }),
                });
                templateContent = void 0;
                try {
                    templateBody = './templates/cloudformation.yaml';
                    templateContent = (0, fs_1.readFileSync)(templateBody, 'utf8');
                }
                catch (err) {
                    if (err instanceof Error) {
                        console.error("Failed to read CloudFormation template: ".concat(err.message));
                    }
                    else {
                        console.error('An unknown error occurred while reading the CloudFormation template');
                    }
                }
                cfParams = {
                    Parameters: [
                        {
                            ParameterKey: 'ACMCertificateARN',
                            ParameterValue: certificateArn,
                        },
                        {
                            ParameterKey: 'GeneratedApiKey',
                            ParameterValue: (0, uuid_1.v4)(),
                        },
                        {
                            ParameterKey: 'EnvironmentRegion',
                            ParameterValue: region,
                        },
                        {
                            ParameterKey: 'S3BucketParam',
                            ParameterValue: "twine-".concat(region),
                        },
                    ],
                    TemplateBody: templateContent,
                    Capabilities: [
                        client_cloudformation_1.Capability.CAPABILITY_IAM,
                        client_cloudformation_1.Capability.CAPABILITY_NAMED_IAM
                    ],
                    StackName: 'TwineStack'
                };
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                console.log("Deploying Twine stack to region ".concat(region, "..."));
                createStackCommand = new client_cloudformation_1.CreateStackCommand(cfParams);
                return [4 /*yield*/, cloudFormationClient.send(createStackCommand)];
            case 8:
                stackResult = _a.sent();
                console.log("Stack creation initiated, StackId: ".concat(stackResult.StackId));
                return [3 /*break*/, 10];
            case 9:
                cfError_1 = _a.sent();
                console.error('Error creating AWS CloudFormation stack:', cfError_1);
                return [3 /*break*/, 10];
            case 10: return [3 /*break*/, 12];
            case 11:
                error_3 = _a.sent();
                console.error('An error occurred:', error_3);
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); })();
