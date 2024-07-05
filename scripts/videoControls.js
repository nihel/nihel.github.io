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


document.addEventListener('DOMContentLoaded', function() {
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
        if (event.target.closest('.card, nav, #email-btn')) {
            gsap.to(cursor, {
                width: 16,
                height: 16,
                backgroundColor: 'rgba(105, 105, 105, 0.2)',
                duration: 0.15,
                ease: 'power3.inOut'
            });
        }
    }

    function handleHoverOutEffect(event) {
        if (event.target.closest('.card, nav, #email-btn')) {
            gsap.to(cursor, {
                width: 28,
                height: 28,
                backgroundColor: 'rgba(105, 105, 105, 0.4)',
                duration: 0.15,
                ease: 'power3.inOut'
            });
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