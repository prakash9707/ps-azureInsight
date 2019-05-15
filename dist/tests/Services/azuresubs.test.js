"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const azuresubs_1 = require("../../Services/azuresubs");
let inputOutputforApi = {
    "input": {
        filter: [{ category: 'resourceGroup', value: 'remy-demo' }],
        resources: 'resourceGroup',
        dateRange: 'currentPeriod',
        queryBy: 'userChoice',
        intent: 'cost'
    },
    "output": "https://management.azure.com/subscriptions/null/providers/Microsoft.Consumption/usageDetails?$expand=properties/meterDetails&$filter=(properties/instanceName eq 'remy-demo') AND tags eq 'dev:tools'&api-version=2018-10-01",
};
const azure = new azuresubs_1.AzureUsageDetails();
describe('Testing the azureAPI generation', () => {
    it('should return Invalid input when passing invalid input', (done) => {
        let result = azure.generateAzureAPI('hai');
        chai_1.expect(result).to.be.equal('Invalid input');
        done();
    });
    it('should return correct API when filtered data is passed', (done) => {
        let result = azure.generateAzureAPI({ "filteredData": inputOutputforApi.input });
        chai_1.expect(result).to.be.equal(inputOutputforApi.output);
        done();
    });
});
