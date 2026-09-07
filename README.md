# 働く人のストレス・セルフチェック

厚生労働省「職業性ストレス簡易調査票（57項目）」を、研修時の自己理解に活用する匿名・非保存型Webアプリです。法令に基づく正式なストレスチェックや、精神疾患の診断を行うものではありません。

## 特徴

- HTML・CSS・JavaScriptだけで動作する静的Webアプリ
- ビルド作業、サーバー、データベースは不要
- 回答・得点・判定結果を保存または送信しない
- GitHub Pagesに対応
- スマートフォン、タブレット、PCに対応
- 厚生労働省の合計点方式による高ストレス判定
- 回答得点を100点換算した2種類の参考指標
- 回答傾向に応じた端末内アドバイス

## ファイル構成

```text
dist/
  index.html       アプリ本体の入口
  styles.css       画面デザイン
  app.mjs          画面操作
  questions.mjs    57項目と回答選択肢
  scoring.mjs      採点・判定・アドバイス
test.mjs           採点ロジックのテスト
.github/workflows/pages.yml
                   GitHub Pages自動公開設定
```

質問、採点処理、画面処理を別ファイルに分けているため、GitHub上で生データを直接確認できます。

## GitHub PagesでURLを取得する方法

1. GitHubで新しいリポジトリを作成します。
2. このプロジェクトのファイル一式を、リポジトリの`main`ブランチへ登録します。
3. リポジトリの「Settings」から「Pages」を開きます。
4. 「Build and deployment」の「Source」で「GitHub Actions」を選択します。
5. 「Actions」で公開処理が完了するまで待ちます。
6. 完了後、次の形式のURLが発行されます。

```text
https://ユーザー名.github.io/リポジトリ名/
```

以後は`main`ブランチを更新するたびに、自動的にGitHub Pagesへ反映されます。

## 動作確認

```text
npm test
```

依存パッケージのインストールは必要ありません。テストにはNode.jsの標準機能だけを使用します。

## 公式資料

- [職業性ストレス簡易調査票（57項目）](https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei12/dl/stress-check_j.pdf)
- [数値基準に基づいて「高ストレス者」を選定する方法](https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei12/pdf/150803-1.pdf)

## 注意事項

本アプリの100点換算値は、回答得点を理論上の最低点から最高点までの範囲で換算した参考値です。厚生労働省が定める公式のパーセンテージ判定、医学的重症度、精神疾患の発症確率、他者との順位を示すものではありません。
