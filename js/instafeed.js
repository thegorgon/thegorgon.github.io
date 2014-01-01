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

var countdown = function() {
  var string;
  var midnight = new Date('2014-01-01 00:00:00 PST');
  var now = new Date();
  var millisecondsLeft = midnight - now;
  var msPerSecond = 1000;
  var msPerMinute = 60 * msPerSecond;
  var msPerHour = 60 * msPerMinute;
  var hoursLeft = Math.floor(millisecondsLeft/msPerHour);
  var minutesLeft = Math.floor((millisecondsLeft - (hoursLeft * msPerHour))/msPerMinute);
  var secondsLeft = Math.floor((millisecondsLeft - (hoursLeft * msPerHour) - (minutesLeft * msPerMinute))/msPerSecond);
  if (millisecondsLeft < 0) {
    $('#countdown').text('Happy New Year!');
  } else {
    $('#countdown-counter').html(hoursLeft.pad(2) + ':' + minutesLeft.pad(2) + ':' + secondsLeft.pad(2));
  }
};

$(document).ready(function() {
  $('#title').text('#' + tag);
  var updateInterval = setInterval(updateData, 60000);
  var renderInterval = setInterval(render, 5000);
  var countdownInterval = setInterval(countdown, 100);
  updateData({ render: true });
});
