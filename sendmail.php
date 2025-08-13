<?php
header('Content-Type: application/json; charset=UTF-8');

// CORS (allow same-origin by default)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  exit;
}
header('Access-Control-Allow-Origin: *');

function res($ok, $msg) {
  echo json_encode(['ok' => $ok, 'message' => $msg], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  res(false, 'Invalid method');
}

mb_internal_encoding('UTF-8');
mb_language('Japanese');

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$topic   = trim($_POST['topic'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
  res(false, '必須項目が不足しています');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  res(false, 'メールアドレスの形式が正しくありません');
}

// --- Settings ---
$to = 'info@centurybay.jp';  // ここを必要に応じて変更
$subject = "【サイト問い合わせ】{$name}";
$body = "お名前: {$name}\n"
      . "Email: {$email}\n"
      . "電話: {$phone}\n"
      . "区分: {$topic}\n"
      . "\n本文:\n{$message}\n";

$from = 'info@centurybay.jp'; // 送信元（Sakura推奨：設置ドメインのアドレス）
$headers = [];
$headers[] = "From: 世紀港湾株式会社 公式サイト <{$from}>";
$headers[] = "Reply-To: {$name} <{$email}>";
$headers[] = "Content-Type: text/plain; charset=UTF-8";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers_str = implode("\r\n", $headers);

// Send
$ok = mb_send_mail($to, $subject, $body, $headers_str);

if ($ok) {
  res(true, '送信しました');
} else {
  res(false, '送信に失敗しました');
}
?>
