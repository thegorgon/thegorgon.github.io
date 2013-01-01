var tag = "aloha2013";
var clientId = "8d0bdf74731f416f97185f60f7078ea3";
var url = "https://api.instagram.com/v1/tags/" + tag + "/media/recent?client_id=" + clientId;
var run = function() {
  $.ajax({
    dataType: 'jsonp',
    url: url,
    success: function(response) {
      var username, imageUrl, likeCount, caption, timestamp, data, image, img;
      data = response["data"] && response["data"][0];
      if (data && data["user"] && data["images"] && data["created_time"]) {
        timestamp = new Date(parseInt(data["created_time"], 10) * 1000);
        username = data["user"]["username"];
        imageUrl = data["images"]["standard_resolution"]["url"];
        // Like count
        likeCount = 0;
        if (data["likes"]) {
          likeCount = data["likes"]["count"];
        }
        // Caption
        caption = "#aloha2013";
        if (data["caption"]) {
          caption = data["caption"]["text"];
        }
      } else {
        console.log("Missing data in : ", data, data["user"], data["images"], data["created_time"]);
      }
      image = new Image();
      image.onload = function() {
        img = $("<img>");
        console.log("Image is now : ", imageUrl, " from ", username, " created ", timestamp, " caption ", caption);
        img.attr('src', imageUrl);
        img.attr('alt', caption);
        img.attr('height', 612);
        img.attr('width', 612);
        $('#photo-container').html(img);
        $('#photo-caption').html(caption);
        $('#photo-user').html(username);
        $('#photo-timestamp').html($.timeago(timestamp));
        if (likeCount > 0) {
          $('#photo-likes').html(likeCount);
          $('#photo-likes').show();
        } else {
          $('#photo-likes').hide();
        }
      }
      image.src = imageUrl;
    }
  })
};
var interval = setInterval(run, 60000);
run();