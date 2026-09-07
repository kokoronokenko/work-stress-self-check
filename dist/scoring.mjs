export const REVERSE_KEYS = new Set([
  ...Array.from({ length: 7 }, (_, i) => `A${i + 1}`),
  "A11", "A12", "A13", "A15",
  "B1", "B2", "B3"
]);

export const SCORE_RULE_VERSION = "MHLW-BJSQ57-SIMPLE-2015-08";

export function scoreValue(key, value) {
  if (!Number.isInteger(value) || value < 1 || value > 4) {
    throw new Error("回答値は1〜4である必要があります");
  }
  return REVERSE_KEYS.has(key) ? 5 - value : value;
}

export function calculateScores(answers) {
  const required = [
    ...Array.from({ length: 17 }, (_, i) => `A${i + 1}`),
    ...Array.from({ length: 29 }, (_, i) => `B${i + 1}`),
    ...Array.from({ length: 9 }, (_, i) => `C${i + 1}`),
    "D1", "D2"
  ];
  const missing = required.filter((key) => !Number.isInteger(answers[key]));
  if (missing.length) throw new Error(`未回答があります: ${missing.join(", ")}`);

  const A_score = Array.from({ length: 17 }, (_, i) => `A${i + 1}`)
    .reduce((sum, key) => sum + scoreValue(key, answers[key]), 0);
  const B_score = Array.from({ length: 29 }, (_, i) => `B${i + 1}`)
    .reduce((sum, key) => sum + scoreValue(key, answers[key]), 0);
  const C_score = Array.from({ length: 9 }, (_, i) => `C${i + 1}`)
    .reduce((sum, key) => sum + scoreValue(key, answers[key]), 0);
  const AC_score = A_score + C_score;
  const condition_1 = B_score >= 77;
  const condition_2 = AC_score >= 76 && B_score >= 63;

  return {
    A_score, B_score, C_score, AC_score,
    condition_1, condition_2,
    high_stress: condition_1 || condition_2,
    version: SCORE_RULE_VERSION
  };
}

export function classifyScores(AC_score, B_score) {
  const condition_1 = B_score >= 77;
  const condition_2 = AC_score >= 76 && B_score >= 63;
  return { condition_1, condition_2, high_stress: condition_1 || condition_2 };
}

export function calculateBurdenIndicators(AC_score, B_score) {
  if (AC_score < 26 || AC_score > 104 || B_score < 29 || B_score > 116) {
    throw new Error("得点が理論範囲外です");
  }
  return {
    mindBody: Math.round(((B_score - 29) / 87) * 100),
    workSupport: Math.round(((AC_score - 26) / 78) * 100)
  };
}

const DOMAIN_RULES = [
  { label:"疲労と休息", keys:["B7","B8","B9","B29"], advice:"疲れや睡眠に関するサインがみられます。まずは休息と睡眠を確保できているか振り返り、勤務後に仕事から離れる時間を意識してみましょう。回復しない状態が続く場合は、早めに相談してください。" },
  { label:"緊張や不安", keys:["B10","B11","B12"], advice:"緊張や不安に関する回答が目立ちました。気がかりを一人で整理しきろうとせず、事実と心配事を分けて書き出したり、信頼できる人に話したりすることが役立ちます。" },
  { label:"気分の落ち込み", keys:["B13","B14","B15","B16","B17","B18"], advice:"気分の落ち込みや集中しづらさに関するサインがみられます。無理に頑張り続けず、産業医、保健師、職場の相談窓口、医療機関などへの早めの相談をご検討ください。" },
  { label:"イライラや怒り", keys:["B4","B5","B6"], advice:"イライラや怒りに関する回答が目立ちました。反応が強くなる場面からいったん距離を取り、休憩や深呼吸を挟みながら、負担になっていることを言葉にしてみましょう。" },
  { label:"身体に現れる負担", keys:Array.from({length:11},(_,i)=>`B${i+19}`), advice:"身体の不調に関する回答が目立ちました。睡眠、食事、休息の状態を確認し、症状が続く、強くなる、日常生活に支障がある場合は医療機関へ相談してください。" },
  { label:"仕事の負担", keys:Array.from({length:7},(_,i)=>`A${i+1}`), advice:"仕事量や仕事の難しさに関する負担がうかがえます。優先順位、期限、役割分担を整理し、調整できることがないか上司やチームと相談してみましょう。" },
  { label:"仕事の進め方", keys:["A8","A9","A10"], advice:"仕事の進め方を自分で調整しにくい傾向がみられます。自分で決められる範囲と確認が必要な範囲を整理し、業務の順序や方法について上司と相談してみましょう。" },
  { label:"職場の人間関係", keys:["A12","A13","A14"], advice:"職場の人間関係に関する負担がうかがえます。当事者だけで解決しようとせず、事実と気持ちを整理したうえで、信頼できる上司や第三者の相談窓口を利用することも大切です。" },
  { label:"周囲のサポート", keys:["C1","C2","C4","C5","C7","C8"], advice:"職場で相談したり支援を求めたりしにくい状況がうかがえます。直属の上司に限らず、話しやすい同僚、別部署の管理者、産業保健スタッフなど、利用できる相談経路を確認しておきましょう。" }
];

export function selectAdvice(answers, limit = 2) {
  const ranked = DOMAIN_RULES.map((rule) => ({
    ...rule,
    average: rule.keys.reduce((sum,key)=>sum+scoreValue(key,answers[key]),0)/rule.keys.length
  })).sort((a,b)=>b.average-a.average);
  const selected = ranked.filter((item)=>item.average>=2.5).slice(0,limit);
  if (selected.length) return selected.map(({label,advice})=>({label,advice}));
  return [{label:"今の状態を保つために",advice:"今回の回答では、特に強く表れている負担の傾向はありませんでした。これからも休息や睡眠を大切にし、いつもと違う変化に気づいたときは早めに相談してください。"}];
}
