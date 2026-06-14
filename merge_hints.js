// 将 hints-data.js 合并到 aoshu.html 的 problems 对象中，并修改渲染逻辑
const fs = require('fs');

// 1. 加载 hints 数据
let hintsSrc = fs.readFileSync('hints-data.js', 'utf8');
// 去掉末尾可能存在的 module.exports
hintsSrc = hintsSrc.replace(/\n?module\.exports\s*=\s*hintsData\s*;?\s*$/, '');
const hintsFn = new Function(hintsSrc + '\nreturn hintsData;');
const hintsData = hintsFn();

// 2. 加载原 HTML
let html = fs.readFileSync('aoshu.html', 'utf8');

// 3. 将 hints 数据嵌入 problems：在每题 `title:"..."` 之后插入 `hint:[...]`
// 做法：按级别顺序遍历 problems[level] 每一条 { title:..., cat:..., text:..., solution:..., answer:... }
// 对每条，在 `solution:[` 之前插入 `hint:[...], `
function insertHints(levelText, hintsArr) {
  // 切分：把每一个 { title:"...", ... } 对象找出来
  // 策略：查找 `title:` 对应对象的 `solution:`，按顺序插入 hint
  let idx = 0;
  // 用占位符匹配每一个 solution:
  const result = levelText.replace(/(\s+)solution:\s*\[/g, (match, spaces) => {
    const hint = hintsArr[idx];
    if (!hint) return match; // 防御
    const hintStr = JSON.stringify(hint);
    idx++;
    // 插入 hint: 数组，后跟原 solution
    return `${spaces}hint:${hintStr},${match}`;
  });
  return { text: result, count: idx };
}

// 分三段：easy / medium / hard
const easyStart = html.indexOf('easy: [');
const medStart = html.indexOf('medium: [');
const hardStart = html.indexOf('hard: [');
const problemsEnd = html.indexOf('};', hardStart);

const easyText = html.slice(easyStart, medStart);
const medText = html.slice(medStart, hardStart);
const hardText = html.slice(hardStart, problemsEnd);

const e = insertHints(easyText, hintsData.easy);
const m = insertHints(medText, hintsData.medium);
const h = insertHints(hardText, hintsData.hard);
console.log('inserted hints:', 'easy=' + e.count, 'medium=' + m.count, 'hard=' + h.count);

html = html.slice(0, easyStart) + e.text + m.text + h.text + html.slice(problemsEnd);

// 4. 修改渲染逻辑
// 原来：hint-box 中用 ${p.solution.map(s => ...)}
// 改为：hint-box 用 ${(p.hint || p.solution).map(s => ...)}
// 原来：answer-box 只有 answer
// 改为：answer-box 上方显示 solution（完整步骤），下方显示最终答案
html = html.replace(
  `<div class="hint-box">
        <h4>💡 解题思路（先动动脑筋，再看下方答案）</h4>
        \${p.solution.map(s => \`<div>\${s}</div>\`).join("")}
        <button class="view-answer-btn">🔐 查看答案</button>
      </div>`,
  `<div class="hint-box">
        <h4>💡 解题思路（先动动脑筋，再看下方答案）</h4>
        \${(p.hint || p.solution).map(s => \`<div>\${s}</div>\`).join("")}
        <button class="view-answer-btn">🔐 查看答案</button>
      </div>`
);

// 把 answer-box 改成同时显示完整解答（solution）和最终答案
html = html.replace(
  `<div class="answer-box">
        <h4>✅ 答案</h4>
        <div class="answer">\${p.answer}</div>
      </div>`,
  `<div class="answer-box">
        <h4>✅ 完整解答</h4>
        \${p.solution.map(s => \`<div>\${s}</div>\`).join("")}
        <h4>📝 最终答案</h4>
        <div class="answer">\${p.answer}</div>
      </div>`
);

fs.writeFileSync('aoshu.html', html, 'utf8');
console.log('done. size:', html.length);
