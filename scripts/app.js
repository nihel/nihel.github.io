// Debounce function to limit the rate of function execution
const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
};

// Video Control
function initializeVideoControls() {
    const playAfterThisHeight = 200;
    const video = document.querySelector('video');
    const videoControl = document.querySelector('.video-control');

    if (video) {
        // Ensure video loads and plays as soon as possible
        video.addEventListener('canplaythrough', () => {
            if (document.documentElement.scrollTop > playAfterThisHeight) {
                video.play();
            }
        });

        const handleScroll = debounce(() => {
            if (document.documentElement.scrollTop > playAfterThisHeight) {
                video.play();
            } else {
                video.pause();
            }
        }, 100);

        document.addEventListener('scroll', handleScroll);

        video.muted = true;
        video.volume = 0.4;

        if (videoControl) {
            videoControl.addEventListener('click', () => {
                video.muted = !video.muted;
                videoControl.classList.toggle('mute');
                videoControl.classList.toggle('unmute');
            });
        }

        // Preload video immediately
        video.load();
    }
}

document.addEventListener('DOMContentLoaded', initializeVideoControls);


// Custom Cursor
document.addEventListener('DOMContentLoaded', () => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return; // Exit the script if the device supports touch
    }

    const cursor = document.querySelector('.custom-cursor');
    let lastMouseEvent;

    // Function to update cursor position
    const updateCursorPosition = (e) => {
        gsap.to(cursor, {
            duration: 0.15,
            x: e.clientX,
            y: e.clientY,
            ease: 'power3.out'
        });
    };

    // Function to handle cursor visibility
    const setCursorVisibility = (visible) => {
        cursor.style.opacity = visible ? '1' : '0';
        document.body.style.cursor = visible ? 'none' : 'default';
    };

    // Function to handle hover effect
    const handleHoverEffect = (event) => {
        if (event.target && typeof event.target.closest === 'function') {
            if (event.target.closest('.flex, .work-item, .footer-social li, nav, #email-btn, .video-control')) {
                gsap.to(cursor, {
                    width: 16,
                    height: 16,
                    backgroundColor: 'rgba(105, 105, 105, 0.2)',
                    backdropFilter: 'blur(8px)',
                    duration: 0.15,
                    ease: 'power3.inOut'
                });
            } else if (event.target.closest('p.primary, #work-description, h1, h2, h3')) {
                gsap.to(cursor, {
                    width: 4,
                    height: 28,
                    borderRadius: '2px',
                    backgroundColor: 'rgba(62, 128, 255, 1)',
                    duration: 0.15,
                    ease: 'power3.inOut'
                });
            }
        }
    };

    const handleHoverOutEffect = (event) => {
        if (event.target && typeof event.target.closest === 'function') {
            if (!event.relatedTarget || !event.relatedTarget.closest('.flex, .work-item, #work-description, .footer-social li, nav, #email-btn, p.primary, .video-control, h1, h2, h3')) {
                gsap.to(cursor, {
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(180, 180, 180, 0.4)',
                    backdropFilter: 'blur(8px)',
                    duration: 0.15,
                    ease: 'power3.inOut'
                });
            }
        }
    };

    // Handle mouse move and scroll
    const handleMouseMove = (e) => {
        lastMouseEvent = e;
        updateCursorPosition(e);
    };

    const handleScroll = debounce(() => {
        if (lastMouseEvent) {
            updateCursorPosition(lastMouseEvent);
        }
    }, 100);

    // Event delegation for hover effect
    document.addEventListener('mouseenter', handleHoverEffect, true);
    document.addEventListener('mouseleave', handleHoverOutEffect, true);

    // Mouse events to maintain cursor visibility
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', () => setCursorVisibility(true));
    document.addEventListener('mouseup', () => setCursorVisibility(true));
    document.addEventListener('focusin', () => setCursorVisibility(true));
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
            setCursorVisibility(false);
        }
    });
    document.addEventListener('mouseover', () => setCursorVisibility(true));

    // Hide the default cursor
    document.body.style.cursor = 'none';
});

// Portfolio hover effect
const initializeHoverEffects = () => {
    const names = document.querySelectorAll('.work-item');
    const hoverImage = document.getElementById('work-image');
    const hoverTitle = document.getElementById('work-title');
    const hoverDescription = document.getElementById('work-description');

    let initialLoad = true; // Flag to check if it's the first load

    const updateSelected = (element) => {
        document.querySelector('.work-item.selected')?.classList.remove('selected');
        element.classList.add('selected');
    };

    const updateHoverElements = (element) => {
        const imageUrl = element.getAttribute('data-image');
        const srcset = element.getAttribute('data-srcset'); // Get the srcset
        const sizes = element.getAttribute('data-sizes'); // Get the sizes
        const titleText = element.getAttribute('data-title');
        const descriptionText = element.getAttribute('data-description');
        const altText = element.getAttribute('data-alt'); // Get the alt text

        gsap.killTweensOf(hoverImage); // Kill any ongoing animations
        hoverImage.src = imageUrl;
        hoverImage.srcset = srcset; // Set the srcset attribute
        hoverImage.sizes = sizes; // Set the sizes attribute
        hoverImage.alt = altText; // Set the alt attribute
        hoverTitle.textContent = titleText;
        hoverDescription.textContent = descriptionText;

        if (!initialLoad) {
            // Apply only the scale effect
            gsap.fromTo(hoverImage, 
                { scale: 0.92 },
                { scale: 1, duration: 0.8, ease: 'power3.out' }
            );
        } else {
            initialLoad = false; // Set the flag to false after the first load
        }
    };

    names.forEach((name, index) => {
        name.addEventListener('mouseenter', () => {
            if (name.classList.contains('selected')) {
                return; // Do nothing if the item is already selected
            }

            updateHoverElements(name);
            updateSelected(name);
        });
    });

    // Initialize first item as selected without animation
    const firstItem = document.querySelector('.work-item');
    if (firstItem) {
        updateHoverElements(firstItem);
        updateSelected(firstItem);
        initialLoad = false;
    }
};

// Call the function to initialize hover effects
initializeHoverEffects();