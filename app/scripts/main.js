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
  var clientId = 44553; // あなたの Client ID を書いてください

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

  // アクセストークンがまだないときはログインボタンを持っているダイアログを表示します
  if (!params['access_token']) { // eslint-disable-line dot-notation
    $(document).ready(function () {
      $('#login-modal').modal('show');
    });
  }

  // アクセストークンが URL に含まれていてあまりよくないので
  // URL からアクセストークンなどを消す
  window.history.replaceState(null, null, window.location.origin + window.location.pathname);
})();
