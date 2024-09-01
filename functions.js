function initialize() {
    // Check if the device supports touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // If it's a touch device, don't initialize hover effects
    if (isTouchDevice) {
        return;
    }

    // Ensure the hover media container is only created once
    let hoverMediaContainer = document.getElementById('hover-media');
    if (!hoverMediaContainer) {
        hoverMediaContainer = document.createElement('div');
        hoverMediaContainer.id = 'hover-media';
        document.body.appendChild(hoverMediaContainer);
    }

    // Function to apply border-radius based on media orientation
    function applyBorderRadius(mediaElement) {
        const checkOrientation = () => {
            if (mediaElement.videoWidth > mediaElement.videoHeight || mediaElement.naturalWidth > mediaElement.naturalHeight) {
                hoverMediaContainer.style.borderRadius = '12px'; // Landscape
            } else {
                hoverMediaContainer.style.borderRadius = '16px'; // Portrait
            }
        };

        if (mediaElement.tagName === 'VIDEO') {
            mediaElement.addEventListener('loadedmetadata', checkOrientation);
        } else if (mediaElement.tagName === 'IMG') {
            mediaElement.addEventListener('load', checkOrientation);
        }
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
                } else if (imagePath) {
                    mediaElement = document.createElement('img');
                    mediaElement.src = imagePath;
                }

                if (mediaElement) {
                    mediaElement.style.maxWidth = '400px';
                    mediaElement.style.maxHeight = '400px';
                    mediaElement.style.width = 'auto';
                    mediaElement.style.height = 'auto';
                    mediaElement.style.objectFit = 'contain'; // Maintain aspect ratio

                    // Apply border-radius based on orientation
                    applyBorderRadius(mediaElement);

                    hoverMediaContainer.appendChild(mediaElement);
                }

                hoverMediaContainer.style.left = event.clientX + 200 + 'px';
                hoverMediaContainer.style.top = event.clientY - 200 + 'px';

                // Cancel any ongoing animations before starting a new one
                gsap.killTweensOf(hoverMediaContainer);

                gsap.fromTo(hoverMediaContainer, 
                    { opacity: 0.8, filter: 'blur(24px)' }, 
                    { opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: "power3.out" }
                );
            });

            card.addEventListener('mouseleave', function () {
                // Cancel any ongoing animations before starting a new one
                gsap.killTweensOf(hoverMediaContainer);

                gsap.to(hoverMediaContainer, { 
                    opacity: 0, 
                    filter: 'blur(24px)', 
                    duration: 0.6, 
                    ease: "power3.out",
                    onComplete: () => {
                        const videoElement = hoverMediaContainer.querySelector('video');
                        if (videoElement) {
                            videoElement.pause();
                            videoElement.currentTime = 0;
                        }
                        hoverMediaContainer.innerHTML = ''; // Clear content after hiding
                    }
                });
            });

            card.addEventListener('mousemove', function (e) {
                const posX = e.clientX + 200; // Offset to the right of the cursor
                const posY = e.clientY - 200; // Offset above the cursor

                const hoverMediaRect = hoverMediaContainer.getBoundingClientRect();

                let adjustedPosX = posX;
                let adjustedPosY = posY;

                // Adjust position if media goes outside viewport
                if (posX + hoverMediaRect.width - window.innerWidth > 50) {
                    adjustedPosX = window.innerWidth - hoverMediaRect.width - 50;
                } else if (posX < 50) {
                    adjustedPosX = 50;
                }

                if (posY + hoverMediaRect.height - window.innerHeight > 50) {
                    adjustedPosY = window.innerHeight - hoverMediaRect.height - 50;
                } else if (posY < 50) {
                    adjustedPosY = 50;
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

    // Re-initialize hover effects if dynamic content is loaded
    document.addEventListener('contentUpdated', initializeHoverEffects);
}

window.initialize = initialize;