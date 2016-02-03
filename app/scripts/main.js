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

    // 投稿フォームが投稿されたら...
  $(document).on('submit', '#subscribe', function (e) {
    // 標準のフォームの投稿機能をキャンセルする
    // これを行わないと、サーバーに再度アクセスしてしまう
    e.preventDefault();

    // 入力されたサイトを取得する
    var site = $('#site_id').val();

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

        // 呼び出しの結果から、投稿の一覧を取得します
        var posts = data.posts;
        console.log(posts);

        // 投稿データをひとつずつ、リストに変換していきます
        var $posts = posts.map(function (post) {
          console.log(post);

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

          // テンプレートを取得して、html に変換します
          var template = _.template($('#post-template').html());
          var $html = $(template(item));
          console.log($html);

          // html を返します
          return $html;
        });
        console.log($posts);
      })
      .fail(function (error) {
        console.log(error);
      });
  });
})();
