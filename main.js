fetch('data.json')
    .then(response => response.json())
    .then(data => {
        let lastClickedPhoto; // Variable to store the last clicked photo

        data.items.forEach((item, index) => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo';

            const imgElement = document.createElement('img');
            imgElement.src = `./i-am-listening/portraits/${item.photo}`;
            imgElement.alt = `Photo ${index + 1}`;

            imgElement.addEventListener('click', () => {
                // Check if there was a previously clicked photo, and remove its style
                if (lastClickedPhoto) {
                    lastClickedPhoto.classList.remove('photo-clicked');
                }

                // Update the style of the clicked photo
                photoElement.classList.add('photo-clicked');

                // Update the last clicked photo
                lastClickedPhoto = photoElement;

                // Call the playSong function
                playSong(item.song);
            });

            photoElement.appendChild(imgElement);
            gallery.appendChild(photoElement);
        });
    })
    .catch(error => console.error('Error loading data:', error));

function playSong(song) {
    audioPlayer.src = song;
    audioPlayer.play();
}

function skipAudio(seconds) {
  audioPlayer.currentTime += seconds;
}

document.addEventListener('DOMContentLoaded', function () {
  const gallery = document.getElementById('gallery');
  const audioPlayer = document.getElementById('audioPlayer');
  const musicControls = document.getElementById('musicControls');
  const currentTimeSpan = document.getElementById('currentTime');
  const progressBar = document.getElementById('progressBar');
  const durationSpan = document.getElementById('duration');

  let isDragging = false;

  // Update the current time and duration when the metadata of the audio is loaded
  audioPlayer.addEventListener('loadedmetadata', function () {
      updateDuration();
  });

  // Update the current time as the audio plays
  audioPlayer.addEventListener('timeupdate', function () {
      updateCurrentTime();
      if (!isDragging) {
          updateProgressBar();
      }
  });

  // Update the duration when the audio is loaded or changes
  audioPlayer.addEventListener('durationchange', function () {
      updateDuration();
  });

  // Handle the start of the drag operation
  progressBar.addEventListener('mousedown', function (e) {
      isDragging = true;
      handleDrag(e);
  });

  // Handle the end of the drag operation
  document.addEventListener('mouseup', function () {
      if (isDragging) {
          isDragging = false;
          updateProgressBar();
      }
  });

  // Handle the drag operation
  document.addEventListener('mousemove', function (e) {
      if (isDragging) {
          handleDrag(e);
      }
  });

  function handleDrag(e) {
      const rect = progressBar.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const seekTime = percentage * audioPlayer.duration;
      audioPlayer.currentTime = seekTime;
  }

  function updateCurrentTime() {
      const minutes = Math.floor(audioPlayer.currentTime / 60);
      const seconds = Math.floor(audioPlayer.currentTime % 60);
      currentTimeSpan.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function updateDuration() {
      const minutes = Math.floor(audioPlayer.duration / 60);
      const seconds = Math.floor(audioPlayer.duration % 60);
      durationSpan.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function updateProgressBar() {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.value = progress;
  }
});
