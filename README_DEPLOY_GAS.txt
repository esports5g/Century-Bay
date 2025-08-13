
# 世紀港湾｜GAS メール連携 版（GitHub Pages 対応）

このパッケージは Google Apps Script（GAS）をメール中継として利用し、静的ホスティング（GitHub Pages など）からでもお問い合わせ内容を info@centurybay.jp に送信できるようにしたものです。

## 手順（概要）
1. Google アカウントで https://script.google.com/ を開き、新規プロジェクトを作成。
2. `Code.gs` に以下のコードを貼り付け、保存：

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents || '{}');
  var name = data.name || '';
  var email = data.email || '';
  var phone = data.phone || '';
  var topic = data.topic || '';
  var message = data.message || '';
  var subject = '【サイト問い合わせ】' + name;
  var body = 'お名前: ' + name + '\n' +
             'Email: ' + email + '\n' +
             '電話: ' + phone + '\n' +
             '区分: ' + topic + '\n\n' +
             '本文:\n' + message + '\n\n' +
             '---- meta ----\n' +
             'UA: ' + (data.ua || '') + '\n' +
             'URL: ' + (data.url || '') + '\n' +
             'TS: ' + (data.ts || '');
  MailApp.sendEmail({
    to: 'info@centurybay.jp',
    subject: subject,
    body: body
  });
  return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 右上「**デプロイ > 新しいデプロイ**」→ 種類「**ウェブアプリ**」→ 実行ユーザー「**自分**」→ アクセス権「**全員**」→ デプロイ。
4. 表示された **Web アプリ URL** をコピー。
5. 本パッケージの `gas.config.json` を開き、`webapp_url` をその URL に置き換えて保存。
6. GitHub Pages 等にアップロード。以後、フォーム送信で GAS を経由して `info@centurybay.jp` に届きます。

## 備考
- `gas.js` は `text/plain` で POST するため、プリフライト不要で動作します。
- 万一 GAS が未設定の場合、送信時に設定アラートを表示します（メールは送信されません）。
- `email.js` / `contact.js` は残してあり、将来 PHP や EmailJS を使う場合にも流用できます。
