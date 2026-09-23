import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

const manifestPath = path.join(workspaceRoot, 'docs', 'whats-new', 'manifest.json');
const outputHtmlPath = path.join(workspaceRoot, 'docs', 'whats-new', 'index.html');
const outputMarkdownPath = path.join(workspaceRoot, 'docs', 'whats-new', 'README.md');

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const title = String(manifest.title || "StitchLab What's New");
  const intro = String(manifest.intro || '');
  const items = Array.isArray(manifest.items) ? manifest.items : [];

  const now = new Date().toISOString();
  const cardHtml = [];
  const markdownLines = [];

  markdownLines.push(`# ${title}`);
  markdownLines.push('');
  if (intro) {
    markdownLines.push(intro);
    markdownLines.push('');
  }
  markdownLines.push(`Generated: ${now}`);
  markdownLines.push('');

  for (const item of items) {
    const id = String(item.id || '').trim();
    const featureTitle = String(item.title || id || 'Feature');
    const note = String(item.note || '');
    const gifRelPath = String(item.gif || '').trim();
    const gifAbsPath = path.join(workspaceRoot, 'docs', 'whats-new', gifRelPath);
    const gifExists = gifRelPath ? await fileExists(gifAbsPath) : false;
    const safeId = escapeHtml(id || featureTitle.toLowerCase().replace(/\s+/g, '-'));
    const safeTitle = escapeHtml(featureTitle);
    const safeNote = escapeHtml(note);
    const safeGifSrc = escapeHtml(gifRelPath || '');

    cardHtml.push(`
      <article class="feature-card" id="${safeId}">
        <h2>${safeTitle}</h2>
        ${gifExists
          ? `<img src="${safeGifSrc}" alt="${safeTitle} demonstration GIF" loading="lazy">`
          : '<p class="missing">GIF missing. Run npm run whats-new:generate.</p>'}
        <p>${safeNote}</p>
      </article>
    `);

    markdownLines.push(`## ${featureTitle}`);
    markdownLines.push('');
    if (gifExists) {
      markdownLines.push(`![${featureTitle}](${gifRelPath})`);
    } else {
      markdownLines.push('_GIF missing. Run `npm run whats-new:generate`._');
    }
    markdownLines.push('');
    markdownLines.push(note);
    markdownLines.push('');
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #f4efe6;
      --ink: #1e2a32;
      --muted: #6d757d;
      --card: #fffdf7;
      --accent: #0f766e;
      --border: #d9cfbe;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
      background: radial-gradient(circle at 10% 0%, #fff8ee 0%, var(--bg) 45%, #ede4d6 100%);
    }
    header {
      padding: 2rem 1rem 1.25rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 0.5rem;
      letter-spacing: 0.02em;
    }
    .stamp {
      color: var(--muted);
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }
    .intro {
      margin: 0;
      color: var(--muted);
      max-width: 70ch;
    }
    .grid {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0.5rem 1rem 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    .feature-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 10px 24px rgba(30, 42, 50, 0.08);
      padding: 0.9rem;
      display: grid;
      gap: 0.7rem;
      align-content: start;
    }
    .feature-card h2 {
      margin: 0;
      font-size: 1.04rem;
      line-height: 1.3;
      color: var(--accent);
    }
    .feature-card img {
      width: 100%;
      height: auto;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: #f8f5ee;
      display: block;
    }
    .feature-card p {
      margin: 0;
      line-height: 1.45;
    }
    .missing {
      color: #8a2d2d;
      font-weight: 600;
      background: #fff1f1;
      border: 1px solid #f0c8c8;
      border-radius: 8px;
      padding: 0.6rem 0.7rem;
    }
    @media (max-width: 640px) {
      header { padding-top: 1.25rem; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p class="intro">${escapeHtml(intro)}</p>
    <p class="stamp">Generated: ${escapeHtml(now)}</p>
  </header>
  <main class="grid">
    ${cardHtml.join('\n')}
  </main>
</body>
</html>
`;

  await fs.writeFile(outputHtmlPath, html, 'utf8');
  await fs.writeFile(outputMarkdownPath, `${markdownLines.join('\n')}\n`, 'utf8');

  console.log(`[whats-new:build] Wrote ${path.relative(workspaceRoot, outputHtmlPath)}`);
  console.log(`[whats-new:build] Wrote ${path.relative(workspaceRoot, outputMarkdownPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
