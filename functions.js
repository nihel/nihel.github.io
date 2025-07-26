function initialize() {
    let player = document.getElementById("logo-lottie");

    player.addEventListener("ready", () => {
        LottieInteractivity.create({
            player: "#logo-lottie",
            mode: "cursor",
            actions: [
                { type: "click", forceFlag: true }
            ]
        });
        player.play();
    });

    player.addEventListener("click", () => {
        // Don't trigger if drawer is active (being opened/closed)
        if (document.body.classList.contains('scrim-active')) {
            return;
        }
        player.play();
    });

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    let hoverMediaContainer = document.getElementById('hover-media');
    if (!hoverMediaContainer) {
        hoverMediaContainer = document.createElement('div');
        hoverMediaContainer.id = 'hover-media';
        hoverMediaContainer.style.position = 'fixed';
        hoverMediaContainer.style.zIndex = '1000';
        hoverMediaContainer.style.filter = 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))';
        hoverMediaContainer.style.borderRadius = '8px';
        document.body.appendChild(hoverMediaContainer);
    }

    // Shared animation filter values
    const BLUR_IN = 'blur(24px) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))';
    const BLUR_OUT = 'blur(0px) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))';

    function applyBorderRadius(mediaElement) {
        const checkOrientation = () => {
            const isLandscape = (mediaElement.videoWidth || mediaElement.naturalWidth) > 
                              (mediaElement.videoHeight || mediaElement.naturalHeight);
            hoverMediaContainer.style.borderRadius = isLandscape ? '12px' : '16px';
        };

        if (mediaElement.tagName === 'VIDEO') {
            mediaElement.addEventListener('loadedmetadata', checkOrientation);
        } else {
            mediaElement.addEventListener('load', checkOrientation);
        }
    }

    function createMediaElement(imagePath, videoPath, maxWidth = '400px') {
        let mediaElement;
        if (videoPath) {
            mediaElement = document.createElement('video');
            mediaElement.src = videoPath;
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.muted = true;
            mediaElement.playsInline = true;
        } else if (imagePath) {
            mediaElement = document.createElement('img');
            mediaElement.src = imagePath;
        }

        if (mediaElement) {
            mediaElement.style.maxWidth = maxWidth;
            mediaElement.style.maxHeight = '400px';
            mediaElement.style.width = 'auto';
            mediaElement.style.height = 'auto';
            mediaElement.style.objectFit = 'contain';
            applyBorderRadius(mediaElement);
        }

        return mediaElement;
    }

    let isHoverMediaVisible = false;

    function initializeHoverEffects() {
        document.querySelectorAll('.item').forEach(card => {
            card.addEventListener('mouseenter', function (event) {
                if (isTouchDevice) return;

                const imagePath = card.getAttribute('data-image');
                const videoPath = card.getAttribute('data-video');
                hoverMediaContainer.innerHTML = '';
                hoverMediaContainer.style.position = 'absolute';

                const mediaElement = createMediaElement(imagePath, videoPath);
                if (mediaElement) {
                    hoverMediaContainer.appendChild(mediaElement);
                }

                hoverMediaContainer.style.left = event.pageX + 200 + 'px';
                hoverMediaContainer.style.top = event.pageY - 200 + 'px';

                gsap.killTweensOf(hoverMediaContainer);
                gsap.fromTo(hoverMediaContainer, 
                    { opacity: 0, filter: BLUR_IN }, 
                    { opacity: 1, filter: BLUR_OUT, duration: 0.4, ease: "power3.out" }
                );
            });

            card.addEventListener('mouseleave', function () {
                if (isTouchDevice) return;
                gsap.killTweensOf(hoverMediaContainer);
                gsap.to(hoverMediaContainer, { 
                    opacity: 0, 
                    filter: BLUR_IN, 
                    duration: 0.4, 
                    ease: "power3.out", 
                    onComplete: () => hoverMediaContainer.innerHTML = ''
                });
            });

            card.addEventListener('mousemove', function (e) {
                if (isTouchDevice) return;
                const posX = e.pageX + 200; // Offset to the right of the cursor
                const posY = e.pageY - 200; // Offset above the cursor

                const hoverMediaRect = hoverMediaContainer.getBoundingClientRect();

                let adjustedPosX = posX;
                let adjustedPosY = posY;

                // Clamp horizontally
                if (adjustedPosX + hoverMediaRect.width > window.scrollX + window.innerWidth) {
                    adjustedPosX = window.scrollX + window.innerWidth - hoverMediaRect.width - 10;
                }
                if (adjustedPosX < window.scrollX + 10) {
                    adjustedPosX = window.scrollX + 10;
                }

                // Clamp vertically
                if (adjustedPosY + hoverMediaRect.height > window.scrollY + window.innerHeight) {
                    adjustedPosY = window.scrollY + window.innerHeight - hoverMediaRect.height - 10;
                }
                if (adjustedPosY < window.scrollY + 10) {
                    adjustedPosY = window.scrollY + 10;
                }

                gsap.to(hoverMediaContainer, { left: adjustedPosX + 'px', top: adjustedPosY + 'px', duration: 0.4, ease: "power3.out" });
            });

            card.addEventListener('click', function (event) {
                if (!isTouchDevice) return;
                
                event.stopPropagation();
                const imagePath = card.getAttribute('data-image');
                const videoPath = card.getAttribute('data-video');
                hoverMediaContainer.innerHTML = '';
                hoverMediaContainer.style.left = '50%';
                hoverMediaContainer.style.top = '10px';
                hoverMediaContainer.style.transform = 'translateX(-50%)';
                
                const mediaElement = createMediaElement(imagePath, videoPath, '375px');
                if (mediaElement) {
                    hoverMediaContainer.appendChild(mediaElement);
                }

                gsap.killTweensOf(hoverMediaContainer);
                gsap.fromTo(hoverMediaContainer, 
                    { opacity: 0, filter: BLUR_IN }, 
                    { opacity: 1, filter: BLUR_OUT, duration: 0.4, ease: "power3.out" }
                );

                isHoverMediaVisible = true;
            });
        });

        document.addEventListener('click', function (event) {
            if (isHoverMediaVisible && !hoverMediaContainer.contains(event.target)) {
                gsap.killTweensOf(hoverMediaContainer);
                gsap.to(hoverMediaContainer, { 
                    opacity: 0, 
                    filter: BLUR_IN, 
                    duration: 0.4, 
                    ease: "power3.out", 
                    onComplete: () => {
                        hoverMediaContainer.innerHTML = '';
                        isHoverMediaVisible = false;
                    }
                });
            }
        });
    }

    initializeHoverEffects();
    document.addEventListener('contentUpdated', initializeHoverEffects);
}

window.onload = initialize;
