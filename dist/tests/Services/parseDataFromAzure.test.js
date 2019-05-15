"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const parseDataFromAzureApi_1 = require("../../Services/parseDataFromAzureApi");
const inputOuput = require("./inputOutput");
let input = {
    "value": [
        {
            "id": "/subscriptions/98846a4a-670c-426e-beac-362d79862397/providers/Microsoft.Billing/billingPeriods/201903-1/providers/Microsoft.Consumption/usageDetails/6377586f-2dc4-6f8d-35c0-1911c943be4a",
            "name": "6377586f-2dc4-6f8d-35c0-1911c943be4a",
            "type": "Microsoft.Consumption/usageDetails",
            "tags": null,
            "properties": {
                "billingPeriodId": "/subscriptions/98846a4a-670c-426e-beac-362d79862397/providers/Microsoft.Billing/billingPeriods/201903-1",
                "usageStart": "2019-01-23T00:00:00.0000000Z",
                "usageEnd": "2019-01-24T00:00:00.0000000Z",
                "instanceId": "/subscriptions/98846a4a-670c-426e-beac-362d79862397/resourceGroups/customSpeech/providers/Microsoft.CognitiveServices/accounts/Speech-Translator",
                "instanceName": "Speech-Translator",
                "meterId": "3bd267f0-01d5-4348-ba67-70e2473f0c27",
                "usageQuantity": 0.008611111111111111,
                "pretaxCost": 0.5691621527777777704337500023,
                "currency": "INR",
                "isEstimated": false,
                "subscriptionGuid": "98846a4a-670c-426e-beac-362d79862397",
                "meterDetails": null
            }
        },
        {
            "id": "/subscriptions/98846a4a-670c-426e-beac-362d79862397/providers/Microsoft.Billing/billingPeriods/201903-1/providers/Microsoft.Consumption/usageDetails/4a434447-08dc-a6d9-9838-074aed8c82c4",
            "name": "4a434447-08dc-a6d9-9838-074aed8c82c4",
            "type": "Microsoft.Consumption/usageDetails",
            "tags": null,
            "properties": {
                "billingPeriodId": "/subscriptions/98846a4a-670c-426e-beac-362d79862397/providers/Microsoft.Billing/billingPeriods/201903-1",
                "usageStart": "2019-01-23T00:00:00.0000000Z",
                "usageEnd": "2019-01-24T00:00:00.0000000Z",
                "instanceId": "/subscriptions/98846a4a-670c-426e-beac-362d79862397/resourceGroups/customSpeech/providers/Microsoft.CognitiveServices/accounts/Speech-Translator",
                "instanceName": "Speech-Translator",
                "meterId": "c2f8be65-ca45-47f2-9451-807406d20d69",
                "usageQuantity": 0.0375000000000000018,
                "pretaxCost": 6.196523437500000297433125,
                "currency": "INR",
                "isEstimated": false,
                "subscriptionGuid": "98846a4a-670c-426e-beac-362d79862397",
                "meterDetails": null
            }
        }
    ]
};
let outputForFindCost = { 'Speech-Translator': 6.765685590277778,
    "currency": "INR",
    keys: ['Speech-Translator'],
    "totalCost": 6.765685590277778,
    "usageDate": '2019-01-23 to 2019-01-23' };
const azure = new parseDataFromAzureApi_1.ParsingAzureData();
describe('Testing the findCost function that returns cost of azure resourcegroup', () => {
    it('should return Invalid input when string input is passed', (done) => {
        let result = azure.findCost('hai');
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
    it('should return Invalid input when number input is passed', (done) => {
        let result = azure.findCost(100);
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
    it('should return Invalid input when boolean input is passed', (done) => {
        let result = azure.findCost(true);
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
    it('should return correct output when valid input is passed', (done) => {
        let result = azure.findCost(input);
        chai_1.expect(result).to.deep.equal(outputForFindCost);
        done();
    });
});
describe('Testing the findmeterCost function that returns cost of azure resourcetype', () => {
    it('should return Invalid input when string input is passed', (done) => {
        let result = azure.findmeterCost('hai');
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
    it('should return Invalid input when number input is passed', (done) => {
        let result = azure.findmeterCost(100);
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
    it('should return Invalid input when boolean input is passed', (done) => {
        let result = azure.findmeterCost(true);
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
});
describe('Testing the Usage Quantity function', () => {
    it('should return correct output when valid input is passed', (done) => {
        let result = azure.FindUsageQuantity(inputOuput.inputData);
        chai_1.expect(result).to.deep.equal(inputOuput.usageDetailsResult);
        done();
    });
    it('should return correct property when valid input is passed', (done) => {
        let result = azure.FindUsageQuantity(inputOuput.inputData);
        chai_1.expect(result).to.have.property('keys');
        chai_1.expect(result).to.have.property('totalCost');
        chai_1.expect(result).to.have.property('usageDate');
        done();
    });
    it('should return invalid input when invalid input is passed', (done) => {
        let result = azure.FindUsageQuantity(true);
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
});
describe('Testing the FindUsageQuantityForResourceType function', () => {
    it('should return correct output when valid input is passed', (done) => {
        let result = azure.FindUsageQuantityForResourceType(inputOuput.inputData);
        chai_1.expect(result).to.deep.equal(inputOuput.usageDetailsResultForResourceType);
        done();
    });
    it('should return correct property when valid input is passed', (done) => {
        let result = azure.FindUsageQuantityForResourceType(inputOuput.inputData);
        chai_1.expect(result).to.have.property('keys');
        chai_1.expect(result).to.have.property('totalCost');
        chai_1.expect(result).to.have.property('usageDate');
        done();
    });
    it('should return invalid input when invalid input is passed', (done) => {
        let result = azure.FindUsageQuantityForResourceType(true);
        chai_1.expect(result).to.equal('Invalid input');
        done();
    });
});
