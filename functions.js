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

    // Create persistent media elements
    let persistentImg = document.createElement('img');
    let persistentVideo = document.createElement('video');

    Object.assign(persistentVideo, {
        autoplay: true,
        loop: true,
        muted: true,
        playsInline: true
    });

    // Style persistent elements
    [persistentImg, persistentVideo].forEach(el => {
        Object.assign(el.style, {
            maxWidth: '400px',
            maxHeight: '400px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'none' // Hidden by default
        });
        hoverMediaContainer.appendChild(el);
    });

    function updateMediaElement(imagePath, videoPath) {
        // Hide both initially
        persistentImg.style.display = 'none';
        persistentVideo.style.display = 'none';

        let activeElement = null;

        if (videoPath) {
            persistentVideo.src = videoPath;
            persistentVideo.style.display = 'block';
            activeElement = persistentVideo;
            applyBorderRadius(persistentVideo);
        } else if (imagePath) {
            persistentImg.src = imagePath;
            persistentImg.style.display = 'block';
            activeElement = persistentImg;
            applyBorderRadius(persistentImg);
        }

        return activeElement;
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

        // Event Delegation: Attach listeners to document.body once
        // We use a flag to prevent multiple attachments if this function is called multiple times
        if (document.body.dataset.hoverEffectsInitialized) return;
        document.body.dataset.hoverEffectsInitialized = 'true';

        document.body.addEventListener('mouseover', function (e) {
            const header = e.target.closest('.item h3');
            if (!header) return;
            const card = header.closest('.item');
            if (!card) return;

            // Cache data attributes
            const imagePath = card.getAttribute('data-image');
            const videoPath = card.getAttribute('data-video');

            // Skip if no media to show
            if (!imagePath && !videoPath) return;

            const activeElement = updateMediaElement(imagePath, videoPath);

            if (activeElement) {
                const { x, y } = calculatePosition(e.pageX, e.pageY, { width: 400, height: 400 });
                hoverMediaContainer.style.left = x + 'px';
                hoverMediaContainer.style.top = y + 'px';

                gsap.killTweensOf(hoverMediaContainer);
                gsap.fromTo(hoverMediaContainer,
                    { opacity: 0, filter: BLUR_IN },
                    { opacity: 1, filter: BLUR_OUT, duration: ANIMATION_DURATION, ease: EASE_TYPE }
                );
            }
        });

        document.body.addEventListener('mouseout', function (e) {
            const header = e.target.closest('.item h3');
            if (!header) return;
            const card = header.closest('.item');
            if (!card) return;

            gsap.killTweensOf(hoverMediaContainer);
            gsap.to(hoverMediaContainer, {
                opacity: 0,
                filter: BLUR_IN,
                duration: ANIMATION_DURATION,
                ease: EASE_TYPE,
                // We don't clear innerHTML anymore, just hide opacity
            });
        });

        document.body.addEventListener('click', function (e) {
            const header = e.target.closest('.item h3');
            if (!header) return;
            const card = header.closest('.item');
            if (!card) return;

            gsap.killTweensOf(hoverMediaContainer);
            gsap.to(hoverMediaContainer, {
                opacity: 0,
                filter: BLUR_IN,
                duration: 0.2,
                ease: EASE_TYPE
            });
        });

        // Throttled mousemove for better performance
        const throttledMouseMove = throttle(function (e) {
            // Only update if we are hovering an item h3
            if (!e.target.closest('.item h3')) return;

            const mediaRect = hoverMediaContainer.getBoundingClientRect();
            const { x, y } = calculatePosition(e.pageX, e.pageY, mediaRect);

            gsap.to(hoverMediaContainer, {
                left: x + 'px',
                top: y + 'px',
                duration: ANIMATION_DURATION,
                ease: EASE_TYPE
            });
        }, 16); // ~60fps throttling

        document.body.addEventListener('mousemove', throttledMouseMove);
    }

    // Initialize and set up event delegation
    initializeHoverEffects();
    initializeAccordion();

    // No need for 'contentUpdated' listener anymore since we use delegation on body
}

function initializeAccordion() {
    // Use event delegation to handle dynamic content and avoid multiple listeners
    if (document.body.dataset.accordionInitialized) return;
    document.body.dataset.accordionInitialized = 'true';

    document.body.addEventListener('click', (e) => {
        // Check if the clicked element or its parent is the trigger
        const trigger = e.target.closest('.experience-item p.small');
        if (!trigger) return;

        const item = trigger.closest('.experience-item');
        if (!item) return;

        // Prevent bubbling
        e.stopPropagation();

        // Find all items currently in the DOM
        const allItems = document.querySelectorAll('.experience-item');

        // Close other items
        allItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });

        // Toggle active class
        item.classList.toggle('active');
    });
}

// Use DOMContentLoaded for faster initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
