function initialize() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Cache DOM elements
    let hoverMediaContainer = document.getElementById('hover-media');
    if (!hoverMediaContainer) {
        hoverMediaContainer = document.createElement('div');
        hoverMediaContainer.id = 'hover-media';
        Object.assign(hoverMediaContainer.style, {
            position: 'absolute',
            zIndex: '1000',
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))',
            borderRadius: '8px'
        });
        document.body.appendChild(hoverMediaContainer);
    }

    // Pre-compile constants for better performance
    const BLUR_IN = 'blur(24px) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))';
    const BLUR_OUT = 'blur(0px) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))';
    const ANIMATION_DURATION = 0.4;
    const EASE_TYPE = "power3.out";
    const HOVER_OFFSET_X = 200;
    const HOVER_OFFSET_Y = -200;
    const EDGE_MARGIN = 10;

    function applyBorderRadius(mediaElement) {
        const checkOrientation = () => {
            const isLandscape = (mediaElement.videoWidth || mediaElement.naturalWidth) > 
                              (mediaElement.videoHeight || mediaElement.naturalHeight);
            hoverMediaContainer.style.borderRadius = isLandscape ? '12px' : '16px';
        };

        const eventType = mediaElement.tagName === 'VIDEO' ? 'loadedmetadata' : 'load';
        mediaElement.addEventListener(eventType, checkOrientation, { once: true });
    }

    function createMediaElement(imagePath, videoPath, maxWidth = '400px') {
        let mediaElement;
        
        if (videoPath) {
            mediaElement = document.createElement('video');
            mediaElement.src = videoPath;
            Object.assign(mediaElement, {
                autoplay: true,
                loop: true,
                muted: true,
                playsInline: true
            });
        } else if (imagePath) {
            mediaElement = document.createElement('img');
            mediaElement.src = imagePath;
        }

        if (mediaElement) {
            Object.assign(mediaElement.style, {
                maxWidth,
                maxHeight: '400px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
            });
            applyBorderRadius(mediaElement);
        }

        return mediaElement;
    }

    // Throttle utility for performance
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    // Optimized position calculation
    function calculatePosition(pageX, pageY, mediaRect) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        
        let adjustedPosX = pageX + HOVER_OFFSET_X;
        let adjustedPosY = pageY + HOVER_OFFSET_Y;

        // Horizontal bounds checking
        if (adjustedPosX + mediaRect.width > scrollX + viewportWidth) {
            adjustedPosX = scrollX + viewportWidth - mediaRect.width - EDGE_MARGIN;
        }
        if (adjustedPosX < scrollX + EDGE_MARGIN) {
            adjustedPosX = scrollX + EDGE_MARGIN;
        }

        // Vertical bounds checking
        if (adjustedPosY + mediaRect.height > scrollY + viewportHeight) {
            adjustedPosY = scrollY + viewportHeight - mediaRect.height - EDGE_MARGIN;
        }
        if (adjustedPosY < scrollY + EDGE_MARGIN) {
            adjustedPosY = scrollY + EDGE_MARGIN;
        }

        return { x: adjustedPosX, y: adjustedPosY };
    }

    function initializeHoverEffects() {
        if (isTouchDevice) return; // Early return for touch devices
        
        document.querySelectorAll('.item').forEach(card => {
            // Cache data attributes
            const imagePath = card.getAttribute('data-image');
            const videoPath = card.getAttribute('data-video');
            
            // Skip if no media to show
            if (!imagePath && !videoPath) return;

            card.addEventListener('mouseenter', function (event) {
                hoverMediaContainer.innerHTML = '';

                const mediaElement = createMediaElement(imagePath, videoPath);
                if (mediaElement) {
                    hoverMediaContainer.appendChild(mediaElement);
                    
                    const { x, y } = calculatePosition(event.pageX, event.pageY, { width: 400, height: 400 });
                    hoverMediaContainer.style.left = x + 'px';
                    hoverMediaContainer.style.top = y + 'px';

                    gsap.killTweensOf(hoverMediaContainer);
                    gsap.fromTo(hoverMediaContainer, 
                        { opacity: 0, filter: BLUR_IN }, 
                        { opacity: 1, filter: BLUR_OUT, duration: ANIMATION_DURATION, ease: EASE_TYPE }
                    );
                }
            });

            card.addEventListener('mouseleave', function () {
                gsap.killTweensOf(hoverMediaContainer);
                gsap.to(hoverMediaContainer, { 
                    opacity: 0, 
                    filter: BLUR_IN, 
                    duration: ANIMATION_DURATION, 
                    ease: EASE_TYPE, 
                    onComplete: () => hoverMediaContainer.innerHTML = ''
                });
            });

            card.addEventListener('click', function () {
                gsap.killTweensOf(hoverMediaContainer);
                gsap.to(hoverMediaContainer, { 
                    opacity: 0, 
                    filter: BLUR_IN, 
                    duration: 0.2, 
                    ease: EASE_TYPE, 
                    onComplete: () => hoverMediaContainer.innerHTML = ''
                });
            });

            // Throttled mousemove for better performance
            const throttledMouseMove = throttle(function (e) {
                const mediaRect = hoverMediaContainer.getBoundingClientRect();
                const { x, y } = calculatePosition(e.pageX, e.pageY, mediaRect);
                
                gsap.to(hoverMediaContainer, { 
                    left: x + 'px', 
                    top: y + 'px', 
                    duration: ANIMATION_DURATION, 
                    ease: EASE_TYPE 
                });
            }, 16); // ~60fps throttling

            card.addEventListener('mousemove', throttledMouseMove);

        });
    }

    // Initialize and set up event delegation
    initializeHoverEffects();
    
    // Use more efficient event delegation for dynamic content
    document.addEventListener('contentUpdated', () => {
        // Only re-initialize if we're not on a touch device
        if (!isTouchDevice) {
            initializeHoverEffects();
        }
    });
}

// Use DOMContentLoaded for faster initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
