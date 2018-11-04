$(function() {
//http://31.214.240.25:8000/stream
  /* STREAM CONFIG */
  const stream_url = "https://stream.laut.fm/homeradio";
  const current_song_url = "https://api.laut.fm/station/homeradio/current_song";
  const start_volume = 0.2;
  const save_volume_in_cookie = true;
  const song_link = true;
  const autoplay = false;
  /* END STREAM CONFIG */

  //ParticleJS
  particlesJS.load('particles-js', 'assets/js/particles.json');

  //Smooth scroll
  const scroll = new SmoothScroll('a[href*="#"]');

  //now-playing-bar sticky scroll
  $( window ).scroll(function() {
    if($(window).scrollTop() > $( "header" ).offset().top + 100) {
      $( "#now-playing-bar" ).addClass('sticky');
    } else {
      $( "#now-playing-bar" ).removeClass('sticky');
    }
  });

  //STREAM
  let stream = new Audio(stream_url);
  let isPlaying = false;
  let volumeBeforeMute = 0;
  let lastPlayedTimestamp;

  setVolume(start_volume);
  processSongInformation(5000);
  if(autoplay)
    playPause();


  $( "#play-stop" ).click(playPause);
  $( "#volume" ).click(muteUnmute);



  function muteUnmute() {
    if(stream.volume > 0) {
      volumeBeforeMute = stream.volume;
      setVolume(0);
    } else {
      setVolume(volumeBeforeMute || 1)
    }
  }

  function playPause() {
    if(!isPlaying) {
      if(lastPlayedTimestamp + 60000 <= Date.now()) {
        stream.load();
        stream.play();
      } else {
        stream.play();
      }
      isPlaying = true;
      $( "#play-stop" ).html('<i class="fa fa-pause"></i>');
    } else {
      stream.pause();
      isPlaying = false;
      lastPlayedTimestamp = Date.now();
      $( "#play-stop" ).html('<i class="fa fa-play"></i>');
    }
  }

  function setVolume(volume) {
    stream.volume = volume;

    if(volume == 0) {
      $( "#volume" ).html('<i class="fa fa-volume-off"></i>');
    } else if(volume <= 0.5) {
      $( "#volume" ).html('<i class="fa fa-volume-down"></i>');
    } else {
      $( "#volume" ).html('<i class="fa fa-volume-up"></i>');
    }

    if(save_volume_in_cookie) {
      $.cookie("last_volume", volume, { expires : 100 });
    }
  }



  // ===== Volume delayer ===== //
  let isVolumeDelayed = false;
  function volumeDelay(callback) {
    if(!isVolumeDelayed) {
      isVolumeDelayed = true;
      setTimeout(function(){
        isVolumeDelayed = false;
      }, 250);
      callback();
    }
  }


  function processSongInformation(inv) {
      setTimeout(function(){
      $.getJSON( current_song_url, function( data ) {
          if(data) {

            let shortedTitle = data.title;
            if(data.title.length >= 40) {
              shortedTitle = data.title.substring(0, 37) + "...";
            }

            if(song_link) {
              $( "#now-playing-song-title" ).html('<a target="_blank" href="https://www.google.de/search?q=' + data.title + '">' + shortedTitle + '</a>');
            } else {
              $( "#now-playing-song-title" ).html(shortedTitle);
            }


            if(data.artist) {
              if(data.artist.image) {
                $('#now-playing-song-img').html('<img src="' + data.artist.image + '" />');
              } else {
                $('#now-playing-song-img').html('<div class="placeholder"></div>');
              }
              if(data.artist.name) {
                if(data.artist.url) {
                  $('#now-playing-song-artist').html('<a target="_blank" href="' + data.artist.url + '">' + data.artist.name + '</a>');
                } else {
                  $('#now-playing-song-artist').html(data.artist.name);
                }
              } else {
                $('#now-playing-song-artist').html('<div class="placeholder"></div>');
              }
            }



            var song_started_at = Date.parse(data.started_at);
            var diff = song_started_at + data.length * 1000 - new Date().getTime();
            processSongInformation(diff + 2000);
          }
      });

    }, inv);
  }




  // ===== Keyboard controll ===== //
  $( window ).bind('keypress', function(e) {
      e.preventDefault();
      var code = e.keyCode || e.which;
      if(code == 13 || code == 32) {
        playPause();
      } else if(code == 119) {
        volumeDelay(function(){
          if(stream.volume >= 0.9) {
            setVolume(1);
          } else {
            setVolume(stream.volume + 0.1)
          }
        })
      } else if(code == 115) {
        volumeDelay(function(){
          if(stream.volume <= 0.1) {
            setVolume(0);
          } else {
            setVolume(stream.volume - 0.1);
          }
        })
      } else if(code == 109) {
        muteUnmute();
      }
    });


});
