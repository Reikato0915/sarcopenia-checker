const QUESTIONS = [
  { id: 'S', icon: '💪', category: '筋力',    text: '重い荷物（買い物袋など）を持ち上げたり運んだりするのが困難ですか？', options: ['困難なし', '少し困難', 'とても困難またはできない'] },
  { id: 'A', icon: '🚶', category: '歩行',    text: '部屋の端から端まで歩くのが困難ですか？',                                options: ['困難なし', '少し困難', 'とても困難またはできない'] },
  { id: 'R', icon: '🪑', category: '立ち上がり', text: '椅子やベッドから立ち上がるのが困難ですか？',                         options: ['困難なし', '少し困難', 'とても困難またはできない'] },
  { id: 'C', icon: '🪜', category: '階段',    text: '10段ほどの階段を昇るのが困難ですか？',                                  options: ['困難なし', '少し困難', 'とても困難またはできない'] },
  { id: 'F', icon: '🤕', category: '転倒歴',  text: '過去1年間で転倒したことはありますか？',                                 options: ['転倒なし', '1〜3回', '4回以上'] }
];

let mode = 'sarcf';
let gender = 'male';
let currentQ = 0;
let scores = [];
let calfScore = null;

function setMode(m) {
  mode = m;
  document.getElementById('tab-sarcf').className   = (m === 'sarcf'    ? 'tab-on'      : 'tab-off') + ' flex-1 py-2.5 rounded-xl text-sm transition-all';
  document.getElementById('tab-sarccalf').className = (m === 'sarccalf' ? 'tab-calf-on' : 'tab-off') + ' flex-1 py-2.5 rounded-xl text-sm transition-all';
  document.getElementById('desc-sarcf').classList.toggle('hidden', m !== 'sarcf');
  document.getElementById('desc-sarccalf').classList.toggle('hidden', m !== 'sarccalf');
}

function setGender(g) {
  gender = g;
  document.getElementById('btn-male').className   = (g === 'male'   ? 'sex-male-on'   : 'sex-off') + ' flex-1 py-3 rounded-xl text-base transition-all';
  document.getElementById('btn-female').className = (g === 'female' ? 'sex-female-on' : 'sex-off') + ' flex-1 py-3 rounded-xl text-base transition-all';
}

function startQuiz() {
  currentQ = 0; scores = []; calfScore = null;
  document.getElementById('screen-intro').classList.add('hidden');
  document.getElementById('screen-quiz').classList.remove('hidden');
  document.getElementById('calf-card').classList.add('hidden');
  document.getElementById('question-card').classList.remove('hidden');
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  document.getElementById('q-icon').textContent     = q.icon;
  document.getElementById('q-category').textContent = q.category;
  document.getElementById('q-text').textContent     = q.text;

  const total = mode === 'sarccalf' ? QUESTIONS.length + 1 : QUESTIONS.length;
  const pct   = Math.round(((currentQ + 1) / total) * 100);
  document.getElementById('progress-label').textContent = `質問 ${currentQ + 1} / ${total}`;
  document.getElementById('progress-pct').textContent   = `${pct}%`;
  document.getElementById('progress-bar').style.width   = `${pct}%`;

  const container = document.getElementById('options-container');
  container.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn-answer w-full text-left px-4 py-4 rounded-xl border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-base font-medium text-gray-700 flex items-center gap-3';
    btn.innerHTML = `<span class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">${idx === 0 ? '✓' : idx === 1 ? '△' : '✗'}</span><span>${opt}</span>`;
    btn.onclick = () => answerQuestion(idx);
    container.appendChild(btn);
  });

  const card = document.getElementById('question-card');
  card.classList.remove('fade-in'); void card.offsetWidth; card.classList.add('fade-in');
}

function answerQuestion(idx) {
  scores.push(idx);
  currentQ++;
  if (currentQ < QUESTIONS.length) {
    renderQuestion();
  } else if (mode === 'sarccalf') {
    document.getElementById('question-card').classList.add('hidden');
    document.getElementById('calf-card').classList.remove('hidden');
    document.getElementById('calf-input').value = '';
    const total = QUESTIONS.length + 1;
    document.getElementById('progress-label').textContent = `質問 ${total} / ${total}`;
    document.getElementById('progress-pct').textContent   = '100%';
    document.getElementById('progress-bar').style.width   = '100%';
  } else {
    showResult();
  }
}

function submitCalf() {
  const val = parseFloat(document.getElementById('calf-input').value);
  if (isNaN(val) || val < 20 || val > 60) { alert('正しい値（20〜60 cm）を入力してください。'); return; }
  calfScore = val < (gender === 'male' ? 34 : 33) ? 10 : 0;
  showResult();
}

function skipCalf() { calfScore = null; showResult(); }

