# OpenPencil の使い方

UIの微調整や新しいページの下書きに、デスクトップ版のOpenPencilを使う。デザインはリポジトリ内の`.op`ファイルとして管理する。

## 使うOpenPencil

- 使うのは[ZSeven-W/openpencil](https://github.com/ZSeven-W/openpencil)（作者はZSeven-W）
- 同じ名前の別物があるので使わない
  - `openpencil.dev`（作者はDanila Poyarkov）
  - Homebrew公式の`openpencil`というcask（tapの名前を付けずに`brew install --cask openpencil`と書くとこちらが入る）

## ホストへのインストール

devcontainerの中ではなく、ホストのMacにデスクトップ版を入れる。tapの名前（`zseven-w/openpencil`）は省かない。

```sh
brew trust zseven-w/openpencil
brew install --cask zseven-w/openpencil/openpencil
```

## 日常の使い方

1. OpenPencilを起動し、リポジトリ内の`.op`ファイルを開く
2. 既存画面のUIを微調整する、または新しいページを下書きする
3. 保存した`.op`ファイルの変更を、通常の変更と同じようにコミットする

## 今の画面を`.op`に取り込む

今動いている画面は、Chromeの拡張機能で`.op`に取り込む。

1. Chromeウェブストアから拡張機能（ID: `ahfofgelkdaobcmglejmjbpnajhpgcij`）を入れる。アカウントは不要
2. 取り込みたい画面をChromeで開き、拡張機能から取り込む
3. `Download .op`で`.op`ファイルとして保存し、リポジトリに置く

## ブランチとコミット

ブランチ・コミット・PRは、これまでどおり`git`と`git-spice`で行う（手順は`.claude/skills/git-spice-workflow/SKILL.md`）。OpenPencilのGitの機能は使わない。
