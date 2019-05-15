"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("supertest");
const serverconf_1 = require("../../Services/serverconf");
let input = {
    filteredData: {
        filter: [],
        resources: 'resourceGroup',
        dateRange: 'currentPeriod',
        intent: 'cost',
        queryBy: 'userChoice'
    }
};
describe('Testing the API', () => {
    after((done) => {
        serverconf_1.server.close(done);
    });
    it('should return 400 when it does not get input', (done) => {
        request(serverconf_1.server)
            .post('/azureData')
            .send()
            .expect(400)
            .end(done);
    });
    it('should return 404 when the bad end point get hit', (done) => {
        request(serverconf_1.server)
            .post('/azuredata')
            .expect(404)
            .end(done);
    });
    it('should return 422 when the wrong type of input is passed', (done) => {
        request(serverconf_1.server)
            .post('/azureData')
            .send('input')
            .expect(422)
            .end(done);
    });
});
