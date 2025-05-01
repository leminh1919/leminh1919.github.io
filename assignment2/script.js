const video = document.getElementById("custom-video-player");
const playPauseImg = document.querySelector("#play-pause-img");
const progressContainer = document.querySelector(".progress-bar");
const progressBar = document.getElementById("progress-bar-fill");

video.removeAttribute("controls");

// Play/Pause functionality
function togglePlayPause() {
  if (video.paused || video.ended) {
    video.play();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
  } else {
    video.pause();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
  }
}

// Update progress bar
video.addEventListener("timeupdate", updateProgressBar);
function updateProgressBar() {
  const value = (video.currentTime / video.duration) * 100;
  progressBar.style.width = value + "%";
  progressThumb.style.left = value + "%";
  timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(
    video.duration
  )}`;
}

// Mute/Unmute functionality
const muteUnmuteImg = document.querySelector("#mute-unmute-img");
function toggleMuteUnmute() {
  if (video.muted) {
    video.muted = false;
    muteUnmuteImg.src =
      "https://img.icons8.com/ios-glyphs/30/high-volume--v1.png";
  } else {
    video.muted = true;
    muteUnmuteImg.src = "https://img.icons8.com/ios-glyphs/30/mute--v1.png";
  }
}

// Fullscreen functionality
const fullScreenImg = document.querySelector("#full-screen-img");
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    video.parentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting fullscreen: ${err.message}`);
    });
    fullScreenImg.src = "https://img.icons8.com/ios-glyphs/30/collapse.png";
  } else {
    document.exitFullscreen();
    fullScreenImg.src =
      "https://img.icons8.com/ios-glyphs/30/full-screen--v1.png";
  }
}

//this is for when i exit fullscreen fullscreen it jumps to my orginial spot not to the top
let scrollYBeforeFullscreen = 0;
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    scrollYBeforeFullscreen = window.scrollY; // Save scroll position
    video.parentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting fullscreen: ${err.message}`);
    });
    fullScreenImg.src = "https://img.icons8.com/ios-glyphs/30/collapse.png";
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullScreenImg.src =
      "https://img.icons8.com/ios-glyphs/30/full-screen--v1.png";
    window.scrollTo({ top: scrollYBeforeFullscreen, behavior: "instant" });
  }
});

// All the buttons disappear after few seconds
// Show/Hide controls
function showControls() {
  document.querySelector(".custom-controls").style.opacity = "1";
  document.querySelector(".progress-bar").style.opacity = "1";
}
function hideControls() {
  document.querySelector(".custom-controls").style.opacity = "0";
  document.querySelector(".progress-bar").style.opacity = "0";
}
//reset hide time
let controlTimeout;
function resetControlTimeout() {
  showControls();
  clearTimeout(controlTimeout);
  controlTimeout = setTimeout(hideControls, 3000); // hide after 3 seconds
}
//add mouse interaction
video.parentElement.addEventListener("mousemove", resetControlTimeout);
video.addEventListener("play", resetControlTimeout);

// Progress bar seek and drag
progressContainer.addEventListener("click", (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  video.currentTime = percent * video.duration;
});

let isDragging = false;

progressContainer.addEventListener("mousedown", () => {
  isDragging = true;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const rect = progressContainer.getBoundingClientRect();
    const percent = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1
    );
    video.currentTime = percent * video.duration;
  }
});

// Time display functionality
const progressThumb = document.getElementById("progress-thumb");
const timeDisplay = document.getElementById("time-display");
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Repeat functionality
let isRepeat = false;
const repeatImg = document.getElementById("repeat-img");

function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatImg.style.filter = isRepeat
    ? "invert(34%) sepia(96%) saturate(800%) hue-rotate(90deg)" // visible highlight
    : "invert(1)";
}

// loop when video ends
video.addEventListener("ended", () => {
  if (isRepeat) {
    video.currentTime = 0;
    video.play();
  }
});
// I did not add fast foward function because i think enable to move the progress bar is enough
