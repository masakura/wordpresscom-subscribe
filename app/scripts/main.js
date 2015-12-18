(function () {
  'use strict';

  // アクセストークンが取得できていない場合は認証ページにリダイレクト
  if (!window.location.hash) {
    window.location = 'https://public-api.wordpress.com/oauth2/authorize?client_id=44085&redirect_uri=http://localhost:9000/&response_type=token';
    return;
  }

  // アクセストークンを取得
  // params = {'#access_token': '...', ...}
  var params = {};
  window.location.hash.split('&')
    .forEach(function (p) {
      var pair = p.split('=', 2);
      params[pair[0]] = decodeURIComponent(pair[1]);
    });

  /**
   * サイトの投稿一覧を取得します
   * @param site {String} サイト ID ('masakura.wordpress.com', or 1234)
   * @return {Deferred} 結果を返す
   */
  function getPosts(site) {
    return $.ajax({
    url: 'https://public-api.wordpress.com/rest/v1/sites/' + site + '/posts/',
    type: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'BEARER ' + params['#access_token']);
    }
    })
      .then(function (data) {
        return data.posts;
      });
  }

  var siteManager = {
    sites: [],
    /**
     * サイトを購読し、ポストを取得します
     */
    subscribe: function () {
      // 入力されたサイトを取得
      var siteId = $('#site_id').val();
      $('#site_id').val('');

      // 購読済みに追加
      this.sites.push(siteId);

      // 購読済みサイトとポストを更新
      this.updateSites();
      this.updatePosts();
    },
    /**
     * 購読サイト一覧を更新します
     */
    updateSites: function () {
      var $sites = this.sites
        .map(function (site) {
          return $('<li class="list-group-item">').text(site);
        });
      $('#sites').empty().append($sites);
    },
    /**
     * 購読済みサイトのポスト一覧を更新します
     */
    updatePosts: function () {
      // 購読済みサイトのポスト一覧を取得
      var deferreds = this.sites
            .map(function (site) {
              return getPosts(site);
            });

      // すべてのサイトのポスト一覧の取得が終わってから処理
      $.when.apply($, deferreds)
        .then(function () {
          // サイトごとのポストをフラットな配列に
          var args = Array.prototype.slice.apply(arguments);
          var posts = Array.prototype.concat.apply([], args);

          // 日付順にソートする
          posts.sort(function (a, b) {
            var dateA = Date.parse(a.date);
            var dateB = Date.parse(b.date);

            return dateB - dateA;
          });
          console.log(posts);

          // 表示を更新
          var $posts = posts
                .map(function (post) {
                  return $('<li class="list-group-item">').text(post.title);
                });
          $('#posts').empty().append($posts);
        });
    }
  };

  $(document).on('click', '#subscribe', siteManager.subscribe.bind(siteManager));
})();
