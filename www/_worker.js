// Cloudflare Pages Worker — handles /download, passes everything else to static assets
const GITHUB_OWNER = 'yiliukha'
const GITHUB_REPO  = 'pinroam'
const APP_NAME     = 'PinRoam'

function detectOS(ua) {
  if (/Android/i.test(ua))              return 'android'
  if (/Windows NT/i.test(ua))           return 'windows'
  if (/Macintosh|Mac OS X/i.test(ua))   return 'mac'
  return 'linux'
}

function findAsset(assets, os) {
  if (os === 'android') return assets.find(a => a.name.endsWith('.apk'))
  if (os === 'windows') return assets.find(a => a.name.endsWith('.exe') && !a.name.endsWith('.blockmap'))
  if (os === 'mac')     return assets.find(a => a.name.endsWith('.dmg') && !a.name.endsWith('.blockmap'))
  return assets.find(a => a.name.endsWith('.AppImage'))
}

function mimeType(name) {
  if (name.endsWith('.apk'))      return 'application/vnd.android.package-archive'
  if (name.endsWith('.exe'))      return 'application/x-msdownload'
  if (name.endsWith('.dmg'))      return 'application/x-apple-diskimage'
  if (name.endsWith('.AppImage')) return 'application/x-executable'
  return 'application/octet-stream'
}

function comingSoonHTML(os, pagesUrl) {
  const labels = { android: 'Android APK', windows: 'Windows', mac: 'macOS', linux: 'Linux' }
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PinRoam — Download</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0c0c18;color:#e2e8f0;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:32px 24px;text-align:center;}
.icon{font-size:72px;margin-bottom:20px;}
h1{font-size:1.8rem;font-weight:800;margin-bottom:8px;color:#fff;}
p{color:rgba(255,255,255,.45);font-size:.95rem;line-height:1.6;max-width:300px;margin-bottom:28px;}
a{display:inline-block;padding:13px 28px;border-radius:12px;background:#7950e5;color:#fff;text-decoration:none;font-weight:700;font-size:.95rem;}
a:hover{background:#9b74f5;}
</style>
</head>
<body>
<div class="icon">🌍</div>
<h1>${labels[os] || os} — Coming Soon</h1>
<p>The native ${labels[os] || os} build is in progress. Play now in your browser!</p>
<a href="${pagesUrl}">Play PinRoam →</a>
</body>
</html>`
}

async function handleDownload(request, env) {
  const pagesUrl = env.PAGES_URL || 'https://pinroam.pages.dev'
  const ua = request.headers.get('User-Agent') || ''
  const os = detectOS(ua)

  let release = null
  try {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'CF-Worker/1.0' }
    if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`
    const ghRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      { headers }
    )
    if (ghRes.ok) release = await ghRes.json()
  } catch (_) {}

  if (!release) {
    return new Response(comingSoonHTML(os, pagesUrl), {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
  }

  const asset = findAsset(release.assets || [], os)
  if (!asset) {
    return new Response(comingSoonHTML(os, pagesUrl), {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
  }

  const fileRes = await fetch(asset.browser_download_url)
  if (!fileRes.ok) return new Response('Download unavailable', { status: 502 })

  return new Response(fileRes.body, {
    headers: {
      'Content-Type': mimeType(asset.name),
      'Content-Disposition': `attachment; filename="${asset.name}"`,
      'Content-Length': asset.size.toString(),
      'Cache-Control': 'no-cache',
    }
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/download' || url.pathname === '/download/') {
      return handleDownload(request, env)
    }
    // All other requests → serve static PWA assets
    return env.ASSETS.fetch(request)
  }
}
