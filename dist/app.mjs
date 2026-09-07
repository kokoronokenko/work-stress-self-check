import { sections } from "./questions.mjs";
import { calculateScores, calculateBurdenIndicators, selectAdvice } from "./scoring.mjs";

const $ = (id) => document.getElementById(id);
const answers = {};
let currentSection = 0;

const startScreen = $("start-screen");
const questionScreen = $("question-screen");
const resultScreen = $("result-screen");
const dialog = $("confirm-dialog");

$("consent").addEventListener("change", (event) => { $("start-button").disabled = !event.target.checked; });
$("start-button").addEventListener("click", () => { startScreen.classList.add("hidden"); questionScreen.classList.remove("hidden"); renderSection(); window.scrollTo(0, 0); });
$("back-button").addEventListener("click", () => { if (currentSection > 0) { currentSection--; renderSection(); window.scrollTo(0, 0); } });
$("next-button").addEventListener("click", advance);
$("exit-button").addEventListener("click", () => dialog.showModal());
$("restart-button").addEventListener("click", () => dialog.showModal());
$("close-button").addEventListener("click", () => dialog.showModal());
dialog.addEventListener("close", () => { if (dialog.returnValue === "confirm") resetApp(); });

function renderSection() {
  const section = sections[currentSection];
  $("section-kicker").textContent = `STEP ${currentSection + 1} OF 4`;
  $("section-letter").textContent = section.id;
  $("section-title").textContent = section.title;
  $("section-lead").textContent = section.lead;
  $("back-button").style.visibility = currentSection === 0 ? "hidden" : "visible";
  $("next-button").textContent = currentSection === sections.length - 1 ? "結果を確認する →" : "次へ →";
  $("form-error").classList.add("hidden");
  const form = $("question-form");
  form.replaceChildren();

  section.questions.forEach((q) => {
    if (section.prompts?.[q.number]) {
      const prompt = document.createElement("div"); prompt.className = "subprompt"; prompt.textContent = section.prompts[q.number]; form.append(prompt);
    }
    const field = document.createElement("fieldset"); field.className = "question"; field.dataset.key = q.key;
    const legend = document.createElement("legend"); legend.className = "question-title"; legend.innerHTML = `<span>${q.number}.</span><span>${q.text}</span>`; field.append(legend);
    const choices = document.createElement("div"); choices.className = "choices";
    q.choices.forEach((labelText, index) => {
      const value = index + 1; const wrap = document.createElement("div"); wrap.className = "choice";
      const input = document.createElement("input"); input.type = "radio"; input.name = q.key; input.id = `${q.key}-${value}`; input.value = String(value); input.checked = answers[q.key] === value;
      input.addEventListener("change", () => { answers[q.key] = value; field.classList.remove("invalid"); updateProgress(); });
      const label = document.createElement("label"); label.htmlFor = input.id; label.textContent = labelText;
      wrap.append(input, label); choices.append(wrap);
    });
    field.append(choices); form.append(field);
  });
  updateProgress();
}

function updateProgress() {
  const count = Object.keys(answers).length;
  $("answer-count").textContent = `${count}／57`;
  $("progress-bar").style.width = `${(count / 57) * 100}%`;
}

function advance() {
  const section = sections[currentSection];
  const missing = section.questions.filter((q) => !Number.isInteger(answers[q.key]));
  document.querySelectorAll(".question.invalid").forEach((el) => el.classList.remove("invalid"));
  if (missing.length) {
    missing.forEach((q) => document.querySelector(`[data-key="${q.key}"]`)?.classList.add("invalid"));
    $("form-error").classList.remove("hidden");
    document.querySelector(`[data-key="${missing[0].key}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (currentSection < sections.length - 1) { currentSection++; renderSection(); window.scrollTo(0, 0); return; }
  showResult();
}

function showResult() {
  try {
    const result = calculateScores(answers);
    questionScreen.classList.add("hidden"); resultScreen.classList.remove("hidden");
    $("result-badge").className = `result-badge${result.high_stress ? " alert" : ""}`;
    $("result-badge").textContent = result.high_stress ? "負担が高まっている可能性があります" : "今回の数値基準では非該当です";
    $("result-title").textContent = result.high_stress ? "いまは、少し立ち止まるタイミングです。" : "これからも、自分の変化に目を向けて。";
    $("result-title").classList.toggle("single-line", !result.high_stress);
    $("result-message").textContent = result.high_stress
      ? "今回の回答では、厚生労働省が示す数値基準上、高ストレスの状態に該当しました。これは精神疾患の診断ではありませんが、心身の負担が高まっている可能性があります。一人で抱え込まず、相談をご検討ください。"
      : "今回の回答では、厚生労働省が示す数値基準上、高ストレスの状態には該当しませんでした。ただし、つらさや不調がないことを保証するものではありません。";
    $("a-score").textContent = `${result.A_score}点`;
    $("b-score").textContent = `${result.B_score}点`;
    $("c-score").textContent = `${result.C_score}点`;
    const indicators = calculateBurdenIndicators(result.AC_score, result.B_score);
    $("mind-body-indicator").textContent = indicators.mindBody;
    $("work-support-indicator").textContent = indicators.workSupport;
    $("mind-body-meter").style.width = `${indicators.mindBody}%`;
    $("work-support-meter").style.width = `${indicators.workSupport}%`;
    const adviceBox = $("personal-advice");
    adviceBox.replaceChildren();
    selectAdvice(answers).forEach((item) => {
      const section = document.createElement("section"); section.className = "advice-item";
      const title = document.createElement("h3"); title.textContent = item.label;
      const copy = document.createElement("p"); copy.textContent = item.advice;
      section.append(title, copy); adviceBox.append(section);
    });
    window.scrollTo(0, 0);
  } catch (_) {
    alert("判定できませんでした。すべての項目への回答をご確認ください。");
  }
}

function resetApp() {
  Object.keys(answers).forEach((key) => delete answers[key]);
  currentSection = 0;
  $("consent").checked = false; $("start-button").disabled = true;
  questionScreen.classList.add("hidden"); resultScreen.classList.add("hidden"); startScreen.classList.remove("hidden");
  window.scrollTo(0, 0);
}

window.addEventListener("beforeunload", () => { Object.keys(answers).forEach((key) => delete answers[key]); });
