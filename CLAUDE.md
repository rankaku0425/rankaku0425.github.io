# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

UTAU音源キャラクター「ぽぽりん」の公式サイト。ビルドツール不要のバニラ HTML/CSS/JS 構成。
GitHub Pages（`rankaku0425.github.io`）で公開されている。

## ファイル構成

- `index.html` — 全ページのマークアップ。SPA 構造で全ページが `<section id="page-*">` として並ぶ
- `style.css` — 全スタイル。CSS 変数（`--blue` / `--orange` / `--grad`）でカラー管理
- `script.js` — ページ切り替え・URLハッシュ・スワイプ・スクロールreveal を担当
- `スクショコピー/ぽぽりん.png` — ヒーロー画像（背景透過PNG）
- `UTAU音源「ぽぽりん」利用規約.pdf` — 利用規約全文（ダウンロードリンク用）

## アーキテクチャ

### ページ管理（SPA）

全ページは `index.html` に存在し、JS の `switchPage(targetPage)` で表示を切り替える。

```
pageOrder = ['home', 'about', 'goods', 'download', 'terms', 'contact']
```

- 表示中ページ: `<section class="page active">`
- 非表示ページ: `<section class="page">`（`display: none`）
- ページ遷移時に `data-dir="right"|"left"` を付与してスライドアニメーションを制御

### スクロール reveal

`.reveal-section` クラスを持つ要素（`.about-section`、`.terms-section`）は初期状態で非表示。
`animateSections(pageId)` が呼ばれると 130ms 刻みのスタガーで `revealed` クラスを付与し表示する。
ページ切り替えのたびにリセット→再アニメーションされる。

### CSS 変数

```css
--blue:      #2d6bc4
--orange:    #f0a030
--grad:      linear-gradient(90deg, var(--blue), var(--orange))
--grad-fade: linear-gradient(90deg, transparent, var(--blue) 25%, var(--orange) 75%, transparent)
```

アクセントカラーの変更はここだけ修正すれば全体に反映される。

### URLハッシュ

ページ切り替えで `history.pushState` により `#about` 等のハッシュを更新。
`popstate` イベントでブラウザの戻る/進むボタンに対応。

## ページ一覧

| ページID | 説明 | 状態 |
|---|---|---|
| `home` | キャラ紹介（ヒーロー2カラム） | 実装済み |
| `about` | キャラ概要・3セクション（交互背景） | 実装済み |
| `goods` | グッズ情報 | 準備中（空白） |
| `download` | ダウンロード | 準備中（空白） |
| `terms` | 音声利用規約（要約カード＋PDF DL） | 実装済み |
| `contact` | お問い合わせ | 準備中（空白） |

## GitHub へのプッシュ

リモートに差分が生じることがあるため、毎回 pull → push のセットで行う。

```bash
git add <変更ファイル>
git commit -m "変更内容"
git pull origin main --rebase && git push origin main
```

`スクショコピー/` 内の参照画像（`ぽぽりん.png` 以外）と `.claude/` はコミット不要。
