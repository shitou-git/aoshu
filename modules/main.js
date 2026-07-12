// ========== 主入口路由模块（懒加载版） ==========
// 所有页面都是懒加载：只在用户首次点击时才动态加载对应模块

let currentGame = 'home';
const moduleCache = {
    aoshu: null,
    silu: null,
    math: null,
    dc: null,
};

// ========== 页面导航 ==========
async function showGame(game) {
    document.getElementById('homePage').style.display = 'none';
    const pages = ['aoshuPage', 'siluPage', 'mathPage', 'dcPage'];
    pages.forEach(id => document.getElementById(id).classList.remove('active'));

    const pageEl = document.getElementById(game + 'Page');
    pageEl.classList.add('active');
    currentGame = game;

    const mod = await ensureGame(game);
    if (currentGame !== game) return;

    if (game === 'aoshu') mod.initAoshu();
    else if (game === 'silu') await mod.initSilu();
    else if (game === 'math') mod.initMath();
    else if (game === 'dc') mod.initDc();
}

function goHome() {
    document.getElementById('homePage').style.display = 'block';
    const pages = ['aoshuPage', 'siluPage', 'mathPage', 'dcPage'];
    pages.forEach(id => document.getElementById(id).classList.remove('active'));
    currentGame = 'home';
}

// ========== 懒加载模块 ==========
async function ensureGame(game) {
    if (moduleCache[game]) return moduleCache[game].mod;
    let mod;
    if (game === 'aoshu') {
        mod = await import('./aoshu.js');
        mod.injectAoshuStyle();
        document.getElementById('aoshuPage').innerHTML = mod.renderAoshuHTML();
    } else if (game === 'silu') {
        mod = await import('./silu.js');
        document.getElementById('siluPage').innerHTML = mod.renderSiluHTML();
    } else if (game === 'math') {
        mod = await import('./math.js');
        mod.injectMathStyle();
        document.getElementById('mathPage').innerHTML = mod.renderMathHTML();
    } else if (game === 'dc') {
        mod = await import('./dc.js');
        document.getElementById('dcPage').innerHTML = mod.renderDcHTML();
    }
    moduleCache[game] = { mod };
    return mod;
}

// ========== 数学游戏内部导航 ==========
function showMathGame(subGame) {
    const mod = moduleCache.math && moduleCache.math.mod;
    if (mod && typeof mod.mathShowGame === 'function') {
        mod.mathShowGame(subGame);
    }
}

// ========== 挂载到 window ==========
window.showGame = showGame;
window.goHome = goHome;
window.showMathGame = showMathGame;
