const gallery = document.getElementById('gallery');
const audioPlayer = document.getElementById('audioPlayer');

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        let lastClickedPhoto; // Variable to store the last clicked photo

        data.items.forEach((item, index) => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo';

            const imgElement = document.createElement('img');
            imgElement.src = `portraits/${item.photo}`;
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

