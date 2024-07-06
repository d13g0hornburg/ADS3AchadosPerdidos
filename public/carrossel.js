document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/images')
        .then(response => response.json())
        .then(images => {
            const imgContainer = document.getElementById('img');
            images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = `/uploads/${image}`;
                imgElement.alt = image;
                imgContainer.appendChild(imgElement);
            });

            // Carrossel
            const imgs = document.getElementById('img');
            const img = document.querySelectorAll('#img img');
            let idx = 0;

            function carrossel() {
                idx++;
                if (idx >= img.length) {
                    idx = 0;
                }
                imgs.style.transform = `translateX(${-idx * 300}px)`; // Ajuste conforme a largura da imagem
            }

            setInterval(carrossel, 1800); // Inicialize o carrossel
        })
        .catch(error => console.error('Erro ao carregar imagens:', error));
});