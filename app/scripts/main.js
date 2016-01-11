(function () {
  'use strict';

  var clientId;
  if (window.location.hostname === 'localhost') {
    clientId = 44553;
  } else {
    clientId = 44553;
  }

  // アクセストークンを取得
  // params = {'#access_token': '...', ...}
  var params = {};
  window.location.hash.split('&')
    .forEach(function (p) {
      var pair = p.split('=', 2);
      params[pair[0]] = decodeURIComponent(pair[1]);
    });

  // アクセストークンが取得できていない場合は認証ページにリダイレクト
  if (!params['#access_token']) {
    var redirect = window.location.origin + window.location.pathname;
    window.location = 'https://public-api.wordpress.com/oauth2/authorize?client_id=' + clientId + '&redirect_uri=' + redirect + '&response_type=token';
    return;
  }

  $(document).on('submit', '#subscribe', function () {
    var site = $('#site_id').val();

    $.ajax({
      url: 'https://public-api.wordpress.com/rest/v1/sites/' + site + '/posts/',
      type: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'BEARER ' + params['#access_token']);
      }
    })
      .then(function (data) {
        var posts = data.posts;
        var $posts = posts.map(function (post) {
          return $('<li class="list-group-item">')
            .text(post.title);
        });
        $('#posts').empty().append($posts);
      });
  });
})();
