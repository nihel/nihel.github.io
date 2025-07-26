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
                
                // Apply drag resistance (slower movement as user drags further)
                const resistance = Math.min(deltaY * 0.6, 200);
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
            const threshold = 100; // Close if dragged more than 100px
            
            if (deltaY > threshold) {
                // Close the drawer
                closeSidedrawer({ updateUrl: true });
                removeEventListeners();
            } else {
                // Snap back to original position
                gsap.to(sidedrawer, {
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out",
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
                // First, ensure videos are properly set up before animation
                const videos = sidedrawer.querySelectorAll('.drawer-content video');
                videos.forEach(video => {
                    // Set essential attributes immediately
                    video.muted = true;
                    video.playsInline = true;
                    video.controls = false;
                    video.preload = 'metadata';
                    video.loop = video.hasAttribute('data-loop');
                    
                    // Force video to load
                    video.load();
                });
                
                gsap.set(media, { opacity: 0, y: 32 });
                gsap.to(media, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.24,
                    delay: 0.2,
                    ease: 'power3.out',
                    onComplete: () => {
                        // Set up video autoplay after animation completes
                        setupVideoAutoplay(sidedrawer);
                    }
                });
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
    
    console.log('Setting up autoplay for', videos.length, 'videos');
    
    // Flag to track if user has interacted
    let userHasInteracted = false;
    
    // Enhanced video setup for mobile compatibility
    videos.forEach((video, index) => {
        console.log(`Video ${index}:`, video.src);
        
        // Set essential attributes
        video.muted = true;
        video.playsInline = true;
        video.controls = false;
        video.loop = video.hasAttribute('data-loop');
        video.preload = 'auto';
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('x5-playsinline', 'true');
        
        // Add error handling
        video.addEventListener('error', (e) => {
            console.error(`Video ${index} error:`, e);
            console.error('Video error details:', video.error);
        });
        
        video.addEventListener('loadstart', () => {
            console.log(`Video ${index} loading started`);
        });
        
        video.addEventListener('loadeddata', () => {
            console.log(`Video ${index} data loaded`);
        });
        
        video.addEventListener('canplay', () => {
            console.log(`Video ${index} can play`);
            // Only try autoplay after user interaction
            if (userHasInteracted) {
                video.play().catch(e => {
                    console.log(`Video ${index} autoplay failed:`, e);
                });
            }
        });
        
        // Force load the video
        video.load();
        
        // Add click handler for manual play with visual feedback
        video.addEventListener('click', (e) => {
            e.stopPropagation();
            userHasInteracted = true;
            
            if (video.paused) {
                console.log(`User clicked to play video ${index}`);
                video.play().then(() => {
                    console.log(`Video ${index} started playing`);
                    // Once one video plays successfully, try to play others
                    videos.forEach((otherVideo, otherIndex) => {
                        if (otherVideo !== video && otherVideo.paused) {
                            otherVideo.play().catch(e => {
                                console.log(`Failed to autostart video ${otherIndex}:`, e);
                            });
                        }
                    });
                }).catch(e => {
                    console.error(`Failed to play video ${index}:`, e);
                });
            } else {
                video.pause();
            }
        });
        
        // Add hover effect to indicate videos are clickable
        video.style.cursor = 'pointer';
        video.addEventListener('mouseenter', () => {
            video.style.opacity = '0.8';
        });
        video.addEventListener('mouseleave', () => {
            video.style.opacity = '1';
        });
    });
    
    // Add a one-time click handler to the drawer for mobile
    const enableVideoPlayback = () => {
        userHasInteracted = true;
        console.log('User interacted with drawer, enabling video playback');
        
        videos.forEach((video, index) => {
            if (video.readyState >= 2 && video.paused) {
                video.play().catch(e => {
                    console.log(`Auto-start after interaction failed for video ${index}:`, e);
                });
            }
        });
        
        // Remove this listener after first interaction
        container.removeEventListener('touchstart', enableVideoPlayback);
        container.removeEventListener('click', enableVideoPlayback);
    };
    
    container.addEventListener('touchstart', enableVideoPlayback, { once: true });
    container.addEventListener('click', enableVideoPlayback, { once: true });
    
    // Intersection observer for viewport-based playback
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting && userHasInteracted) {
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                    video.play().catch(e => console.log('Observer play failed:', e));
                }
            } else {
                video.pause();
            }
        });
    }, {
        root: container,
        threshold: 0.1
    });
    
    videos.forEach(video => observer.observe(video));
    container._videoObserver = observer;
}