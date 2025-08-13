
document.addEventListener('DOMContentLoaded', () => {
  if (window.OverrideContact) return;
  const form = document.querySelector('form[data-contact]');
  if (!form) return;

  async function exists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch (e) { return false; }
  }

  async function postPHP() {
    const data = new FormData(form);
    const res = await fetch('sendmail.php', { method: 'POST', body: data });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const js = await res.json();
    if (!js.ok) throw new Error(js.message || 'failed');
    return js;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = document.body.dataset.lang === 'jp' ? '送信中…' : 'Sending…';

    try {
      if (await exists('sendmail.php')) {
        await postPHP();
        alert(document.body.dataset.lang === 'jp' ? '送信ありがとうございました。' : 'Thanks, your message was sent.');
        form.reset();
      } else {
        // Fallback to previous EmailJS/mailto flow
        if (window.EmailJSFallback) {
          await window.EmailJSFallback(form);
        } else {
          alert(document.body.dataset.lang === 'jp' ? 'メール送信機能が未設定です。' : 'Mail function not configured.');
        }
      }
    } catch (err) {
      console.error(err);
      alert(document.body.dataset.lang === 'jp' ? '送信に失敗しました。再度お試しください。' : 'Failed to send. Please try again.');
    } finally {
      btn.disabled = false; btn.textContent = orig;
    }
  });
});
