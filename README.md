# Notes

Codex と一緒に疑問、学び、自分の考えをHTML記事へ変換して蓄積する、ビルド不要の静的ノート集です。

## 構成

```text
notes/
├── .github/workflows/static.yml
├── styles/site.css
├── images/
├── templates/article.html
├── AGENTS.md
├── README.md
└── index.html
```

## 運用

Codex に `質問: ...` と依頼すると、`AGENTS.md` のルールに沿って記事HTMLを作り、トップページの索引を更新します。
技術に限らず、読書、仕事、暮らし、アイデアなどのカテゴリを追加できます。

GitHub Pages を使う場合は、リポジトリの Pages 設定で GitHub Actions からデプロイする設定にしてください。
