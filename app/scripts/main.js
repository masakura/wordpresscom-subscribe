(function () {
  'use strict';

  if (!window.location.hash) {
    window.location = 'https://public-api.wordpress.com/oauth2/authorize?client_id=44085&redirect_uri=http://localhost:9000/&response_type=token';
    return;
  }

  var params = {};
  window.location.hash.split('&')
    .forEach(function (p) {
      var pair = p.split('=', 2);
      params[pair[0]] = decodeURIComponent(pair[1]);
    });

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
    subscribe: function () {
      var siteId = $('#site_id').val();
      $('#site_id').val('');

      this.sites.push(siteId);

      this.updateSites(this.sites);
      this.updatePosts(this.sites);
    },
    updateSites: function (sites) {
      var $sites = sites
        .map(function (site) {
          return $('<li class="list-group-item">').text(site);
        });
      $('#sites').empty().append($sites);
    },
    updatePosts: function (sites) {
      var deferreds = sites
            .map(function (site) {
              return getPosts(site);
            });
      $.when.apply($, deferreds)
        .then(function () {
          var args = Array.prototype.slice.apply(arguments);
          var posts = Array.prototype.concat.apply([], args);
          posts.sort(function (a, b) {
            var dateA = Date.parse(a.date);
            var dateB = Date.parse(b.date);

            return dateB - dateA;
          });
          console.log(posts);

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
