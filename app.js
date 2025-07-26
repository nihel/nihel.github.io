// Sidedrawer state
let sidedrawer = null;

// Mobile detection
function isMobile() {
    return window.innerWidth <= 549;
}

// Animation constants
const WRAPPER_OPEN = {
    scale: 0.9, rotationY: 0, x: -64,
    transformOrigin: "left center", transformPerspective: 1000,
    duration: 0.5, ease: "power3.out"
};
const WRAPPER_CLOSE = {
    scale: 1, rotationY: 0, x: 0,
    transformOrigin: "center center", transformPerspective: 1000,
    duration: 0.65, ease: "power2.out"
};

// Mobile animation constants
const WRAPPER_MOBILE_OPEN = {
    scale: 0.85, y: "-10vh",
    transformOrigin: "center top",
    duration: 0.5, ease: "power3.out"
};
const WRAPPER_MOBILE_CLOSE = {
    scale: 1, y: 0,
    transformOrigin: "center center",
    duration: 0.65, ease: "power2.out"
};

// Utility functions
function getWrapper() {
    return document.getElementById('wrapper');
}

function setWrapperInteraction(enabled) {
    const wrapper = getWrapper();
    if (wrapper) {
        wrapper.style.pointerEvents = enabled ? 'auto' : 'none';
        wrapper.style.userSelect = enabled ? 'auto' : 'none';
        
        // Handle mobile class for CSS-based styling
        if (isMobile()) {
            if (enabled) {
                wrapper.classList.remove('mobile-drawer-open');
            } else {
                wrapper.classList.add('mobile-drawer-open');
            }
        }
    }
}

