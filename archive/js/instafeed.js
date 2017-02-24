Number.prototype.pad = function(length) {
  var s = this + "";
  while (s.length < length) {
    s = "0" + s;
  }
  return s;
};

var tag = window.location.hash.replace("#", "");
console.log("Tag is", tag, "and hash is", window.location.hash)
var clientId = "8d0bdf74731f416f97185f60f7078ea3";
var url = "https://api.instagram.com/v1/tags/" + tag + "/media/recent?client_id=" + clientId;
var images = [];
var index = 0;

var render = function(options) {
  options = options || {};
  var img, image, data, paint;

  if (index < images.length) {
    data = images[index];
  } else {
    data = images[0];
    index = 0;
  }

  image = new Image();
  image.onload = function() {
    img = $("<img>");
    console.log("Image is now : ", data.src, " from ", data.username, " created ", data.timestamp, " caption ", data.caption);
    img.attr('src', data.src);
    img.attr('alt', data.caption);
    img.attr('height', 612);
    img.attr('width', 612);
    paint = function() {
      $('#photo-container').html(img);
      $('#photo-caption').html(data.caption);
      $('#photo-user').html(data.username);
      $('#photo-timestamp').html($.timeago(data.timestamp));
      if (data.likeCount > 0) {
        $('#photo-likes').html("&hearts;&nbsp;" + data.likeCount);
        $('#photo-likes').show();
      } else {
        $('#photo-likes').hide();
      }
    }
    if (options.firstRun) {
      paint()
    } else {
      $('#instafeed-container').fadeOut(250);
      setTimeout(function() {
        paint();
        $('#instafeed-container').fadeIn(250);
      }, 300);
    }
  }
  image.src = data.src;
  index += 1;
}

var updateData = function(options) {
  options = options || {};
  console.log("Fetching data from instagram!");
  $.ajax({
    dataType: 'jsonp',
    url: url,
    success: function(response) {
      images = []
      var username, imageUrl, likeCount, caption, timestamp, data;
      for (var i = 0; i < response.data.length; i++) {
        data = response.data[i];
        if (data && data.user && data.images && data.created_time) {
          timestamp = new Date(parseInt(data.created_time, 10) * 1000);
          username = data.user.username;
          imageUrl = data.images.standard_resolution.url;
          // Like count
          likeCount = 0;
          if (data.likes) {
            likeCount = data.likes.count;
          }
          // Caption
          caption = "#" + tag;
          if (data.caption) {
            caption = data.caption.text;
          }
          images.push({
            username: username,
            src: imageUrl,
            likeCount: likeCount,
            caption: caption,
            timestamp: timestamp
          })
        } else {
          console.log("Missing data in : ", data, data.user, data.images, data.created_time);
        }
      }
      if (options.render) {
        render({ firstRun: true });
      }
    }
  })
};

$(document).ready(function() {
  $('#title').text('#' + tag);
  var updateInterval = setInterval(updateData, 60000);
  var renderInterval = setInterval(render, 5000);
  updateData({ render: true });
});
