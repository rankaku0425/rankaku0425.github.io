# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

UTAU音源キャラクター「ぽぽりん」の公式サイト。ビルドツール不要のバニラ HTML/CSS/JS 構成。
GitHub Pages（`rankaku0425.github.io`）で公開されている。

このリポジトリには **2つの独立したサイト** が共存している。

| ディレクトリ | 役割 | クラス命名体系 |
|---|---|---|
| ルート（`/`） | 現行の公開サイト | `.navbar`, `.hero`, `.about-section` 等 |
| `testver/` | 新デザイン（開発中） | `.kv-nav`, `.scene`, `.chapter`, `.rule-tabs` 等 |

**2つのサイトのクラス・HTML 構造は完全に独立している。** 片方の変更がもう片方に影響することはなく、流用も禁止。

---

## ファイル構成

```
/
├── index.html              # 現行サイト（全ページを1ファイルに収録したSPA）
├── style.css               # 現行サイトのスタイル
├── script.js               # 現行サイトのJS
├── 画像/                   # 共有画像アセット
│   ├── ぽぽりん.png         # キャラクター画像（背景透過PNG）
│   ├── ポポと岐阜.png       # 概要ページ Chapter 2 用
│   ├── ぽぽりんロゴ透過.png  # 概要ページ Chapter 3 用（ロゴ、1500×500px）
│   └── top.png 等
├── UTAU音源「ぽぽりん」利用規約.pdf
├── ぽぽりん画像ガイドライン.pdf
└── testver/
    ├── index.html          # 新デザインサイト
    ├── style.css           # 新デザインのスタイル（?v=日付 でキャッシュバスト）
    └── script.js           # 新デザインのJS（?v=日付 でキャッシュバスト）
```

`画像/` は両サイトから参照される。testver からは `../画像/` の相対パスで参照。

---

## GitHub へのプッシュ

リモートとの差分を避けるため、必ず pull → push のセットで行う。

```bash
git add <変更ファイル>
git commit -m "変更内容"
git pull origin main --rebase && git push origin main
```

コミット不要なもの（`.gitignore` 未設定のため手動で除外）:
- `.claude/` ディレクトリ
- `UTAU音源「ぽぽりん」利用規約oldver.pdf`

---

## 現行サイト（ルート）のアーキテクチャ

### SPA ページ管理

```javascript
pageOrder = ['home', 'about', 'goods', 'download', 'terms', 'contact']
```

- 表示中ページ: `<section class="page active">`
- 非表示ページ: `<section class="page">`（`display: none`）
- `switchPage(targetPage)` で切り替え、`history.pushState` でハッシュ更新
- `popstate` イベントでブラウザの戻る/進むに対応

### スクロール reveal

`.reveal-section` を持つ要素が対象。`animateSections(pageId)` が呼ばれると `revealed` クラスを 130ms 刻みのスタガーで付与する。ページ切り替えのたびにリセット→再アニメーション。

### CSS 変数（現行サイト）

```css
--blue:      #2d6bc4
--orange:    #f0a030
--grad:      linear-gradient(90deg, var(--blue), var(--orange))
--grad-fade: linear-gradient(90deg, transparent, var(--blue) 25%, var(--orange) 75%, transparent)
```

---

## testver のアーキテクチャ

### SPA ページ管理

```javascript
pageOrder = ['home', 'about', 'goods', 'download', 'terms', 'guidelines', 'contact']
```

現行サイトより `guidelines`（画像ガイドライン）が追加されている。

- 表示中ページ: `<section class="scene active">`（現行の `.page` とは別クラス）
- 非表示ページ: `<section class="scene">`（`display: none`）
- `.scene-empty`（グッズ・DL）のみ active 時に `display: flex` で表示
- `switchPage()` はフェードアウト（`.scene-exit`、180ms）→フェードイン（`.scene.active`）の2段階

### アニメーション設計

| クラス | 仕組み | 用途 |
|---|---|---|
| `.appear-up` | JS で `.revealed` を付与（150ms + i×130ms スタガー） | 各ページ内のセクション |
| `.scroll-reveal` | IntersectionObserver で `.revealed` を付与 | ホームの下部スクロールセクション |
| `.scene.active` | `sceneIn` keyframes（フェード+上スライド） | ページ遷移 |
| `.kv__char-float` | `charFloat` keyframes（上下浮遊、6.5s） | ホームのキャラ画像 |

