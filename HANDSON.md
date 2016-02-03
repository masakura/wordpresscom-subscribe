# ハンズオン (案)
* 本番は Plunker を使います


## 事前にやること
[https://developer.wordpress.com/docs/api/console/](WordPress.com Developer Console) で、REST API の呼び出しの練習


## 手順
### 前準備
画面だけの処理がないアプリを実行するところまで

```
$ git clone https://github.com/masakura/wordpresscom-subscribe.git
$ cd wordpresscom-subscribe
$ git checkout a419046ff71825d1f42e45d63166c880f08a2a59
$ npm install
$ bower install
$ gulp serve
```

* Bootstrap が組み込み済みです
* 画面 (HTML や CSS) は最初で用意されています
* 基本的に、WordPress.com にアプリの登録をして JavaScript を書くだけです
* 今回書く対象は `app/scripts/main.js` です

`app/scripts/main.js` はこんな感じになってます

```javascript
(function () {
  'use strict';

})();
```


### WordPress.com でアプリを登録する
1. https://developer.wordpress.com/apps/new/ にアクセス
2. Name/Description は適当に入力
3. Website URL/Redirect URL/Javascript Origins にはアプリの URL を追加する
  - `http://localhost:9000`
4. Whats is ...? に答えを入れる
5. Type は `Web` を選択
6. `Create` ボタンをクリック
7. `Client ID` などが表示される


### 認証し、アクセストークンをもらうところまで
WordPress.com の機能を呼び出すまでの流れはこんな感じ。

1. アプリサイトにアクセスする
2. WordPress.com の OAuth2 サイトにリダイレクトする
3. WordPress.com のサイトでログインをする
4. WordPress.com のサイトで API を利用する認可をもらう
5. アプリサイトに転送される
- この時、アクセストークンが URL に追加される

手順はこんな感じ。

1. JavaScript をコピペします
2. 13 行目の `ここにかいてください` を消して、Client ID を書きます
  - `var client Id = 000000;` のような感じ
3. 勝手に動き始めて WordPress.com へ飛ばされます
  - ログインし、`Approve` ボタンをクリックしてください
4. 戻ってくるので、URL にアクセストークンが含まれていることを確認します

https://github.com/masakura/wordpresscom-subscribe/commit/aa09d757fa902019812385cf5dcc03bdb245b124

```javascript
(function () {
  'use strict';

  // WordPress.com からアプリのキーを取得し、ここに書いてください
  // 1. https://developer.wordpress.com/apps/new/ にアクセス
  // 2. Name/Description は適当に入力
  // 3. Website URL/Redirect URL/Javascript Origins にはアプリの URL を追加する
  //   - Plunker のアプリの URL
  // 4. Whats is ...? に答えを入れる
  // 5. Type は `Web` を選択
  // 6. `Create` ボタンをクリック
  // 7. `Client ID` などが表示される
  var clientId = ここに書いてください; // あなたの Client ID を書いてください

  // アクセストークンなどを格納しておくための変数
  var params = {};

  // ダイアログのログインボタンがクリックされたら WordPress.com でログインさせる
  // 1. `WordPress.com でログインする` をクリックする
  // 2. WordPress.com のサイトが表示されるので、ログインし、`Approve` ボタンをクリックする
  // 3. ページに戻ってくるので、URL にアクセストークンがあることを確認する
  $(document).on('click', '#login', function () {
    // 現在の URL をリダイレクト先に設定する
    // http://localhost:9000 とか
    var redirect = window.location.origin + window.location.pathname;
    var location = 'https://public-api.wordpress.com/oauth2/authorize?client_id=' + clientId + '&redirect_uri=' + redirect + '&response_type=token';
    window.location = location;
  });

  // アクセストークンがまだないときはログインボタンを持っているダイアログを表示します
  if (!params['access_token']) { // eslint-disable-line dot-notation
    $(document).ready(function () {
      $('#login-modal').modal('show');
    });
  }
  })();
```


### アクセストークンを URL から取得する
URL を分解してアクセストークンを取得します。

1. 28 行目の直後に以下のコードを挿入してください
2. 開発者ツールのコンソールにアクセストークンが表示されていることを確認します

https://github.com/masakura/wordpresscom-subscribe/commit/46d26459818fb337735c0dcb64dd31201398cdc7

```javascript

  // アクセストークンを取得
  // OAuth2 で認証とアクセス許可の取得が終わったら、戻ってくる
  // その際、http://localhost:9000/#access_token=...&token_type=bear...
  // のように URL にアクセストークンが埋め込まれている
  // この URL の # 以降の部分を分解して、以下のような形に変換している
  // {
  //   'access_token': '...',
  //   'token_type': 'bear',
  //   ...
  // }
  // # 以降を & で分割
  var hash = window.location.hash;
  if (hash) {
    hash.substring(1).split('&')
      .forEach(function (p) {
        // p に access_token=... などが入っている

        // access_token と ... に分割する
        var pair = p.split('=', 2);

        // 値の部分 ... を URI デコードする
        // %40 -> @ のように変換する
        params[pair[0]] = decodeURIComponent(pair[1]);
      });
  }
  console.log(params);
```


### アクセストークンを URL から除去する
このままだとアクセストークンが表示されっぱなしになるので、消します

1. 62 行目の直後に以下のコードを追加します
2. URL を確認したら、アクセストークンが消えています

https://github.com/masakura/wordpresscom-subscribe/commit/b56510bf5d32b0bb0fe45ebbd37c8d1b61b717dc

```javascript

  window.history.replaceState(null, null, window.location.origin + window.location.pathname);
```


### 入力されたサイトを取得する
プログラムを組むときの鉄則はちょっとずつです。一気に作りたいところですが、ぐっとこらえて、テキストボックスに入力されたサイトが正しいかをまずは確認します。

1. 66 行目の直後に以下のコードを追加します
2. 再度 WordPress.com に飛ばされますので、`Approve` ボタンをクリックします
3. テキストボックスにサイト名 (自分で作った WordPress.com サイト、`masakura.wordpress.com` とか) を入れ、`購読`ボタンをクリックします。
4. コンソールにサイト名が表示されます

https://github.com/masakura/wordpresscom-subscribe/commit/ddc146571ebbaa8d2353f34560b5a4bd16d22920

```javascript

  // 投稿フォームが投稿されたら...
  $(document).on('submit', '#subscribe', function (e) {
    // 標準のフォームの投稿機能をキャンセルする
    // これを行わないと、サーバーに再度アクセスしてしまう
    e.preventDefault();

    // 入力されたサイトを取得する
    var site = $('#site_id').val();

    // サイトが取得されているかどうかをデバッグする
    console.log('site => ' + site);
  });
```


### WordPress.com 投稿を取得する
ここが一番の山場です!

WordPress.com REST API を利用して、投稿を取得します。jQuery の `$.ajax` 関数で呼び出せますが、アクセストークンを渡してやらなければいけません。

1. 78 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. 購読内容はコンソールに出力されます
  - エラーなどないか確認してください

https://github.com/masakura/wordpresscom-subscribe/commit/b320edf930852ceb771d24363b87ec1ac274fce2

```javascript

    // サイトが取得されているかどうかをデバッグする
    console.log('site => ' + site);

    // WordPress.com API を呼び出して投稿一覧を取得する
    $.ajax({
      url: 'https://public-api.wordpress.com/rest/v1/sites/' + site + '/posts/',
      type: 'GET',
      beforeSend: function (xhr) {
        // 呼び出しの際、認証情報を付与する
        xhr.setRequestHeader('Authorization', 'BEARER ' + params['access_token']); // eslint-disable-line dot-notation
      }
    })
      .then(function (data) {
        console.log(data);
      })
      .fail(function (error) {
        console.log(error);
      });
```


### 結果から投稿のみを取り出す
WordPress REST API の呼び出し結果はこんな感じになってます。

```javascript
{
  found: 39
  posts: [
    {
      ID: 1234
      url: 'http://...',
      // ...
      title: 'たいとる',
      // ...
    }, {
      // ...
    },
    // ...
  ]
}
```

これから、投稿のみを取り出します。

1. 90 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. 投稿はコンソールに出力されます

https://github.com/masakura/wordpresscom-subscribe/commit/91119fb54364bf0cfb3d099cda7eed536faee1fc

```javascript

        // 呼び出しの結果から、投稿の一覧を取得します
        var posts = data.posts;
        console.log(posts);
```

こんな感じになるはずです。

```javascript
[
  {
    ID: 1234
    url: 'http://...',
    // ...
    title: 'たいとる',
    // ...
  }, {
    // ...
  },
  // ...
]
```


### 投稿をひとつずつ処理する
投稿をひとつずつ、画面に表示できるように変換していきます。ですが、一気にやると大変なので、まずは投稿をひとつずつ表示してみましょう。

1. 94 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. 投稿がひとつずつコンソールに出力されます

https://github.com/masakura/wordpresscom-subscribe/commit/22bfa7bcae70e4789db2761d34ed066353eaace5

```javascript

        // 投稿データをひとつずつ、リストに変換していきます
        var $posts = posts.map(function (post) {
          console.log(post);
        });
```

こんなのがたくさん表示されます。


```javascript
{
  ID: 1234
  url: 'http://...',
  // ...
  title: 'たいとる',
  // ...
}
```


### 投稿を表示しやすいように加工する
投稿をそのまま表示しようとすると、面倒な問題がおきます。

* 日付が `2016/02/13T12:34:45` と表示されたり...
* 写真がない投稿にダミーの写真を入れられなかったり...

なので、一度、必要な情報だけに絞って、加工しておくと便利です。

1. 98 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. 投稿はコンソールに出力されます

https://github.com/masakura/wordpresscom-subscribe/commit/dd6853c9064af5b0523cbb5dfaffc458aa04559f

```javascript

          // 表示に適した形式に変換する
          var item = {
            title: post.title,
            date: moment(post.date).format('YYYY.MM.DD'),
            url: post.URL,
            thumbnail: post.featured_image
          };
          // 画像がない場合は代わりの画像を表示
          if (!item.thumbnail) {
            item.thumbnail = 'http://placehold.it/200x150/27709b/ffffff?text=No Photo';
          }
          console.log(item);
```

こんな感じになるはずです。

```javascript
{
  date: '2016.02.13',
  thumbnail: 'http://...'
  title: 'たいとる',
  url: 'http://...'
}
```


### 投稿一つを HTML に変換します
画面に表示するためには HTML に変換しなければなりません。変換をするときは、テンプレートエンジンを使うと良いです。今回は Underscore.js のテンプレートエンジンを使っています。

`app/index.html` 内の 64 行目当たりがテンプレートです。`<%- url %>` と書かれているところが `url` と置き換えられます。

```html
    <script id="post-template" type="text/template">
      <li class="post-group-item col-xs-12 col-sm-12 col-md-4">
        <a href="<%- url %>" target="_blank">
          <div class="postimg"><img class="img-responsive" src="<%- thumbnail %>" alt="<%- title %>"></div>
          <p class="postitle">
            <span class="postdate"><%- date %></span>
            <%- title %>
          </p>
          <div class="postbtn">続きを読む</div>
        </a>
      </li>
    </script>
```

1. 11 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. HTML はコンソールに出力されます (実際は jQuery Object)

https://github.com/masakura/wordpresscom-subscribe/commit/337b0e4c5e48a8e78f803c5f69aa9afd6644d4ac

```javascript

          // テンプレートを取得して、html に変換します
          var template = _.template($('#post-template').html());
          var $html = $(template(item));
          console.log($html);
```

#### 脆弱性について
* `<%= %>` を使うとかなり危ないです
  - 第三者が書いた JavaScript が動作してしまいます
* `<%- %>` でも今回のように `<a href="<%- url %>">` などで使うと危ないです
  - `http://` や `https://` で始まるかどうかを検証する必要があります
* 今回はハンズオンなのできちんとした対処はしてませんが、アプリをきちんと作るときは注意してください


### HTML を返すようにする
投稿を HTML に変換しましたので、それを返します。

1. 116 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. 今回はなにも変わりません

https://github.com/masakura/wordpresscom-subscribe/commit/c1660b56eb94caab109348c81c07cb3f85a7e350

```javascript

          // html を返します
          return $html;
```

### すべての投稿の HTML を取得できたか確認する
ここまでで、すべての投稿を HTML に変換できたはずなので、それを確認します。

1. 120 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. 投稿はコンソールに出力されます

https://github.com/masakura/wordpresscom-subscribe/commit/5427bba31e1ad7784851e818e5ff7e41ca8c8fbf

```javascript
        console.log($posts);
```


### すべての投稿の HTML を表示します
ここまでで、投稿を表示する準備は整いました。あとは、画面に表示できるよう、追加するだけです!

1. 121 行目の直後に以下のコードを追加します
2. WordPress.com にリダイレクトされるので、`Approve` ボタンをくりくします
3. テキストボックスにサイトを入力し、`購読`ボタンをクリックします
4. できました!

https://github.com/masakura/wordpresscom-subscribe/commit/5facf48eb2339d91f6e28ea971a7e3b68beab0f3

```javascript

        // <ul id="#posts"> を空にして、投稿データを追加しなおします
        $('#posts').empty().append($posts);
```
