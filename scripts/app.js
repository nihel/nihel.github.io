// Debounce function to limit the rate of function execution
const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
};

// Portfolio play video on hover
const initializePortfolioVideoHover = () => {
    const hoverVideoElements = document.querySelectorAll('.portfolio-video');
    const isTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    hoverVideoElements.forEach(videoElement => {
        videoElement.muted = true; // Ensure video is muted to comply with autoplay policies

        const resetVideo = () => {
            videoElement.pause();
            videoElement.currentTime = 0;

            const sources = videoElement.querySelectorAll('source');
            sources.forEach(source => videoElement.removeChild(source));
            sources.forEach(source => videoElement.appendChild(source));
            videoElement.load();
        };

        if (!isTouchScreen) {
            videoElement.addEventListener('mouseenter', () => {
                videoElement.play().catch(error => {
                    console.error('Autoplay error:', error);
                });
            });

            videoElement.addEventListener('mouseleave', resetVideo);
            videoElement.addEventListener('ended', resetVideo);
            videoElement.addEventListener('loadeddata', () => {
                if (videoElement.readyState >= 3) {
                    videoElement.style.backgroundImage = 'none';
                }
            });
        } else {
            const playOrResetVideoOnClick = () => {
                if (videoElement.paused) {
                    videoElement.play();
                } else {
                    resetVideo();
                }
            };

            videoElement.addEventListener('click', playOrResetVideoOnClick);
            videoElement.addEventListener('ended', resetVideo);
            videoElement.addEventListener('loadeddata', () => {
                if (videoElement.readyState >= 3) {
                    videoElement.style.backgroundImage = 'none';
                }
            });
        }
    });
};

document.addEventListener('DOMContentLoaded', initializePortfolioVideoHover);

// Auto play video on main screen
const initializeVideoControls = () => {
    const playAfterThisHeight = 200;
    const video = document.querySelector('#scroll-video');
    const videoControl = document.querySelector('.video-control');

    if (video) {
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

        video.load();
    }
};

document.addEventListener('DOMContentLoaded', initializeVideoControls);

// Custom Cursor
document.addEventListener('DOMContentLoaded', () => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return; // Exit the script if the device supports touch
    }

    const cursor = document.querySelector('.custom-cursor');
    let lastMouseEvent;

    const updateCursorPosition = (e) => {
        gsap.to(cursor, {
            duration: 0.15,
            x: e.clientX,
            y: e.clientY,
            transform: 'translate(-50%, -50%)',
            ease: 'power3.out'
        });
    };

    const setCursorVisibility = (visible) => {
        cursor.style.opacity = visible ? '1' : '0';
        document.body.style.cursor = visible ? 'none' : 'default';
    };

    const handleHoverEffect = (event) => {
        if (event.target.nodeType === 1) { // Ensure the target is an element
            const target = event.target.closest('.portfolio-video, .card, .work-item, .footer-social li, nav, #email-btn, .video-control, p.primary, p.secondary, h1, h2, h3');
            if (target) {
                if (target.classList.contains('portfolio-video')) {
                    cursor.style.backgroundImage = "url('../images/assets/play-icon.svg')";
                    gsap.to(cursor, {
                        width: 28,
                        height: 28,
                        backgroundColor: 'transparent',
                        duration: 0.15,
                        ease: 'power3.inOut'
                    });
                } else if (target.matches('.card, .work-item, .footer-social li, nav, #email-btn, .video-control')) {
                    cursor.style.backgroundImage = 'none';
                    gsap.to(cursor, {
                        width: 16,
                        height: 16,
                        backgroundColor: 'rgba(105, 105, 105, 0.2)',
                        backdropFilter: 'blur(8px)',
                        duration: 0.15,
                        ease: 'power3.inOut'
                    });
                } else if (target.matches('p.primary, p.secondary, h1, h2, h3')) {
                    // Check if the target is part of a link
                    if (!target.closest('a')) {
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
            }
        }
    };

    const handleHoverOutEffect = (event) => {
        if (event.target.nodeType === 1) { // Ensure the target is an element
            const target = event.target.closest('.portfolio-video, .card, .work-item, .footer-social li, nav, #email-btn, .video-control, p.primary, p.secondary, h1, h2, h3');
            if (target) {
                if (!event.relatedTarget || (event.relatedTarget.nodeType === 1 && !event.relatedTarget.closest('.portfolio-video, .card, .work-item, .footer-social li, nav, #email-btn, .video-control, p.primary, p.secondary, h1, h2, h3'))) {
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
        }
    };

    const handleMouseMove = (e) => {
        lastMouseEvent = e;
        updateCursorPosition(e);
    };

    const handleScroll = debounce(() => {
        if (lastMouseEvent) {
            updateCursorPosition(lastMouseEvent);
        }
    }, 100);

    document.addEventListener('mouseenter', handleHoverEffect, true);
    document.addEventListener('mouseleave', handleHoverOutEffect, true);
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

    document.body.style.cursor = 'none';
});

// Portfolio change image on hover
const initializeHoverEffects = () => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        const hoverImageContainer = document.querySelector('.work-placeholder');
        if (hoverImageContainer) {
            hoverImageContainer.style.display = 'none';
        }
        return;
    }

    const names = document.querySelectorAll('.work-item');
    const hoverImage = document.getElementById('work-image');
    let initialLoad = true;

    const updateSelected = (element) => {
        const selectedElement = document.querySelector('.work-item.selected');
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }
        element.classList.add('selected');
        localStorage.setItem('selectedWorkItem', element.getAttribute('data-link'));
    };

    const updateHoverElements = (element) => {
        const imageUrl = element.getAttribute('data-image');
        const srcset = element.getAttribute('data-srcset');
        const sizes = element.getAttribute('data-sizes');
        const altText = element.getAttribute('data-alt');

        gsap.killTweensOf(hoverImage);
        hoverImage.src = imageUrl;
        hoverImage.srcset = srcset;
        hoverImage.sizes = sizes;
        hoverImage.alt = altText;

        if (!initialLoad) {
            gsap.fromTo(hoverImage, 
                { scale: 0.92 },
                { scale: 1, duration: 0.8, ease: 'power3.out' }
            );
        } else {
            initialLoad = false;
        }
    };

    names.forEach((name) => {
        name.addEventListener('mouseenter', () => {
            if (!name.classList.contains('selected')) {
                updateHoverElements(name);
                updateSelected(name);
            }
        });
    });

    // Initialize the first item as selected without animation if no item is stored
    const selectedWorkItem = localStorage.getItem('selectedWorkItem');
    const firstItem = selectedWorkItem ? document.querySelector(`.work-item[data-link="${selectedWorkItem}"]`) : document.querySelector('.work-item');
    if (firstItem) {
        updateHoverElements(firstItem);
        updateSelected(firstItem);
        initialLoad = false;
    }
};

// Call the function to initialize hover effects
document.addEventListener('DOMContentLoaded', initializeHoverEffects);