!function(){"use strict";var t;t="localhost"===window.location.hostname?44553:44085;var o={};if(window.location.hash.split("&").forEach(function(t){var e=t.split("=",2);o[e[0]]=decodeURIComponent(e[1])}),!o["#access_token"]){var e=window.location.origin+window.location.pathname,i="https://public-api.wordpress.com/oauth2/authorize?client_id="+t+"&redirect_uri="+e+"&response_type=token";return void(window.location=i)}window.history.replaceState(null,null,window.location.origin+window.location.pathname),$(document).on("submit","#subscribe",function(t){t.preventDefault();var e=$("#site_id").val(),i=_.template($("#post-template").html());$.ajax({url:"https://public-api.wordpress.com/rest/v1/sites/"+e+"/posts/",type:"GET",beforeSend:function(t){t.setRequestHeader("Authorization","BEARER "+o["#access_token"])}}).then(function(t){var o=t.posts,e=o.map(function(t){var o={title:t.title,date:moment(t.date).format("YYYY.MM.DD"),url:t.URL};return t.featured_image?o.thumbnail=t.featured_image+"?=200":o.thumbnail="http://placehold.it/200x150/27709b/ffffff",$(i(o))});$("#posts").empty().append(e)}).fail(function(t){console.log(t)})})}();