function loadMainContentAsync() {
    return fetch('pages/intro.html')
        .then(res => res.ok ? res.text() : "<p>Not found.</p>")
        .then(html => {
            getWrapper().innerHTML = html;
            if (typeof initialize === 'function') initialize();
        });
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Show main content
function loadMainContent() {
    loadMainContentAsync();
}

// Create and show sidedrawer with portfolio content
function openSidedrawer(item) {
    closeSidedrawer(); // Remove any existing drawer

    const mobile = isMobile();
    
    // Kill any existing wrapper animations and clear transforms to ensure clean state
    const wrapper = getWrapper();
    gsap.killTweensOf(wrapper);
    gsap.set(wrapper, { 
        clearProps: "transform,scale,x,y,rotationY,transformOrigin,transformPerspective" 
    });
    
    // Animate wrapper with appropriate effect for mobile/desktop and disable interactions
    setWrapperInteraction(false);
    if (mobile) {
        gsap.to(wrapper, WRAPPER_MOBILE_OPEN);
    } else {
        gsap.to(wrapper, WRAPPER_OPEN);
    }

    sidedrawer = document.createElement('div');
    sidedrawer.className = 'sidedrawer';
    sidedrawer.innerHTML = `<div class="drawer-content" style="opacity: 0;">Loading...</div>`;
    document.body.appendChild(sidedrawer);

    // Prevent scroll propagation to body
    sidedrawer.addEventListener('wheel', function(e) {
        const atTop = sidedrawer.scrollTop === 0;
        const atBottom = sidedrawer.scrollHeight - sidedrawer.scrollTop === sidedrawer.clientHeight;
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
            e.preventDefault();
        }
    }, { passive: false });

    sidedrawer.addEventListener('touchmove', function(e) {
        e.stopPropagation();
    }, { passive: false });

    // Add mobile drag-to-close functionality
    if (mobile) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let initialDrawerY = 0;

        const handleTouchStart = (e) => {
            startY = e.touches[0].clientY;
            currentY = startY;
            isDragging = false;
            initialDrawerY = 0;
        };

        const handleTouchMove = (e) => {
            if (!startY) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            // Only allow dragging down and only if we're at the top of the drawer
            if (deltaY > 0 && sidedrawer.scrollTop === 0) {
                isDragging = true;
                e.preventDefault();
                
                // Apply smoother drag resistance with exponential easing
                const maxDrag = 300;
                const resistance = maxDrag * (1 - Math.exp(-deltaY / 100));
                sidedrawer.style.transform = `translateY(${resistance}px)`;
                
                // Remove the opacity fade effect - keep drawer fully opaque during drag
                // const opacity = Math.max(1 - (resistance / 200), 0.3);
                // sidedrawer.style.opacity = opacity;
            }
        };

        const handleTouchEnd = (e) => {
            if (!isDragging) {
                startY = 0;
                return;
            }
            
            const deltaY = currentY - startY;
            const velocity = Math.abs(deltaY) / 16; // Approximate velocity based on distance
            const threshold = 80; // Lower threshold for easier closing
            
            // Consider both distance and velocity for closing decision
            const shouldClose = deltaY > threshold || velocity > 3;
            
            if (shouldClose) {
                // Close the drawer with smooth animation
                gsap.to(sidedrawer, {
                    y: '100%',
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        closeSidedrawer({ updateUrl: true });
                        removeEventListeners();
                    }
                });
            } else {
                // Snap back to original position with smoother easing
                gsap.to(sidedrawer, {
                    y: 0,
                    duration: 0.4,
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        sidedrawer.style.transform = '';
                    }
                });
            }
            
            startY = 0;
            isDragging = false;
        };

        sidedrawer.addEventListener('touchstart', handleTouchStart, { passive: true });
        sidedrawer.addEventListener('touchmove', handleTouchMove, { passive: false });
        sidedrawer.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Store cleanup functions for drag handlers
        sidedrawer._cleanupDragHandlers = () => {
            sidedrawer.removeEventListener('touchstart', handleTouchStart);
            sidedrawer.removeEventListener('touchmove', handleTouchMove);
            sidedrawer.removeEventListener('touchend', handleTouchEnd);
        };
    }

    // Load portfolio content from /pages/
    fetch(`pages/${item}.html`)
        .then(res => res.ok ? res.text() : "<p>Not found.</p>")
        .then(html => {
            sidedrawer.querySelector('.drawer-content').innerHTML = html;
            
            // Show the content now that it's loaded
            sidedrawer.querySelector('.drawer-content').style.opacity = '1';
            
            // Check for custom background color
            const drawerContent = sidedrawer.querySelector('.drawer-content');
            const colorElement = drawerContent.querySelector('[data-bg-color]');
            
            if (colorElement) {
                const customColor = colorElement.getAttribute('data-bg-color');
                sidedrawer.style.background = customColor;
            }
            
            // Animate images and videos in drawer-content with GSAP fade-in sequence
            const media = sidedrawer.querySelectorAll('.drawer-content img, .drawer-content video');
            if (media.length > 0) {
                gsap.set(media, { opacity: 0, y: 32 });
                gsap.to(media, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.24,
                    delay: 0.2,
                    ease: 'power3.out'
                });
                
                // Set up video autoplay on viewport entry
                setupVideoAutoplay(sidedrawer);
            }
        });

    // Close on ESC key
    document.addEventListener('keydown', escHandler);

    // Close on click outside drawer
    document.addEventListener('click', outsideClickHandler);

    // Close on scroll attempt on main page
    document.addEventListener('wheel', scrollHandler, { passive: false });

    // Animate drawer entry: from bottom on mobile, from right on desktop
    if (mobile) {
        gsap.fromTo(sidedrawer, { y: '100%' }, { y: '0%', duration: 0.5, ease: "power2.out" });
    } else {
        gsap.fromTo(sidedrawer, { x: '100%' }, { x: '0%', duration: 0.5, ease: "power2.out" });
    }

    function removeEventListeners() {
        document.removeEventListener('keydown', escHandler);
        document.removeEventListener('click', outsideClickHandler);
        document.removeEventListener('wheel', scrollHandler);
    }

    function escHandler(e) {
        if (e.key === "Escape") {
            closeSidedrawer({ updateUrl: true });
            removeEventListeners();
        }
    }

    function outsideClickHandler(e) {
        if (!sidedrawer.contains(e.target)) {
            closeSidedrawer({ updateUrl: true });
            removeEventListeners();
        }
    }

    function scrollHandler(e) {
        if (!sidedrawer.contains(e.target)) {
            e.preventDefault();
            closeSidedrawer({ updateUrl: true });
            removeEventListeners();
        }
    }
}

