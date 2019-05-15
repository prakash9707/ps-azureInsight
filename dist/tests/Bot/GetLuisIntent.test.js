"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const GetLuisIntent_1 = require("../../Bot/GetLuisIntent");
describe('Testing luis', () => {
    it('should check luis response for Greeting', () => __awaiter(this, void 0, void 0, function* () {
        let result = yield GetLuisIntent_1.getLuisIntent('hi');
        chai_1.expect(result['topScoringIntent']['intent']).to.equal('greeting');
        chai_1.expect(result['topScoringIntent']['score']).to.above(0.8);
        chai_1.expect(200);
    }));
    it('should check luis response for Cost', () => __awaiter(this, void 0, void 0, function* () {
        let result = yield GetLuisIntent_1.getLuisIntent('cost of resource group');
        chai_1.expect(result['topScoringIntent']['intent']).to.equal('cost');
        chai_1.expect(result['topScoringIntent']['score']).to.above(0.8);
        chai_1.expect(200);
    }));
    it('should check luis response for Cost', () => __awaiter(this, void 0, void 0, function* () {
        let result = yield GetLuisIntent_1.getLuisIntent('cost of resource type');
        chai_1.expect(result['topScoringIntent']['intent']).to.equal('cost');
        chai_1.expect(200);
    }));
});