`animateSections(pageId)` は `.appear-up` 要素を対象にする。`contact-link` など自前 `transition` を持つ要素には直接 `.appear-up` を付けず、ラッパー `<div class="appear-up">` を使う（transition 競合を防ぐため）。

### CSS 変数（testver）

```css
--p-blue:    #2d6bc4
--p-orange:  #f0a030
--p-bg:      #f5f8ff
--p-surface: #ffffff
--p-text:    #0d1526
--p-muted:   #6272a0
--p-grad:    linear-gradient(90deg, var(--p-blue), var(--p-orange))
--font-en:   'Barlow Condensed', sans-serif   /* 装飾英字専用フォント */
```

### フォント

- **M PLUS 1p**（400/700/800）: 本文・UI全般
- **Barlow Condensed**（700/800）: 装飾英字のみ（ウォーターマーク・章番号・ラベル等）。`--font-en` 変数で管理

### 概要ページ（Chapter）の画像合成パターン

各 Chapter の accent パネルに画像を合成する仕組み：

1. `.chapter__accent` から `clip-path` を外す（`.chapter__accent--img` で上書き）
2. `::after` 疑似要素で元の `clip-path` と同形の**半透明オーバーレイ**を重ねる
3. これにより画像がうっすら透けて見える効果を実現

```
Chapter 1（青・右配置）: ::after の clip-path = polygon(0 0, 22% 0, 0 100%)  ← 左三角
Chapter 2（橙・左配置）: ::after の clip-path = polygon(78% 0, 100% 0, 100% 100%) ← 右三角
Chapter 3（青・右配置）: Chapter 1 と同じ三角。ロゴ画像は .chapter__accent--logo でセンタリング
```

オーバーレイの不透明度は `rgba(232, 240, 253, 0.95)` で統一（青・全章）。

### タブ UI（利用規約・ガイドライン）

`.rule-tabs__header` の `data-active` 属性（`"ok"` / `"ng"` / `"note"`）を JS で切り替え、CSS が自動でバー位置をスライドさせる。JS はパネルの `display` を切り替えるだけで、バーアニメーションは CSS `transition` が担う。

### キャッシュバスティング

testver の CSS・JS は `?v=YYYYMMDD` クエリを付与してブラウザキャッシュを制御している。スタイルや JS を更新した際はこのバージョン番号も更新する。

```html
<link rel="stylesheet" href="style.css?v=20260510">
<script src="script.js?v=20260510"></script>
```

### レスポンシブブレークポイント

| ブレークポイント | 主な変化 |
|---|---|
| `max-width: 840px` | KV コピー幅・キャラ高さを縮小 |
| `max-width: 768px` | ハンバーガーメニュー表示、KV 縦並び、Chapter カード型に変更 |
| `max-width: 480px` | 文字サイズ・余白をさらに縮小 |

モバイル（768px）での Chapter は `border-radius: 18px` のカード型になり、`chapter-sep` は非表示。`gap: 16px` で間隔を制御。

---

## ページ一覧

### 現行サイト

| ページID | 状態 |
|---|---|
| `home` | 実装済み |
| `about` | 実装済み |
| `goods` | 準備中 |
| `download` | 準備中 |
| `terms` | 実装済み |
| `contact` | 準備中 |

### testver

| ページID | クラス | 状態 |
|---|---|---|
| `home` | `.scene-kv` | 実装済み（ホームにグッズ・DL スクロールセクション含む） |
| `about` | `.scene-about` | 実装済み（Chapter 1〜3、各画像付き） |
| `goods` | `.scene-empty` | 準備中 |
| `download` | `.scene-empty` | 準備中 |
| `terms` | `.scene-terms` | 実装済み（タブUI + PDF DL） |
| `guidelines` | `.scene-guidelines` | 実装済み（タブUI + gl-card + PDF DL） |
| `contact` | `.scene-contact` | 実装済み |
