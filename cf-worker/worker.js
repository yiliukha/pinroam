// PinRoam Downloads Worker
// Serves a download page with links to the latest installers

const DOWNLOADS = {
  windows: {
    label: 'Windows',
    icon: '🪟',
    file: 'PinRoam-Setup-1.0.0.exe',
    note: 'Windows 10+, x64',
  },
  linux: {
    label: 'Linux',
    icon: '🐧',
    file: 'PinRoam-1.0.0.AppImage',
    note: 'AppImage, x64',
  },
  android: {
    label: 'Android',
    icon: '🤖',
    file: 'PinRoam-1.0.0.apk',
    note: 'Android 7+',
  },
};

const R2_BASE = 'https://pub-pinroam.r2.dev'; // update after R2 bucket creation

function html(env) {
  const cards = Object.entries(DOWNLOADS).map(([key, d]) => `
    <a class="card" href="${R2_BASE}/${d.file}" download>
      <span class="icon">${d.icon}</span>
      <span class="label">${d.label}</span>
      <span class="note">${d.note}</span>
      <span class="dl">↓ Download</span>
    </a>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PinRoam — Download</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#071628;color:#e2e8f0;font-family:system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:32px}
  h1{font-size:2rem;letter-spacing:0.04em;color:#60a5fa}
  h1 span{color:#e2e8f0;font-weight:300}
  .sub{color:#64748b;font-size:0.9rem;letter-spacing:0.05em}
  .cards{display:flex;gap:20px;flex-wrap:wrap;justify-content:center}
  .card{display:flex;flex-direction:column;align-items:center;gap:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px 36px;text-decoration:none;color:#e2e8f0;transition:all .2s;cursor:pointer;min-width:160px}
  .card:hover{background:rgba(96,165,250,0.1);border-color:rgba(96,165,250,0.3);transform:translateY(-2px)}
  .icon{font-size:2.4rem}
  .label{font-size:1.1rem;font-weight:600}
  .note{font-size:0.75rem;color:#64748b}
  .dl{margin-top:6px;font-size:0.8rem;color:#60a5fa;letter-spacing:0.08em}
  .pwa{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 24px;font-size:0.9rem;color:#94a3b8}
  .pwa a{color:#60a5fa;text-decoration:none}
  .pwa a:hover{text-decoration:underline}
  footer{color:#334155;font-size:0.75rem}
</style>
</head>
<body>
  <div>
    <h1>Pin<span>Roam</span></h1>
    <p class="sub">EXPLORE · GUESS · DISCOVER</p>
  </div>
  <div class="cards">${cards}</div>
  <div class="pwa">
    🌐&nbsp; Play instantly in browser:&nbsp;
    <a href="https://pinroam.pages.dev" target="_blank">pinroam.pages.dev</a>
  </div>
  <footer>© 2025 PinRoam</footer>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Redirect /download/* to R2
    if (url.pathname.startsWith('/download/')) {
      const file = url.pathname.replace('/download/', '');
      return Response.redirect(`${R2_BASE}/${file}`, 302);
    }

    return new Response(html(env), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};
