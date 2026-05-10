'use strict';

// ===================================================
// ページ順序
// ===================================================
const pageOrder = ['home', 'about', 'goods', 'download', 'terms', 'guidelines', 'contact'];

// ===================================================
// セクション reveal アニメーション
// ===================================================
function animateSections(pageId) {
    const page = document.getElementById('page-' + pageId);
    if (!page) return;

    const targets = page.querySelectorAll('.appear-up');
    targets.forEach(el => el.classList.remove('revealed'));

    targets.forEach((el, i) => {
        setTimeout(() => el.classList.add('revealed'), 150 + i * 130);
    });
}

// ===================================================
// ページ切り替え
// ===================================================
function switchPage(targetPage, updateHash = true) {
    const currentActive = document.querySelector('.scene.active');
    const targetEl = document.getElementById('page-' + targetPage);

    if (!targetEl || currentActive === targetEl) return;

    // 現在のページをフェードアウト
    if (currentActive) {
        currentActive.classList.add('scene-exit');
        setTimeout(() => {
            currentActive.classList.remove('active', 'scene-exit');
        }, 180);
    }

    // 新ページをフェードイン
    setTimeout(() => {
        targetEl.classList.add('active');
        animateSections(targetPage);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 180);

    // ナビゲーションのアクティブ状態を更新
    document.querySelectorAll('.kv-nav__item, .fmenu-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === targetPage);
    });

    // URLハッシュ更新
    if (updateHash) {
        const hash = targetPage === 'home' ? location.pathname : '#' + targetPage;
        history.pushState(null, '', hash);
    }
}

// ===================================================
// 初期ページ（URLハッシュ対応）
// ===================================================
(function initPage() {
    const hash = location.hash.slice(1);
    const startPage = pageOrder.includes(hash) ? hash : 'home';

    if (startPage !== 'home') {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.classList.remove('active');

        const targetEl = document.getElementById('page-' + startPage);
        if (targetEl) targetEl.classList.add('active');

        document.querySelectorAll('.kv-nav__item, .fmenu-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === startPage);
        });
    }

    animateSections(startPage);
})();

// ===================================================
// ブラウザの戻る/進む
// ===================================================
window.addEventListener('popstate', () => {
    const page = location.hash.slice(1) || 'home';
    if (pageOrder.includes(page)) switchPage(page, false);
});

// ===================================================
// PC ナビリンク
// ===================================================
document.querySelectorAll('.kv-nav__item').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        switchPage(link.dataset.page);
    });
});

// ロゴクリック
document.querySelector('.kv-nav__logo').addEventListener('click', () => {
    switchPage('home');
});

// ページ内リンク（#guidelines など）
document.querySelectorAll('a[href^="#"]').forEach(link => {
    const page = link.getAttribute('href').slice(1);
    if (pageOrder.includes(page)) {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchPage(page);
        });
    }
});

// ===================================================
// 全画面モバイルメニュー
// ===================================================
const hamburger    = document.getElementById('hamburger');
const fullscreenMenu = document.getElementById('fullscreen-menu');
const menuClose    = document.getElementById('menu-close');

function openMenu() {
    fullscreenMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    fullscreenMenu.classList.remove('open');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);

// Escキーで閉じる
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && fullscreenMenu.classList.contains('open')) closeMenu();
});

document.querySelectorAll('.fmenu-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        switchPage(link.dataset.page);
        closeMenu();
    });
});

// ===================================================
// ナビバー スクロールガラス効果
// ===================================================
const kvNav = document.getElementById('kv-nav');
window.addEventListener('scroll', () => {
    kvNav.classList.toggle('scrolled', window.scrollY > 0);
}, { passive: true });

// ===================================================
// スワイプナビゲーション（モバイル）
// ===================================================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
    // メニューが開いている場合はスワイプ無効
    if (fullscreenMenu.classList.contains('open')) return;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // 水平スワイプのみ（横移動 > 縦移動 × 1.5、かつ60px以上）
    if (Math.abs(dx) < Math.abs(dy) * 1.5 || Math.abs(dx) < 60) return;

    // スワイプヒントを即時フェードアウト
    const swipeHint = document.querySelector('.kv__swipe-hint');
    if (swipeHint) {
        swipeHint.style.transition = 'opacity 0.4s';
        swipeHint.style.opacity = '0';
    }

    const activeScene = document.querySelector('.scene.active');
    if (!activeScene) return;

    const currentId = activeScene.id.replace('page-', '');
    const idx = pageOrder.indexOf(currentId);

    if (dx < 0 && idx < pageOrder.length - 1) {
        switchPage(pageOrder[idx + 1]);
    } else if (dx > 0 && idx > 0) {
        switchPage(pageOrder[idx - 1]);
    }
}, { passive: true });

// ===================================================
// ホームのスクロールセクション reveal（IntersectionObserver）
// ===================================================
const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            scrollRevealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-reveal').forEach(el => {
    scrollRevealObserver.observe(el);
});

// ===================================================
// タブ切り替え（利用規約・ガイドライン）
// ===================================================
document.querySelectorAll('.rule-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId     = btn.dataset.tab;
        const tabs      = btn.closest('.rule-tabs');
        const header    = btn.closest('.rule-tabs__header');

        // ボタンのアクティブ状態を切り替え
        tabs.querySelectorAll('.rule-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // ヘッダーの data-active を更新（CSS でバー位置が変わる）
        header.dataset.active = tabId;

        // パネルを切り替え
        tabs.querySelectorAll('.rule-tab-panel').forEach(p => p.classList.remove('active'));
        const targetPanel = tabs.querySelector(`[data-panel="${tabId}"]`);
        if (targetPanel) targetPanel.classList.add('active');
    });
});