// Remove sidedrawer
function closeSidedrawer({ navigate = false, updateUrl = false } = {}) {
    if (sidedrawer) {
        const mobile = isMobile();
        
        // Re-enable interactions and start wrapper animation immediately
        setWrapperInteraction(true);
        
        // Kill any existing wrapper animations to prevent conflicts
        gsap.killTweensOf(getWrapper());
        
        if (mobile) {
            gsap.to(getWrapper(), WRAPPER_MOBILE_CLOSE);
        } else {
            gsap.to(getWrapper(), WRAPPER_CLOSE);
        }

        // Animate drawer exit: to bottom on mobile, to right on desktop
        const exitAnimation = mobile 
            ? { y: '100%', duration: 0.5, ease: "power2.out" }
            : { x: '100%', duration: 0.5, ease: "power2.out" };

        gsap.to(sidedrawer, { 
            ...exitAnimation,
            onComplete: () => {
                // Clean up video observer
                if (sidedrawer._videoObserver) {
                    sidedrawer._videoObserver.disconnect();
                }
                
                // Clean up drag handlers (mobile)
                if (sidedrawer._cleanupDragHandlers) {
                    sidedrawer._cleanupDragHandlers();
                }
                
                // Reset background color
                sidedrawer.style.background = '';
                
                // Clear all transforms on wrapper to ensure clean state
                const wrapper = getWrapper();
                gsap.set(wrapper, { 
                    clearProps: "transform,scale,x,y,rotationY,transformOrigin,transformPerspective" 
                });
                wrapper.classList.remove('mobile-drawer-open');
                
                sidedrawer.remove();
                sidedrawer = null;
                if (navigate) loadMainContent();
                if (updateUrl) page.redirect('/');
            }
        });
    } else {
        // Re-enable interactions if they were disabled
        setWrapperInteraction(true);
        if (navigate) loadMainContent();
        if (updateUrl) page.redirect('/');
    }
}

// Portfolio routes
page('/', () => {
    // Only close drawer and navigate if there's actually a drawer open
    if (sidedrawer) {
        closeSidedrawer({ navigate: true, updateUrl: false });
    } else {
        // Just load main content if no drawer is open
        loadMainContent();
    }
});
page('/portfolio/:item', ctx => {
    // Always load main content first if not already loaded
    const wrapper = getWrapper();
    
    if (!wrapper || !wrapper.innerHTML.trim()) {
        // Load main content and wait for it to complete
        loadMainContentAsync()
            .then(() => openSidedrawer(ctx.params.item))
            .catch(() => page.redirect('/'));
    } else {
        openSidedrawer(ctx.params.item);
    }
});

// Intercept portfolio link clicks
document.addEventListener('click', e => {
    const link = e.target.closest('a.item');
    if (link && link.getAttribute('href').startsWith('/portfolio/')) {
        e.preventDefault();
        page(link.getAttribute('href'));
    }
});

// Initialize router after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    page();
});

// Fallback if DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already ready
    page();
}

// Handle window resize and orientation changes
window.addEventListener('resize', () => {
    // If drawer is open and we switch between mobile/desktop, adjust accordingly
    if (sidedrawer) {
        const wrapper = getWrapper();
        const mobile = isMobile();
        
        // Kill any existing animations to prevent conflicts
        gsap.killTweensOf(wrapper);
        
        // Update wrapper class and styling based on current viewport
        if (mobile) {
            wrapper.classList.add('mobile-drawer-open');
            // Clear desktop transforms and apply mobile transforms
            gsap.set(wrapper, { 
                rotationY: 0, 
                x: 0, 
                transformPerspective: 0,
                clearProps: "rotationY,x,transformPerspective"
            });
            gsap.set(wrapper, WRAPPER_MOBILE_OPEN);
        } else {
            wrapper.classList.remove('mobile-drawer-open');
            // Clear mobile transforms and apply desktop transforms
            gsap.set(wrapper, { 
                y: 0,
                clearProps: "y"
            });
            gsap.set(wrapper, WRAPPER_OPEN);
        }
    }
});

// Setup video autoplay functionality
function setupVideoAutoplay(container) {
    const videos = container.querySelectorAll('video');
    
    if (videos.length === 0) return;
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // Video is in viewport, play it after 1 second delay
                setTimeout(() => {
                    // Check if video is still in viewport before playing
                    if (entry.isIntersecting) {
                        video.play().catch(e => {
                            // Handle autoplay policy restrictions
                            console.log('Autoplay prevented:', e);
                        });
                    }
                }, 1000);
            } else {
                // Video is out of viewport, pause it immediately
                video.pause();
            }
        });
    }, {
        root: container, // Use the drawer as the root
        threshold: 0.5   // Play when 50% of video is visible
    });
    
    // Observe all videos
    videos.forEach(video => {
        // Set video attributes for better autoplay behavior
        video.muted = true;  // Required for autoplay in most browsers
        video.loop = video.hasAttribute('data-loop');  // Loop only if data-loop attribute is present
        video.playsInline = true; // Prevent fullscreen on mobile
        video.controls = false; // Hide player controls
        
        observer.observe(video);
    });
    
    // Store observer reference for cleanup
    container._videoObserver = observer;
}