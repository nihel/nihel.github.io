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

    const resetVideo = (videoElement) => {
        if (!videoElement.paused) {
            videoElement.pause();
        }
        videoElement.currentTime = 0;

        const sources = videoElement.querySelectorAll('source');
        sources.forEach(source => videoElement.removeChild(source));
        sources.forEach(source => videoElement.appendChild(source));
        videoElement.load();
    };

    if (!isTouchScreen) {
        hoverVideoElements.forEach(videoElement => {
            videoElement.muted = true; // Ensure video is muted to comply with autoplay policies

            videoElement.addEventListener('mouseenter', () => {
                if (videoElement.paused) {
                    videoElement.play().catch(error => {
                        console.error('Autoplay error:', error);
                    });
                }
            });

            videoElement.addEventListener('mouseleave', () => resetVideo(videoElement));
            videoElement.addEventListener('ended', () => resetVideo(videoElement));
            videoElement.addEventListener('loadeddata', () => {
                if (videoElement.readyState >= 3) {
                    videoElement.style.backgroundImage = 'none';
                }
            });
        });
    } else {
        let currentlyPlayingVideo = null;

        const playVideoInTopThird = () => {
            const viewportHeight = window.innerHeight;
            const topThird = viewportHeight / 3;
            let videoToPlay = null;
            let maxVisibleArea = 0;

            hoverVideoElements.forEach(videoElement => {
                const rect = videoElement.getBoundingClientRect();
                const visibleArea = Math.max(0, Math.min(rect.bottom, topThird) - Math.max(rect.top, 0));
                
                if (visibleArea > maxVisibleArea) {
                    maxVisibleArea = visibleArea;
                    videoToPlay = videoElement;
                }
            });

            if (videoToPlay !== currentlyPlayingVideo) {
                if (currentlyPlayingVideo) {
                    resetVideo(currentlyPlayingVideo);
                }

                if (videoToPlay) {
                    videoToPlay.play().catch(error => {
                        console.error('Autoplay error:', error);
                    });
                }

                currentlyPlayingVideo = videoToPlay;
            }
        };

        document.addEventListener('scroll', debounce(playVideoInTopThird, 100));
        window.addEventListener('resize', debounce(playVideoInTopThird, 100));

        hoverVideoElements.forEach(videoElement => {
            videoElement.muted = true; // Ensure video is muted to comply with autoplay policies

            videoElement.addEventListener('click', () => {
                if (videoElement.paused) {
                    if (currentlyPlayingVideo && currentlyPlayingVideo !== videoElement) {
                        resetVideo(currentlyPlayingVideo);
                    }
                    videoElement.play().catch(error => {
                        console.error('Autoplay error:', error);
                    });
                    currentlyPlayingVideo = videoElement;
                } else {
                    resetVideo(videoElement);
                    currentlyPlayingVideo = null;
                }
            });

            videoElement.addEventListener('ended', () => {
                resetVideo(videoElement);
                currentlyPlayingVideo = null;
            });

            videoElement.addEventListener('loadeddata', () => {
                if (videoElement.readyState >= 3) {
                    videoElement.style.backgroundImage = 'none';
                }
            });
        });

        // Initial check
        playVideoInTopThird();
    }
};

document.addEventListener('DOMContentLoaded', initializePortfolioVideoHover);

// Auto play video on main screen
const initializeVideoControls = () => {
    const video = document.querySelector('#scroll-video');
    const videoControl = document.querySelector('.video-control');

    if (video) {
        // Create an intersection observer to monitor when the video is in the viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }, { threshold: [0.5] }); // Trigger when at least 50% of the video is visible

        // Start observing the video element
        observer.observe(video);

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