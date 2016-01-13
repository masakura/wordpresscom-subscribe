(function () {
  'use strict';

  // 開発環境と本番環境で WordPress.com アプリの Client ID を分ける
  // https://developer.wordpress.com/apps/
  //
  // 開発環境は http://localhost:9000/
  // 本番環境は http://masakura.github.io/wordpresscom-subscribe
  //
  // アプリには Redirect URL に一つしか設定できないので
  // 開発用と本番用でアプリを別々に登録し、Client ID を分けている
  var clientId;
  if (window.location.hostname === 'localhost') {
    // 開発環境用
    clientId = 44553;
  } else {
    // 本番環境用
    clientId = 44085;
  }

  // アクセストークンを取得
  // OAuth2 で認証とアクセス許可の取得が終わったら、戻ってくる
  // その際、http://localhost:9000/#access_token=...&token_type=bear...
  // のように URL にアクセストークンが埋め込まれている
  // この URL の # 以降の部分を分解して、以下のような形に変換している
  // {
  //   '#access_token': '...',
  //   'token_type': 'bear',
  //   ...
  // }
  var params = {};
  // # 以降を & で分割
  window.location.hash.split('&')
    .forEach(function (p) {
      // p に #access_token=... などが入っている

      // #access_token と ... に分割する
      var pair = p.split('=', 2);

      // 値の部分 ... を URI デコードする
      // %40 -> @ のように変換する
      params[pair[0]] = decodeURIComponent(pair[1]);
    });

  // アクセストークンが取得できていない場合は
  // WordPress.com から認証とアクセス許可をもらっていないので
  // WordPress.com の OAuth2 サイトにリダイレクトし、認証とアクセス許可を求める
  if (!params['#access_token']) {
    // 現在の URL をリダイレクト先に設定する
    // http://localhost:9000 とか
    var redirect = window.location.origin + window.location.pathname;
    var location = 'https://public-api.wordpress.com/oauth2/authorize?client_id=' + clientId + '&redirect_uri=' + redirect + '&response_type=token';
    window.location = location;

    // これ以上はすることがないので終了する
    return;
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

    // 投稿一つを表示するテンプレートを作成
    var template = _.template($('#post-template').html());

    // WordPress.com API を呼び出して投稿一覧を取得する
    $.ajax({
      url: 'https://public-api.wordpress.com/rest/v1/sites/' + site + '/posts/',
      type: 'GET',
      beforeSend: function (xhr) {
        // 呼び出しの際、認証情報を付与する
        xhr.setRequestHeader('Authorization', 'BEARER ' + params['#access_token']);
      }
    })
      .then(function (data) {
        // data にデータが入ってきます

        // data.posts に投稿一覧が入っています
        var posts = data.posts;

        // 投稿データをひとつずつ、リストに変換していきます
        var $posts = posts.map(function (post) {
          // 投稿一つのタイトルを li 要素にします

          // 表示に適した形式に変換する
          var item = {
            title: post.title,
            date: post.date,
            url: post.URL
          };
          // 画像は 200px 幅を表示
          // 画像がない場合は代わりの画像を表示
          if (post.featured_image) {
            item.thumbnail = post.featured_image + '?=200';
          } else {
            item.thumbnail = 'http://placehold.it/200x150/27709b/ffffff';
          }

          return $(template(item));
        });

        // <ul id="#posts"> を空にして、投稿データを追加しなおします
        $('#posts').empty().append($posts);
      })
      .fail(function (error) {
        // エラーの場合
        console.log(error);
      });
  });
})();
