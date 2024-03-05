const gallery = document.getElementById('gallery');
const audioPlayer = document.getElementById('audioPlayer');

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        data.items.forEach((item, index) => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo';
            photoElement.innerHTML = `<img src="portraits/${item.photo}" alt="Photo ${index + 1}" onclick="playSong('musique_portrait/${item.song}')">`;
            gallery.appendChild(photoElement);
        });
    })
    .catch(error => console.error('Error loading data:', error));

function playSong(song) {
    audioPlayer.src = song;
    audioPlayer.play();
}
