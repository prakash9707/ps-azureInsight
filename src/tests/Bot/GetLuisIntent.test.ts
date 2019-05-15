import { expect } from "chai";
import { getLuisIntent } from "../../Bot/GetLuisIntent";

describe('Testing luis', () => {

    it('should check luis response for Greeting', async() => {
        let result = await getLuisIntent('hi');
        expect(result['topScoringIntent']['intent']).to.equal('greeting');
        expect(result['topScoringIntent']['score']).to.above(0.8);
        expect(200)
    });

    it('should check luis response for Cost', async() => {
        let result = await getLuisIntent('cost of resource group');
        expect(result['topScoringIntent']['intent']).to.equal('cost');
        expect(result['topScoringIntent']['score']).to.above(0.8);
        expect(200)
    });

    it('should check luis response for Cost', async() => {
        let result = await getLuisIntent('cost of resource type');
        expect(result['topScoringIntent']['intent']).to.equal('cost');
        expect(200)
    });

});