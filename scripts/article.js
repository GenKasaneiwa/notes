const htmlEscapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => htmlEscapeMap[char]);
}

function renderInline(value) {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return html;
}

export function parseFrontMatter(source) {
  const normalized = source.replace(/\r\n?/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { meta: {}, body: normalized.trim() };
  }

  const end = normalized.indexOf("\n---", 4);
  if (end === -1) {
    return { meta: {}, body: normalized.trim() };
  }

  const rawMeta = normalized.slice(4, end).trim();
  const body = normalized.slice(end + 4).trim();
  const meta = {};

  for (const line of rawMeta.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      meta[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }

  return { meta, body };
}

export function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listItems = [];
  let orderedListItems = [];
  let codeLines = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length > 0) {
      html.push(`<ul>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      listItems = [];
    }
    if (orderedListItems.length > 0) {
      html.push(`<ol>${orderedListItems.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      orderedListItems = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (codeLines) {
      if (trimmed.startsWith("```")) {
        html.push(`<pre tabindex="0"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      codeLines = [];
      continue;
    }

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("<")) {
      flushParagraph();
      flushList();
      html.push(line);
      continue;
    }

    const heading = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const list = trimmed.match(/^[-*]\s+(.+)$/);
    if (list) {
      flushParagraph();
      orderedListItems = [];
      listItems.push(list[1]);
      continue;
    }

    const orderedList = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedList) {
      flushParagraph();
      listItems = [];
      orderedListItems.push(orderedList[1]);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  if (codeLines) {
    html.push(`<pre tabindex="0"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

export async function renderArticlePage() {
  const root = document.querySelector("[data-article-root]");
  if (!root) return;

  const markdownPath = root.getAttribute("data-markdown") || "article.md";
  const response = await fetch(markdownPath);
  if (!response.ok) {
    root.innerHTML = "<p>記事を読み込めませんでした。</p>";
    return;
  }

  const { meta, body } = parseFrontMatter(await response.text());
  document.title = meta.title || document.title;
  setText("[data-article-date]", meta.date);
  const dateElement = document.querySelector("[data-article-date]");
  if (dateElement && meta.date) dateElement.setAttribute("datetime", meta.date);
  setText("[data-article-category]", meta.category);
  setText("[data-article-title]", meta.title);
  setText("[data-article-description]", meta.description);

  const infographic = document.querySelector("[data-article-infographic]");
  const infographicImage = document.querySelector("[data-article-infographic-img]");
  if (infographic && infographicImage && meta.infographic) {
    infographicImage.setAttribute("src", meta.infographic);
    infographicImage.setAttribute("alt", meta.infographic_alt || "");
    setText("[data-article-infographic-caption]", meta.infographic_caption);
    infographic.hidden = false;
  }

  root.innerHTML = renderMarkdown(body);
}

if (typeof document !== "undefined") {
  renderArticlePage();
}
