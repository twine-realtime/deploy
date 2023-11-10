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
var credential_provider_ini_1 = require("@aws-sdk/credential-provider-ini");
var client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
var helpers_js_1 = require("../utils/helpers.js");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var isReady, profile, certificateArn, region, confirmDeployment, cloudFormationClient, templateContent, templateBody, cfParams, createStackCommand, stackResult, cfError_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, helpers_js_1.promptReadyToProceed)()];
            case 1:
                isReady = _a.sent();
                if (!isReady) {
                    console.log('\nTwine deployment cancelled.');
                    return [2 /*return*/]; // Exit the process if the user is not ready
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 10, , 11]);
                return [4 /*yield*/, (0, helpers_js_1.promptProfile)()];
            case 3:
                profile = _a.sent();
                return [4 /*yield*/, (0, helpers_js_1.promptCertificateArn)()];
            case 4:
                certificateArn = _a.sent();
                region = (0, helpers_js_1.parseRegion)(certificateArn);
                return [4 /*yield*/, (0, helpers_js_1.promptReadyToDeploy)()];
            case 5:
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
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, , 9]);
                console.log("Deploying Twine stack to region ".concat(region, "..."));
                createStackCommand = new client_cloudformation_1.CreateStackCommand(cfParams);
                return [4 /*yield*/, cloudFormationClient.send(createStackCommand)];
            case 7:
                stackResult = _a.sent();
                console.log("Stack creation initiated, StackId: ".concat(stackResult.StackId));
                return [3 /*break*/, 9];
            case 8:
                cfError_1 = _a.sent();
                console.error('Error creating AWS CloudFormation stack:', cfError_1);
                return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 11];
            case 10:
                error_1 = _a.sent();
                console.error('An error occurred:', error_1);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); })();
