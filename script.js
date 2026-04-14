// ===========================
//  ページ順序
// ===========================
const pageOrder = ['home', 'about', 'goods', 'download', 'terms', 'contact'];

// ===========================
//  セクション reveal アニメーション
// ===========================
function animateSections(pageId) {
    const page = document.getElementById('page-' + pageId);
    if (!page) return;
    const sections = page.querySelectorAll('.reveal-section');
    sections.forEach(el => el.classList.remove('revealed'));
    sections.forEach((el, i) => {
        setTimeout(() => el.classList.add('revealed'), 150 + i * 130);
    });
}

// ===========================
//  ページ切り替え
// ===========================
function switchPage(targetPage, updateHash = true) {
    const currentActive = document.querySelector('.page.active');
    const currentName   = currentActive?.id.replace('page-', '') ?? 'home';
    const currentIdx    = pageOrder.indexOf(currentName);
    const targetIdx     = pageOrder.indexOf(targetPage);
    const dir           = targetIdx >= currentIdx ? 'right' : 'left';

    if (currentActive?.id === 'page-' + targetPage) return;

    const showTarget = () => {
        const target = document.getElementById('page-' + targetPage);
        if (!target) return;
        target.dataset.dir = dir;
        target.classList.add('active');
        animateSections(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (currentActive) {
        currentActive.classList.add('page-exit');
        setTimeout(() => {
            currentActive.classList.remove('active', 'page-exit');
            showTarget();
        }, 160);
    } else {
        showTarget();
    }

    // ナビのアクティブ状態を更新
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === targetPage);
    });

    // URLハッシュ更新
    if (updateHash) history.pushState(null, '', '#' + targetPage);
}

// ===========================
//  初期表示（URLハッシュ対応）
// ===========================
const initialPage = window.location.hash.slice(1);
if (initialPage && pageOrder.includes(initialPage)) {
    document.querySelector('.page.active')?.classList.remove('active');
    const initTarget = document.getElementById('page-' + initialPage);
    if (initTarget) {
        initTarget.dataset.dir = 'right';
        initTarget.classList.add('active');
    }
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === initialPage);
    });
}

// 初期ページのセクションもアニメーション
const activePage = document.querySelector('.page.active');
if (activePage) animateSections(activePage.id.replace('page-', ''));

// ブラウザ 戻る/進む 対応
window.addEventListener('popstate', () => {
    const page = window.location.hash.slice(1) || 'home';
    if (pageOrder.includes(page)) switchPage(page, false);
});

// ===========================
//  ナビリンク（PC）
// ===========================
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        switchPage(link.dataset.page);
    });
});

// ===========================
//  ロゴクリック → ホームへ
// ===========================
document.querySelector('.nav-logo').addEventListener('click', () => {
    switchPage('home');
});

// ===========================
//  モバイルメニュー
// ===========================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        switchPage(link.dataset.page);
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
    });
});

// ===========================
//  ナビ スクロール影
// ===========================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 0);
});

// ===========================
//  スワイプ対応（モバイル）
// ===========================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // 水平スワイプのみ（縦スクロールと区別）
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 60) {
        const currentName = document.querySelector('.page.active')?.id.replace('page-', '') ?? 'home';
        const currentIdx  = pageOrder.indexOf(currentName);

        if (dx < 0 && currentIdx < pageOrder.length - 1) {
            switchPage(pageOrder[currentIdx + 1]); // 左スワイプ → 次ページ
        } else if (dx > 0 && currentIdx > 0) {
            switchPage(pageOrder[currentIdx - 1]); // 右スワイプ → 前ページ
        }
    }
}, { passive: true });
