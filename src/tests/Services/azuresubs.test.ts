import { expect } from 'chai';
import { AzureUsageDetails } from "../../Services/azuresubs";

let inputOutputforApi = {
"input":{
    filter: [ { category: 'resourceGroup', value: 'remy-demo' } ],
    resources: 'resourceGroup',
  dateRange: 'currentPeriod',
  queryBy:'userChoice',
  intent: 'cost' },

  "output":"https://management.azure.com/subscriptions/null/providers/Microsoft.Consumption/usageDetails?$expand=properties/meterDetails&$filter=(properties/instanceName eq 'remy-demo') AND tags eq 'dev:tools'&api-version=2018-10-01",

  

};

const azure : AzureUsageDetails = new AzureUsageDetails();
describe('Testing the azureAPI generation', () => {

    it('should return Invalid input when passing invalid input', (done) => {
        let result = azure.generateAzureAPI('hai');
        expect(result).to.be.equal('Invalid input');
        done();
    });

    it('should return correct API when filtered data is passed', (done) => {
            let result = azure.generateAzureAPI({"filteredData":inputOutputforApi.input});
            expect(result).to.be.equal(inputOutputforApi.output);
            done();
    });
});


