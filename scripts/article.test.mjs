import assert from "node:assert/strict";
import { parseFrontMatter, renderMarkdown } from "./article.js";

const source = `---
title: テスト記事
description: 説明文
date: 2026-06-28
category: Web
---

## 結論

これは **太字** と [リンク](https://example.com/) を含む段落です。

- ひとつめ
- ふたつめ

<figure>
  <figcaption>生HTMLも残す</figcaption>
</figure>
`;

const parsed = parseFrontMatter(source);

assert.equal(parsed.meta.title, "テスト記事");
assert.equal(parsed.meta.description, "説明文");
assert.equal(parsed.meta.date, "2026-06-28");
assert.equal(parsed.meta.category, "Web");
assert.match(parsed.body, /## 結論/);

const html = renderMarkdown(parsed.body);

assert.match(html, /<h2>結論<\/h2>/);
assert.match(html, /<strong>太字<\/strong>/);
assert.match(html, /<a href="https:\/\/example\.com\/">リンク<\/a>/);
assert.match(html, /<ul>\s*<li>ひとつめ<\/li>\s*<li>ふたつめ<\/li>\s*<\/ul>/);
assert.match(html, /<figure>/);

console.log("article renderer tests passed");
