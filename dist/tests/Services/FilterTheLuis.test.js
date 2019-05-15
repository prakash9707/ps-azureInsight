"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const FilterTheLuis_1 = require("../../Services/FilterTheLuis");
let inputOutput = {
    input1: {
        "name": "unknown",
        "age": 45
    },
    output1: "Invalid input is passed",
    input2: {
        query: 'Cost',
        topScoringIntent: { intent: 'cost', score: 1 },
        intents: [{ intent: 'cost', score: 1 },
            { intent: 'greeting', score: 0.2577338 },
            { intent: 'None', score: 0.00119688653 },
            { intent: 'billingPeriod', score: 0.000617492 },
            { intent: 'trend', score: 0.0001734528 },
            { intent: 'breakDown', score: 0.00015039288 },
            { intent: 'usageQuantity', score: 8.530452e-10 }],
        entities: []
    },
    output2: {
        filter: [],
        resources: null,
        queryBy: 'billingPeriod',
        dateRange: 'currentPeriod',
        intent: 'cost',
        breakDown: null
    }
};
describe('Testing the FilterTheLuis file', () => {
    it('should expect correct properties from the luis', () => {
        let filter = FilterTheLuis_1.FilterForLuisData(inputOutput.input1);
        chai_1.expect(filter).to.equal("Invalid input is passed");
    });
    it('should return correct filter when query is passed', () => {
        let filter = FilterTheLuis_1.FilterForLuisData(inputOutput.input2);
        chai_1.expect(filter).to.deep.equal(inputOutput.output2);
    });
});
