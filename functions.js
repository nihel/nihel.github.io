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
        player.play();
    });

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    let hoverMediaContainer = document.getElementById('hover-media');
    if (!hoverMediaContainer) {
        hoverMediaContainer = document.createElement('div');
        hoverMediaContainer.id = 'hover-media';
        hoverMediaContainer.style.position = 'fixed';
        hoverMediaContainer.style.zIndex = '1000';
        document.body.appendChild(hoverMediaContainer);
    }

    function applyBorderRadius(mediaElement) {
        const checkOrientation = () => {
            if (mediaElement.videoWidth > mediaElement.videoHeight || mediaElement.naturalWidth > mediaElement.naturalHeight) {
                hoverMediaContainer.style.borderRadius = '12px';
            } else {
                hoverMediaContainer.style.borderRadius = '16px';
            }
        };

        if (mediaElement.tagName === 'VIDEO') {
            mediaElement.addEventListener('loadedmetadata', checkOrientation);
        } else if (mediaElement.tagName === 'IMG') {
            mediaElement.addEventListener('load', checkOrientation);
        }
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
                    if (isTouchDevice) {
                        mediaElement.style.maxWidth = mediaElement.naturalWidth > mediaElement.naturalHeight ? '375px' : '400px';
                    } else {
                        mediaElement.style.maxWidth = '400px';
                    }
                    mediaElement.style.maxHeight = '400px';
                    mediaElement.style.width = 'auto';
                    mediaElement.style.height = 'auto';
                    mediaElement.style.objectFit = 'contain';
                    applyBorderRadius(mediaElement);
                    if (isTouchDevice) {
                        if (mediaElement.tagName === 'IMG') {
                            mediaElement.onload = () => {
                                if (mediaElement.naturalWidth > mediaElement.naturalHeight) {
                                    mediaElement.style.maxWidth = '375px';
                                }
                            };
                        } else if (mediaElement.tagName === 'VIDEO') {
                            mediaElement.onloadedmetadata = () => {
                                if (mediaElement.videoWidth > mediaElement.videoHeight) {
                                    mediaElement.style.maxWidth = '375px';
                                }
                            };
                        }
                    }
                    hoverMediaContainer.appendChild(mediaElement);
                }

                hoverMediaContainer.style.left = event.clientX + 200 + 'px';
                hoverMediaContainer.style.top = event.clientY - 200 + 'px';

                gsap.killTweensOf(hoverMediaContainer);
                gsap.fromTo(hoverMediaContainer, { opacity: 0, filter: 'blur(24px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: "power3.out" });
            });

            card.addEventListener('mouseleave', function () {
                if (isTouchDevice) return;
                gsap.killTweensOf(hoverMediaContainer);
                gsap.to(hoverMediaContainer, { opacity: 0, filter: 'blur(24px)', duration: 0.4, ease: "power3.out", onComplete: () => {
                    hoverMediaContainer.innerHTML = '';
                }});
            });

            card.addEventListener('mousemove', function (e) {
                if (isTouchDevice) return;
                const posX = e.clientX + 200 + window.scrollX; // Offset to the right of the cursor
                const posY = e.clientY - 200 + window.scrollY; // Offset above the cursor

                const hoverMediaRect = hoverMediaContainer.getBoundingClientRect();

                let adjustedPosX = posX;
                let adjustedPosY = posY;

                // Check if the media is outside the viewport horizontally and adjust if needed
                if (posX + hoverMediaRect.width - window.innerWidth > 50) {
                    adjustedPosX = window.innerWidth - hoverMediaRect.width - 50 + window.scrollX;
                } else if (posX < 50) {
                    adjustedPosX = 50 + window.scrollX;
                }

                // Check if the media is outside the viewport vertically and adjust if needed
                if (posY + hoverMediaRect.height - window.innerHeight > 50) {
                    adjustedPosY = window.innerHeight - hoverMediaRect.height - 50 + window.scrollY;
                } else if (posY < 50) {
                    adjustedPosY = 50 + window.scrollY;
                }

                gsap.to(hoverMediaContainer, { left: adjustedPosX + 'px', top: adjustedPosY + 'px', duration: 0.4, ease: "power3.out" });
            });

            card.addEventListener('click', function (event) {
                if (isTouchDevice) {
                    event.stopPropagation(); // Prevent the document click event from firing
                    const imagePath = card.getAttribute('data-image');
                    const videoPath = card.getAttribute('data-video');
                    hoverMediaContainer.innerHTML = '';
                    hoverMediaContainer.style.left = '50%';
                    hoverMediaContainer.style.top = '10px';
                    hoverMediaContainer.style.transform = 'translateX(-50%)';
                    
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
                        mediaElement.style.maxWidth = '375px';
                        mediaElement.style.maxHeight = '400px';
                        mediaElement.style.width = 'auto';
                        mediaElement.style.height = 'auto';
                        mediaElement.style.objectFit = 'contain';
                        applyBorderRadius(mediaElement);
                        hoverMediaContainer.appendChild(mediaElement);
                    }

                    gsap.killTweensOf(hoverMediaContainer);
                    gsap.fromTo(hoverMediaContainer, { opacity: 0, filter: 'blur(24px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: "power3.out" });

                    isHoverMediaVisible = true;
                }
            });
        });

        document.addEventListener('click', function (event) {
            if (isHoverMediaVisible && !hoverMediaContainer.contains(event.target)) {
                gsap.killTweensOf(hoverMediaContainer);
                gsap.to(hoverMediaContainer, { opacity: 0, filter: 'blur(24px)', duration: 0.4, ease: "power3.out", onComplete: () => {
                    hoverMediaContainer.innerHTML = '';
                    isHoverMediaVisible = false;
                }});
            }
        });
    }

    initializeHoverEffects();
    document.addEventListener('contentUpdated', initializeHoverEffects);
}

window.onload = initialize;
