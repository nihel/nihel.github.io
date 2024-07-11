// Video Control
function initializeVideoControls() {
    const playAfterThisHeight = 200;
    const video = document.querySelector('video');
    const videoControl = document.querySelector('.video-control');

    if (video && videoControl) {
        const handleScroll = () => {
            if (document.documentElement.scrollTop > playAfterThisHeight) {
                video.play();
            } else {
                video.pause();
            }
        };

        document.addEventListener('scroll', handleScroll);

        video.muted = true;
        video.volume = 0.4;

        videoControl.addEventListener('click', () => {
            video.muted = !video.muted;
            videoControl.classList.toggle('mute');
            videoControl.classList.toggle('unmute');
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeVideoControls);


// Custom Cursor
document.addEventListener('DOMContentLoaded', function() {
    // Check if the device supports touch
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return; // Exit the script if the device supports touch
    }

    const cursor = document.querySelector('.custom-cursor');

    // Function to update cursor position
    function updateCursorPosition(e) {
        gsap.to(cursor, {
            duration: 0.15,
            x: e.clientX,
            y: e.clientY,
            ease: 'power3.out'
        });
    }

    // Update cursor position on mouse move
    document.addEventListener('mousemove', updateCursorPosition);

    // Variable to store last mouse event
    let lastMouseEvent;

    // Save mouse event on mouse move
    document.addEventListener('mousemove', function(e) {
        lastMouseEvent = e;
    });

    // Update cursor position on scroll
    window.addEventListener('scroll', function() {
        if (lastMouseEvent) {
            updateCursorPosition(lastMouseEvent);
        }
    });

    // Function to handle hover effect
    function handleHoverEffect(event) {
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
    }

    function handleHoverOutEffect(event) {
        if (event.target && typeof event.target.closest === 'function') {
            if (!event.relatedTarget || !event.relatedTarget.closest('.flex, .work-item, #work-description, .footer-social li, nav, #email-btn, p.primary, .video-control, h1, h2, h3')) {
                gsap.to(cursor, {
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(105, 105, 105, 0.4)',
                    backdropFilter: 'blur(0px)',
                    duration: 0.15,
                    ease: 'power3.inOut'
                });
            }
        }
    }

    // Event delegation for hover effect
    document.addEventListener('mouseenter', handleHoverEffect, true);
    document.addEventListener('mouseleave', handleHoverOutEffect, true);

    // Hide cursor when mouse leaves the page
    document.addEventListener('mouseleave', function() {
        cursor.style.visibility = 'hidden';
    });

    // Show cursor when mouse enters the page
    document.addEventListener('mouseenter', function() {
        cursor.style.visibility = 'visible';
    });
});

// Portfolio hover effect
const initializeHoverEffects = () => {
    const names = document.querySelectorAll('.work-item');
    const hoverImage = document.getElementById('work-image');
    const hoverTitle = document.getElementById('work-title');
    const hoverDescription = document.getElementById('work-description');

    let lastIndex = -1; // Track the last hovered item index
    let initialLoad = true; // Flag to check if it's the first load

    const updateSelected = (element) => {
        document.querySelector('.work-item.selected')?.classList.remove('selected');
        element.classList.add('selected');
    };

    names.forEach((name, index) => {
        name.addEventListener('mouseenter', () => {
            if (name.classList.contains('selected')) {
                return; // Do nothing if the item is already selected
            }

            const imageUrl = name.getAttribute('data-image');
            const titleText = name.getAttribute('data-title');
            const descriptionText = name.getAttribute('data-description');
            const altText = name.getAttribute('data-alt'); // Get the alt text

            gsap.killTweensOf(hoverImage); // Kill any ongoing animations
            hoverImage.src = imageUrl;
            hoverImage.alt = altText; // Set the alt attribute
            hoverTitle.textContent = titleText;
            hoverDescription.textContent = descriptionText;

            if (!initialLoad) {
                // Determine the direction of the hover
                const direction = index > lastIndex ? 10 : -10;
                gsap.fromTo(hoverImage, 
                    { opacity: 0, y: direction },
                    { opacity: 1, y: 0, duration: 0.4, ease: 'power1.inOut' }
                );
            } else {
                initialLoad = false; // Set the flag to false after the first load
                gsap.fromTo(hoverImage, 
                    { opacity: 0, y: 0 },
                    { opacity: 1, y: 0, duration: 0.4, ease: 'power1.inOut' }
                );
            }

            updateSelected(name);
            lastIndex = index;
        });
    });

    // Initialize first item as selected
    const firstItem = document.querySelector('.work-item');
    if (firstItem) {
        firstItem.dispatchEvent(new Event('mouseenter'));
    }
};