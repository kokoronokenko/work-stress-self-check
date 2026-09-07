import assert from "node:assert/strict";
import { classifyScores, scoreValue, calculateScores, calculateBurdenIndicators, selectAdvice, REVERSE_KEYS } from "./dist/scoring.mjs";

assert.equal(classifyScores(75, 76).high_stress, false);
assert.equal(classifyScores(26, 77).high_stress, true);
assert.deepEqual(classifyScores(76, 63), { condition_1:false, condition_2:true, high_stress:true });
assert.equal(classifyScores(76, 62).high_stress, false);
assert.equal(classifyScores(75, 63).high_stress, false);
assert.deepEqual(classifyScores(76, 77), { condition_1:true, condition_2:true, high_stress:true });

for (const key of REVERSE_KEYS) { assert.equal(scoreValue(key, 1), 4); assert.equal(scoreValue(key, 4), 1); }
for (const key of ["A8", "A14", "B4", "C1", "D1"]) { assert.equal(scoreValue(key, 1), 1); assert.equal(scoreValue(key, 4), 4); }

const complete = {};
for (let i=1;i<=17;i++) complete[`A${i}`]=2;
for (let i=1;i<=29;i++) complete[`B${i}`]=2;
for (let i=1;i<=9;i++) complete[`C${i}`]=2;
complete.D1=1; complete.D2=1;
const first = calculateScores(complete);
complete.D1=4; complete.D2=4;
const second = calculateScores(complete);
assert.equal(first.high_stress, second.high_stress);
assert.equal(first.AC_score, second.AC_score);
assert.equal(first.B_score, second.B_score);
delete complete.A1;
assert.throws(() => calculateScores(complete), /未回答/);

// 厚生労働省「数値基準に基づいて高ストレス者を選定する方法」の計算例
const officialScoredA = [4,4,3,2,2,4,1,4,3,3,3,2,3,4,2,3,4];
const officialScoredB = [4,4,4,2,3,3,4,4,4,3,3,4,4,4,3,3,2,2,2,2,3,4,3,4,2,3,3,3,3];
const officialScoredC = [4,3,3,4,3,4,4,3,3];
const officialExample = {};
officialScoredA.forEach((score, i) => { const key=`A${i+1}`; officialExample[key]=REVERSE_KEYS.has(key) ? 5-score : score; });
officialScoredB.forEach((score, i) => { const key=`B${i+1}`; officialExample[key]=REVERSE_KEYS.has(key) ? 5-score : score; });
officialScoredC.forEach((score, i) => { officialExample[`C${i+1}`]=score; });
officialExample.D1=1; officialExample.D2=1;
const officialResult = calculateScores(officialExample);
assert.equal(officialResult.A_score, 51);
assert.equal(officialResult.B_score, 92);
assert.equal(officialResult.C_score, 31);
assert.equal(officialResult.AC_score, 82);
assert.equal(officialResult.high_stress, true);
const advice = selectAdvice(officialExample);
assert.ok(advice.length >= 1 && advice.length <= 2);
assert.ok(advice.every((item)=>item.label && item.advice));
assert.deepEqual(calculateBurdenIndicators(26,29), {mindBody:0,workSupport:0});
assert.deepEqual(calculateBurdenIndicators(104,116), {mindBody:100,workSupport:100});
assert.throws(()=>calculateBurdenIndicators(25,29), /理論範囲外/);

console.log("All scoring tests passed.");
