---
title: "バックエンドで今流行りの構成は？"
description: "2026年6月時点で流行りのバックエンド構成を、API、アプリ、データベース、キャッシュ、Docker、クラウド、監視に分けて小学生にもわかるように整理する。"
date: 2026-06-16
category: Web
infographic: ../../images/web/backend-popular-stack/infographic.png
infographic_alt: "バックエンドの流行りの構成はAPI、アプリ、PostgreSQL、Redis、Docker、AWSやKubernetes、OpenTelemetryを組み合わせるという要点"
infographic_caption: "バックエンドは、入口、係、倉庫、近道、箱、雲の土地、見守り係を組み合わせて作る。"
---
## 結論

今の流行りをひとことで言うと、**API + アプリ本体 + PostgreSQL + Redis + Docker + クラウド + 見守り**です。小さく始めるなら、まずは**API、PostgreSQL、Docker**の3つを覚えると全体が見えやすいです。

言語やフレームワークは、チームや目的で変わります。よく見る組み合わせは、**TypeScript/Node.js + ExpressやNestJS**、**Python + FastAPIやDjango**、**Java + Spring Boot**、**Go**です。

## お店でたとえる

バックエンドは、画面にはあまり見えないけれど、アプリを動かす裏側の仕事をしています。お店で考えるとわかりやすいです。

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>役割</th>
              <th>たとえ</th>
              <th>よく使われるもの</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>API</td>
              <td>お客さんの注文を受ける入口</td>
              <td>REST API、GraphQL、gRPC</td>
            </tr>
            <tr>
              <td>アプリ本体</td>
              <td>注文を見て仕事をする係</td>
              <td>Node.js、Python、Java、Go</td>
            </tr>
            <tr>
              <td>データベース</td>
              <td>大事な情報をしまう倉庫</td>
              <td>PostgreSQL、MySQL、MongoDB</td>
            </tr>
            <tr>
              <td>キャッシュ</td>
              <td>よく使うものを近くに置く近道</td>
              <td>Redis</td>
            </tr>
            <tr>
              <td>コンテナ</td>
              <td>アプリをどこでも動く箱に入れる</td>
              <td>Docker</td>
            </tr>
            <tr>
              <td>動かす場所</td>
              <td>お店を置く大きな土地</td>
              <td>AWS、Google Cloud、Azure、Kubernetes</td>
            </tr>
            <tr>
              <td>監視</td>
              <td>お店の様子を見て問題に気づく係</td>
              <td>OpenTelemetry、Prometheus、Grafana</td>
            </tr>
          </tbody>
        </table>
      </div>

## 流行りの基本形

1. **画面やアプリがAPIに注文する。** 「このユーザーの情報を見せて」「商品を買いたい」のようなお願いを送ります。
2. **バックエンドのアプリが考える。** ルールを確認し、ログインしているか、買ってよいか、どのデータが必要かを決めます。
3. **PostgreSQLに大事な情報を保存する。** ユーザー、注文、支払い、設定など、消えてはいけない情報をしまいます。
4. **Redisによく使う情報を置く。** 毎回倉庫まで取りに行くと遅いものを、近くに置いてすばやく返します。
5. **Dockerで箱に入れて運ぶ。** 自分のパソコン、テスト環境、本番環境で動き方が変わりにくくなります。
6. **クラウドやKubernetesで動かす。** 人が増えたら台数を増やし、壊れたら別の場所で動かすようにします。
7. **OpenTelemetryなどで見守る。** 遅いところ、失敗したところ、どのお願いで問題が起きたかを見つけやすくします。

## 数字で見る人気

Stack Overflow Developer Survey 2025では、言語としてJavaScript、SQL、Python、TypeScript、Java、Goが目立ちます。バックエンド技術ではNode.js、Express、FastAPI、Spring Boot、Flask、Djangoが調査項目に並び、データベースではPostgreSQLとRedis、ツールではDockerとKubernetesが大きな選択肢として出ています。

CNCFの2025年Annual Cloud Native Surveyでは、コンテナ利用者の82%がKubernetesを本番環境で使っていると発表されています。つまり、大きいサービスでは「Dockerの箱をKubernetesでたくさん並べて動かす」考え方がかなり普通になっています。

OpenTelemetryは、トレース、メトリクス、ログを集めるためのベンダー中立な仕組みとして公式ドキュメントで説明されています。これは「どこの見守りサービスを使っても、アプリ側の見守り方をそろえやすい」という意味です。

## よくある構成

      <div class="skill-grid">
        <div class="skill-card">

### 小さく始める

- TypeScript + Node.js
- REST API
- PostgreSQL
- Docker Compose

        </div>
        <div class="skill-card">

### AIやデータにも強くする

- Python + FastAPI
- PostgreSQL
- Redis
- ジョブキュー

        </div>
        <div class="skill-card">

### 会社の大きなサービス

- Java + Spring Boot
- PostgreSQL
- Docker
- Kubernetes + OpenTelemetry

        </div>
      </div>

推測としての現場感では、新しく学ぶ人はTypeScript/Node.jsかPython/FastAPIから始めると入りやすいです。一方で、大きな会社や長く運用する業務システムではJava/Spring BootやGoも強い候補です。

もう1つの選び方として、短い処理だけを動かすならサーバーレスもあります。AWS Lambdaのようなサービスは、サーバーを自分で用意せずにコードを動かせるので、画像の加工、通知、定期実行のような小さな仕事に向いています。

## 最初に作るなら

迷ったら、次の順番で作るのがわかりやすいです。

1. **APIを1つ作る。** 例: 「こんにちは」を返すAPI。
2. **PostgreSQLにつなぐ。** 例: 名前を保存して、あとで取り出す。
3. **Dockerで動かす。** 例: アプリとDBを同じ手順で起動する。
4. **ログを見る。** 例: どのAPIが呼ばれたか、エラーが出たかを見る。
5. **必要になってからRedisやKubernetesを足す。** 最初から全部入れると、勉強するものが多すぎます。

大事なのは、流行りの名前を全部覚えることではありません。**入口、仕事をする係、倉庫、箱、動かす場所、見守り**という役割を理解することです。役割がわかれば、新しい名前が出てきても「これはどの係かな？」と考えられます。

## 参照

- [Stack Overflow Developer Survey 2025: Technology](https://survey.stackoverflow.co/2025/technology)
- [CNCF: Kubernetes Established as the De Facto Operating System for AI as Production Use Hits 82% in 2025 CNCF Annual Cloud Native Survey](https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system-for-ai-as-production-use-hits-82-in-2025-cncf-annual-cloud-native-survey/)
- [Docker Docs: Docker overview](https://docs.docker.com/get-started/docker-overview/)
- [PostgreSQL official site](https://www.postgresql.org/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