function showResult() {
  document.getElementById('screen-quiz').classList.add('hidden');
  document.getElementById('screen-result').classList.remove('hidden');

  const sarcfTotal = scores.reduce((a, b) => a + b, 0);
  const total      = mode === 'sarccalf' && calfScore !== null ? sarcfTotal + calfScore : sarcfTotal;
  const threshold  = mode === 'sarccalf' ? 11 : 4;
  const maxScore   = mode === 'sarccalf' ? 20 : 10;
  const isHigh     = total >= threshold;

  document.getElementById('result-score-display').textContent = mode === 'sarccalf' && calfScore !== null
    ? `SARC-F: ${sarcfTotal}点 + ふくらはぎ: ${calfScore}点 = 合計 ${total} / ${maxScore} 点`
    : `合計スコア：${total} / ${maxScore} 点`;
  document.getElementById('mode-badge').textContent = mode === 'sarcf' ? '📋 SARC-F 方式' : '📋 SARC-CalF 方式';

  const gauge = document.getElementById('score-gauge');
  gauge.style.width = `${(total / maxScore) * 100}%`;
  document.getElementById('gauge-labels').innerHTML = `<span>0点</span><span class="text-orange-500 font-bold">${threshold}点（要注意）</span><span>${maxScore}点</span>`;

  const icon = document.getElementById('result-icon');
  const title = document.getElementById('result-title');
  const msg   = document.getElementById('result-message');

  if (isHigh) {
    icon.textContent  = '🔴';
    title.textContent = 'サルコペニアの疑いあり';
    title.className   = 'text-xl font-bold mb-1 text-red-600';
    gauge.className   = 'h-3 rounded-full bg-red-400 transition-all duration-700';
    msg.className     = 'rounded-xl p-4 mb-5 bg-red-50';
    msg.innerHTML     = `<p class="text-base font-bold text-red-800 mb-2">⚠️ スコア ${total}点（基準：${threshold}点以上）</p>
      <p class="text-base text-red-700">筋力低下が進んでいる可能性があります。<br><strong>整形外科などへの受診をお勧めします。</strong></p>`;
    document.getElementById('consult-box').classList.remove('hidden');
  } else {
    icon.textContent  = '🟢';
    title.textContent = '現時点では問題なし';
    title.className   = 'text-xl font-bold mb-1 text-emerald-700';
    gauge.className   = 'h-3 rounded-full bg-emerald-400 transition-all duration-700';
    msg.className     = 'rounded-xl p-4 mb-5 bg-teal-50';
    msg.innerHTML     = `<p class="text-base font-bold text-teal-800 mb-2">✅ スコア ${total}点：良好</p>
      <p class="text-base text-teal-700">現時点でサルコペニアのリスクは低い状態です。<br>ただし、筋力は40代から少しずつ低下します。<br><strong>今から予防することが大切です。</strong></p>`;
    document.getElementById('prevention-tips').classList.remove('hidden');
  }
}

function showSummary() {
  const table  = document.getElementById('summary-table');
  const labels = ['筋力（重い荷物）', '歩行（室内移動）', '立ち上がり', '階段（10段）', '転倒歴（1年間）'];
  const opts   = [
    ['困難なし','少し困難','とても困難/できない'],
    ['困難なし','少し困難','とても困難/できない'],
    ['困難なし','少し困難','とても困難/できない'],
    ['困難なし','少し困難','とても困難/できない'],
    ['転倒なし','1〜3回','4回以上']
  ];
  table.innerHTML = scores.map((s, i) => `
    <tr class="border-b border-gray-100">
      <td class="py-1 pr-3 text-gray-500">${labels[i]}</td>
      <td class="py-1 font-bold text-gray-800">${opts[i][s]}（${s}点）</td>
    </tr>`).join('') + (mode === 'sarccalf' && calfScore !== null ? `
    <tr><td class="py-1 pr-3 text-gray-500">ふくらはぎ周囲径</td>
    <td class="py-1 font-bold text-gray-800">${calfScore > 0 ? '基準値未満' : '基準値以上'}（${calfScore}点）</td></tr>` : '');

  document.getElementById('answer-summary').classList.remove('hidden');
  document.getElementById('print-date').textContent = `チェック日：${new Date().toLocaleDateString('ja-JP')}`;
  window.print();
}

function shareLine() {
  const total     = scores.reduce((a, b) => a + b, 0) + (calfScore ?? 0);
  const threshold = mode === 'sarccalf' ? 11 : 4;
  const isHigh    = total >= threshold;
  const msg = isHigh
    ? `【サルコペニアチェック結果】スコア ${total}点 → サルコペニアの疑いあり。整形外科への受診を検討してください。\nチェックはこちら: ${location.href}`
    : `【サルコペニアチェック結果】スコア ${total}点 → 現時点では問題なし。筋トレで予防しましょう！\nチェックはこちら: ${location.href}`;
  window.open(`https://line.me/R/share?text=${encodeURIComponent(msg)}`);
}

function restartQuiz() {
  document.getElementById('screen-result').classList.add('hidden');
  document.getElementById('prevention-tips').classList.add('hidden');
  document.getElementById('consult-box').classList.add('hidden');
  document.getElementById('answer-summary').classList.add('hidden');
  document.getElementById('screen-intro').classList.remove('hidden');
}

// CSP (script-src 'self') blocks inline onclick handlers, so bind here
document.getElementById('tab-sarcf').addEventListener('click', () => setMode('sarcf'));
document.getElementById('tab-sarccalf').addEventListener('click', () => setMode('sarccalf'));
document.getElementById('btn-male').addEventListener('click', () => setGender('male'));
document.getElementById('btn-female').addEventListener('click', () => setGender('female'));
document.querySelectorAll('[data-action="start"]').forEach(el => el.addEventListener('click', startQuiz));
document.getElementById('btn-calf-submit').addEventListener('click', submitCalf);
document.getElementById('btn-calf-skip').addEventListener('click', skipCalf);
document.getElementById('btn-summary').addEventListener('click', showSummary);
document.getElementById('btn-line').addEventListener('click', shareLine);
document.getElementById('btn-restart').addEventListener('click', restartQuiz);
