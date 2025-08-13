
(async function () {
  const cfgUrl = './email.config.json';

  async function loadConfig() {
    try {
      const resp = await fetch(cfgUrl, { cache: 'no-store' });
      if (!resp.ok) throw new Error('config not found');
      return await resp.json();
    } catch (e) {
      return { useEmailJS: false };
    }
  }

  function serializeForm(form) {
    const data = new FormData(form);
    const obj = {};
    for (const [k, v] of data.entries()) obj[k] = v;
    return obj;
  }

  function mailtoFallback(form, to) {
    const data = serializeForm(form);
    const subject = encodeURIComponent(`【サイト問い合わせ】${data.name || ''}`.trim());
    const body = encodeURIComponent(
      `お名前: ${data.name || ''}\nEmail: ${data.email || ''}\n電話: ${data.phone || ''}\n区分: ${data.topic || ''}\n\n本文:\n${data.message || ''}`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  async function sendEmailJS(cfg, payload) {
    const endpoint = 'https://api.emailjs.com/api/v1.0/email/send';
    const body = {
      service_id: cfg.service_id,
      template_id: cfg.template_id,
      user_id: cfg.public_key,
      template_params: {
        to_email: cfg.to_email,
        from_name: payload.name,
        from_email: payload.email,
        phone: payload.phone || '',
        topic: payload.topic || '',
        message: payload.message
      }
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const txt = await res.text().catch(()=>'');
      throw new Error(`EmailJS error: ${res.status} ${txt}`);
    }
    return true;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const cfg = await loadConfig();
    const form = document.querySelector('form[data-contact]');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = document.body.dataset.lang === 'jp' ? '送信中…' : 'Sending…';

      const payload = {
        name: form.querySelector('[name="name"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        topic: form.querySelector('[name="topic"]').value,
        message: form.querySelector('[name="message"]').value.trim()
      };

      try {
        if (cfg.useEmailJS && cfg.service_id && cfg.template_id && cfg.public_key) {
          await sendEmailJS(cfg, payload);
          alert(document.body.dataset.lang === 'jp' ? '送信ありがとうございました。' : 'Thanks, your message was sent.');
          form.reset();
        } else {
          mailtoFallback(form, cfg.to_email || 'info@centurybay.jp');
        }
      } catch (err) {
        console.error(err);
        alert(document.body.dataset.lang === 'jp' ? '送信に失敗しました。再度お試しください。' : 'Failed to send. Please try again.');
      } finally {
        btn.disabled = false; btn.textContent = orig;
      }
    });
  });
})();
