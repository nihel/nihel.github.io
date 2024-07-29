// Debounce function to limit the rate of function execution
const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
};


// Portfolio play video on hover
function initializePortfolioVideoHover() {
    const hoverVideoElements = document.querySelectorAll('.portfolio-video'); // Select all video elements with the class 'portfolio-video'

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const showPoster = (videoElement) => {
        // Temporarily remove the source elements to force the video to reload and show the poster
        const sources = videoElement.querySelectorAll('source');
        sources.forEach(source => videoElement.removeChild(source));

        // Re-add the source elements
        sources.forEach(source => videoElement.appendChild(source));

        // Load the video again
        videoElement.load();
    };

    if (isTouchDevice) {
        // Use Intersection Observer to autoplay videos when they are in the viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play().catch(error => {
                        // Handle play error, typically due to autoplay policy
                    });
                } else {
                    entry.target.pause();
                    entry.target.currentTime = 0; // Reset the video to the beginning
                }
            });
        }, { threshold: 0.5 }); // Adjust threshold as needed

        hoverVideoElements.forEach(videoElement => {
            videoElement.muted = true; // Ensure video is muted to comply with autoplay policies
            videoElement.removeAttribute('controls'); // Ensure controls are not shown

            videoElement.addEventListener('ended', () => {
                // Show the poster after the video ends
                showPoster(videoElement);
            });

            videoElement.addEventListener('click', () => {
                if (videoElement.currentTime === 0 || videoElement.paused) {
                    videoElement.play().catch(error => {
                        // Handle play error, typically due to autoplay policy
                    });
                }
            });

            observer.observe(videoElement); // Observe each video element
        });

    } else {
        // Handle hover effects for non-touch devices
        hoverVideoElements.forEach(videoElement => {
            videoElement.muted = true; // Ensure video is muted to comply with autoplay policies
            videoElement.removeAttribute('controls'); // Ensure controls are not shown

            videoElement.addEventListener('mouseenter', () => {
                videoElement.play().catch(error => {
                    // Handle play error, typically due to autoplay policy
                });
            });

            const resetVideo = () => {
                videoElement.pause();
                videoElement.currentTime = 0; // Reset the video to the beginning
                showPoster(videoElement); // Show the poster
            };

            videoElement.addEventListener('mouseleave', resetVideo);
            videoElement.addEventListener('ended', resetVideo);

            videoElement.addEventListener('loadeddata', () => {
                if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA or more
                    videoElement.style.backgroundImage = 'none'; // Remove the poster image
                }
            });
        });
    }
}

// Call the function to initialize hover effects on initial page load
document.addEventListener('DOMContentLoaded', initializePortfolioVideoHover);

// Auto play video on main screen
function initializeVideoControls() {
    const playAfterThisHeight = 200;
    const video = document.querySelector('#scroll-video');
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
            transform: 'translate(-50%, -50%)',
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
            if (event.target.closest('.portfolio-video')) {
                cursor.style.backgroundImage = "url('../images/assets/play-icon.svg')";
                gsap.to(cursor, {
                    width: 28,
                    height: 28,
                    backgroundColor: 'transparent',
                    duration: 0.15,
                    ease: 'power3.inOut'
                });
            } else if (event.target.closest('.card, .work-item, .footer-social li, nav, #email-btn, .video-control')) {
                cursor.style.backgroundImage = 'none';
                gsap.to(cursor, {
                    width: 16,
                    height: 16,
                    backgroundColor: 'rgba(105, 105, 105, 0.2)',
                    backdropFilter: 'blur(8px)',
                    duration: 0.15,
                    ease: 'power3.inOut'
                });
            } else if (event.target.closest('p.primary, #work-description, h1, h2, h3')) {
                cursor.style.backgroundImage = 'none';
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

    // Function to handle hover out effect
    const handleHoverOutEffect = (event) => {
        if (event.target && typeof event.target.closest === 'function') {
            if (!event.relatedTarget || !event.relatedTarget.closest('.card, .work-item, #work-description, .footer-social li, nav, #email-btn, p.primary, .video-control, h1, h2, h3, .portfolio-video')) {
                cursor.style.backgroundImage = 'none';
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

// Portfolio change image on hover
const initializeHoverEffects = () => {
    // Check if the device is a touch screen
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // If it's a touch device, hide the hover image container and exit the function
    if (isTouchDevice) {
        const hoverImageContainer = document.querySelector('.work-placeholder');
        if (hoverImageContainer) {
            hoverImageContainer.style.display = 'none';
        }
        return; // Exit the function early for touch devices
    }

    const names = document.querySelectorAll('.work-item');
    const hoverImage = document.getElementById('work-image');

    let initialLoad = true; // Flag to check if it's the first load

    const updateSelected = (element) => {
        const selectedElement = document.querySelector('.work-item.selected');
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }
        element.classList.add('selected');
        localStorage.setItem('selectedWorkItem', element.getAttribute('data-link')); // Save the selected work item
    };

    const updateHoverElements = (element) => {
        const imageUrl = element.getAttribute('data-image');
        const srcset = element.getAttribute('data-srcset'); // Get the srcset
        const sizes = element.getAttribute('data-sizes'); // Get the sizes
        const altText = element.getAttribute('data-alt'); // Get the alt text

        gsap.killTweensOf(hoverImage); // Kill any ongoing animations
        hoverImage.src = imageUrl;
        hoverImage.srcset = srcset; // Set the srcset attribute
        hoverImage.sizes = sizes; // Set the sizes attribute
        hoverImage.alt = altText; // Set the alt attribute

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

    names.forEach((name) => {
        name.addEventListener('mouseenter', () => {
            if (name.classList.contains('selected')) {
                return; // Do nothing if the item is already selected
            }

            updateHoverElements(name);
            updateSelected(name);
        });
    });

    // Initialize first item as selected without animation if no item is stored
    const selectedWorkItem = localStorage.getItem('selectedWorkItem');
    const firstItem = selectedWorkItem ? document.querySelector(`.work-item[data-link="${selectedWorkItem}"]`) : document.querySelector('.work-item');
    if (firstItem) {
        updateHoverElements(firstItem);
        updateSelected(firstItem);
        initialLoad = false;
    }
};

// Call the function to initialize hover effects
initializeHoverEffects();