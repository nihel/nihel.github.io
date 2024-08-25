function initialize() {
    // Ensure the hover media container is only created once
    let hoverMediaContainer = document.getElementById('hover-media');
    if (!hoverMediaContainer) {
        hoverMediaContainer = document.createElement('div');
        hoverMediaContainer.id = 'hover-media';
        document.body.appendChild(hoverMediaContainer);
    }

    // Initialize hover effects for '.item' elements
    function initializeHoverEffects() {
        document.querySelectorAll('.item').forEach(card => {
            card.addEventListener('mouseenter', function (event) {
                const imagePath = card.getAttribute('data-image');
                const videoPath = card.getAttribute('data-video');

                hoverMediaContainer.innerHTML = ''; // Clear previous content

                let mediaElement;
                if (videoPath) {
                    mediaElement = document.createElement('video');
                    mediaElement.src = videoPath;
                    mediaElement.autoplay = true;
                    mediaElement.loop = true;
                    mediaElement.muted = true; // Prevent sound from playing
                    mediaElement.playsInline = true; // Ensure it plays on mobile browsers

                    mediaElement.addEventListener('canplaythrough', () => {
                        mediaElement.play();
                    });
                } else if (imagePath) {
                    mediaElement = document.createElement('img');
                    mediaElement.src = imagePath;
                }

                if (mediaElement) {
                    mediaElement.style.maxWidth = '320px';
                    mediaElement.style.maxHeight = '320px';
                    mediaElement.style.width = 'auto';
                    mediaElement.style.height = 'auto';
                    mediaElement.style.objectFit = 'contain'; // Maintain aspect ratio
                    hoverMediaContainer.appendChild(mediaElement);

                    mediaElement.addEventListener('loadedmetadata', () => {
                        const isPortrait = mediaElement.videoHeight > mediaElement.videoWidth;
                        hoverMediaContainer.dataset.isPortrait = isPortrait && videoPath ? 'true' : 'false';
                    });

                    mediaElement.addEventListener('load', () => {
                        const isPortrait = mediaElement.naturalHeight > mediaElement.naturalWidth;
                        hoverMediaContainer.dataset.isPortrait = isPortrait && imagePath ? 'true' : 'false';
                    });
                }

                hoverMediaContainer.style.left = event.clientX + 'px';
                hoverMediaContainer.style.top = event.clientY + 'px';

                gsap.fromTo(hoverMediaContainer, 
                    { opacity: 0, scale: 0.8 }, 
                    { opacity: 1, scale: 1, duration: 0.2, ease: "power3.out" }
                );
            });

            card.addEventListener('mouseleave', function () {
                gsap.to(hoverMediaContainer, { 
                    opacity: 0, 
                    scale: 0.8, 
                    duration: 0.2, 
                    ease: "power3.out",
                    onComplete: () => {
                        const videoElement = hoverMediaContainer.querySelector('video');
                        if (videoElement) {
                            videoElement.pause();
                            videoElement.currentTime = 0;
                        }
                    }
                });
            });

            card.addEventListener('mousemove', function (e) {
                const posX = e.clientX + 20; // Offset 20px to the right of the cursor
                const posY = e.clientY + 20; // Offset 20px below the cursor

                const hoverMediaRect = hoverMediaContainer.getBoundingClientRect();
                const isPortrait = hoverMediaContainer.dataset.isPortrait === 'true';

                let adjustedPosX = posX;
                if (posX + hoverMediaRect.width > window.innerWidth + 60) {
                    adjustedPosX = e.clientX - hoverMediaRect.width - 20;
                }

                let adjustedPosY = posY;
                if (posY + hoverMediaRect.height > window.innerHeight + 60) {
                    adjustedPosY = e.clientY - hoverMediaRect.height - 20;
                }

                if (isPortrait) {
                    adjustedPosY -= 120; // Adjust this value as needed
                }

                gsap.to(hoverMediaContainer, { 
                    left: adjustedPosX + 'px', 
                    top: adjustedPosY + 'px', 
                    duration: 0.4, 
                    ease: "power3.out" 
                });
            });
        });
    }

    // Call this function once when the page loads
    initializeHoverEffects();

    // If your one-pager has dynamic content loading or sections that appear on scroll
    // you might need to re-initialize the hover effects when new content is added.
    document.addEventListener('contentUpdated', initializeHoverEffects);
}

window.initialize = initialize;