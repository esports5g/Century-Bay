
(function(){
  async function loadConfig(){
    try{
      const r = await fetch('./gas.config.json', {cache:'no-store'});
      if(!r.ok) throw new Error('no cfg');
      return await r.json();
    }catch(e){ return null; }
  }

  function pickLang(){ return document.body.dataset.lang === 'en' ? 'en' : 'jp'; }

  function payloadFrom(form){
    return {
      name: form.querySelector('[name="name"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      topic: form.querySelector('[name="topic"]').value,
      message: form.querySelector('[name="message"]').value.trim(),
      ua: navigator.userAgent,
      url: location.href,
      ts: new Date().toISOString()
    };
  }

  async function sendToGAS(cfg, data){
    // Send as text/plain to avoid preflight; GAS doPost can JSON.parse(e.postData.contents)
    const res = await fetch(cfg.webapp_url, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(data)
    });
    // We can't always read JSON due to no-cors; just assume ok on 200
    if(!res.ok) throw new Error('HTTP '+res.status);
    return true;
  }

  window.OverrideContact = true; // tell contact.js not to bind

  document.addEventListener('DOMContentLoaded', async () => {
    const cfg = await loadConfig();
    const form = document.querySelector('form[data-contact]');
    if(!form) return;

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const lang = pickLang();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = lang==='jp' ? '送信中…' : 'Sending…';
      try{
        if(!cfg || !cfg.webapp_url || cfg.webapp_url.indexOf('PASTE_YOUR_DEPLOYED_EXEC_URL_HERE')>-1){
          alert(lang==='jp' ? 'まだメール連携が未設定です（gas.config.json に Web App URL を設定してください）。' : 'Mail bridge not configured. Set Web App URL in gas.config.json.');
        }else{
          const data = payloadFrom(form);
          await sendToGAS(cfg, data);
          alert(lang==='jp' ? '送信ありがとうございました。' : 'Thanks, your message was sent.');
          form.reset();
        }
      }catch(err){
        console.error(err);
        alert(lang==='jp' ? '送信に失敗しました。しばらくしてからお試しください。' : 'Failed to send. Please try again.');
      }finally{
        btn.disabled = false; btn.textContent = orig;
      }
    });
  });
})();
