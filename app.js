let sidedrawer = null;
let hasPlayedEntranceAnimation = false;
let lastMousePosition = { x: 0, y: 0 };
let isAnimating = false;

// Track mouse position globally
window.addEventListener('mousemove', (e) => {
    lastMousePosition.x = e.clientX;
    lastMousePosition.y = e.clientY;
});

// Mobile detection
function isMobile() {
    return window.innerWidth <= 549;
}

// Page Cache
const pageCache = new Map();

function fetchPage(url) {
    if (pageCache.has(url)) {
        return Promise.resolve(pageCache.get(url));
    }
    return fetch(url)
        .then(res => res.ok ? res.text() : "<p>Not found.</p>")
        .then(html => {
            pageCache.set(url, html);
            return html;
        });
}

// Dark Mode Logic
const themeLightBtn = document.getElementById('theme-light');
const themeDarkBtn = document.getElementById('theme-dark');
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Initial load
if (storedTheme) {
    setTheme(storedTheme);
} else if (prefersDark.matches) {
    setTheme('dark');
}

// Event listeners for manual toggle
if (themeLightBtn) {
    themeLightBtn.addEventListener('click', () => setTheme('light'));
}
if (themeDarkBtn) {
    themeDarkBtn.addEventListener('click', () => setTheme('dark'));
}

// Event listener for system preference changes
prefersDark.addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    // OR if we want to respect system changes even with stored pref (user requested "follow settings")
    // Given "follow whatever the user settings in set in the browser", we should prioritize system if no manual override,
    // or maybe just update if the user hasn't explicitly locked it. 
    // However, usually manual override > system. 
    // But let's check if we should clear storage to allow system to take over?
    // For now, let's just update if no stored theme, OR if the user wants to follow system.
    // Simpler approach: If the user changes system theme, we update our theme UNLESS we want to strictly enforce the stored one.
    // But the user asked "follow whatever the user settings in set in the browser".
    // Let's assume if they change the browser setting, they want the site to update.
    // We will update the theme and clear the stored preference so it keeps following system?
    // Or just update it. Let's just update it.
    const newTheme = e.matches ? 'dark' : 'light';
    setTheme(newTheme);
});

// Animation constants
const WRAPPER_OPEN = {
    scale: 0.9, rotationY: -4, x: -160, opacity: 0,
    transformOrigin: "left center", transformPerspective: 1000,
    duration: 0.5, ease: "power3.out"
};
const WRAPPER_CLOSE = {
    scale: 1, rotationY: 0, x: 0, opacity: 1,
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
    return fetchPage('pages/intro.html')
        .then(html => {
            const wrapper = getWrapper();
            wrapper.innerHTML = html;

            // Only set up entrance animations on first load
            if (!hasPlayedEntranceAnimation) {
                // Use requestAnimationFrame to ensure DOM is rendered before animating
                requestAnimationFrame(() => {
                    setupEntranceAnimations();
                    hasPlayedEntranceAnimation = true;
                });
            } else {
                // If animations have already played, remove the pending class to show content immediately
                document.body.classList.remove('entrance-animation-pending');
            }

            if (typeof initialize === 'function') initialize();

            // Run Hello animation
            runHelloAnimation();
        });
}

// Hello Text Animation (Scramble)
function runHelloAnimation() {
    const element = document.getElementById('hello-anim');
    if (!element) return;

    const languages = ['Hello', 'Hej', 'Hola', 'Hallo', 'Bonjour', 'Olá'];
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let currentIndex = 0;

    function scramble(newText) {
        const oldText = element.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => {
            const queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                queue.push({ from, to, start, end });
            }

            cancelAnimationFrame(frameRequest);
            let frame = 0;

            function update() {
                let output = '';
                let complete = 0;
                for (let i = 0, n = queue.length; i < n; i++) {
                    let { from, to, start, end, char } = queue[i];
                    if (frame >= end) {
                        complete++;
                        output += to;
                    } else if (frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = chars[Math.floor(Math.random() * chars.length)];
                            queue[i].char = char;
                        }
                        output += `<span class="dud">${char}</span>`;
                    } else {
                        output += from;
                    }
                }
                element.innerHTML = output;
                if (complete === queue.length) {
                    resolve();
                } else {
                    frameRequest = requestAnimationFrame(update);
                    frame++;
                }
            }
            update();
        });
        return promise;
    }

    let frameRequest;
    function next() {
        currentIndex = (currentIndex + 1) % languages.length;
        scramble(languages[currentIndex]).then(() => {
            setTimeout(next, 5000);
        });
    }

    // Start loop
    setTimeout(next, 5000);
}

// Setup entrance animations for main content
function setupEntranceAnimations() {
    const wrapper = getWrapper();
    const animatedElements = wrapper.querySelectorAll('header, .content > *, .content .item');

    if (animatedElements.length === 0) return;

    // Set initial state: invisible and blurred
    gsap.set(animatedElements, {
        opacity: 0,
        filter: 'blur(8px)',
        y: 24
    });

    // Animate each element in sequence
    gsap.to(animatedElements, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.1,
        ease: 'power3.out',
        onComplete: () => {
            // Remove the pending class after animation completes to allow normal CSS behavior
            document.body.classList.remove('entrance-animation-pending');
        }
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
    isAnimating = true;

    // Save current scroll position and prevent scrolling without resetting position
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('drawer-open');

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

        // Populate and show dynamic background
        const link = document.querySelector(`a[href="/portfolio/${item}"]`);
        const dynamicBg = document.getElementById('dynamic-background');

        if (dynamicBg) {
            dynamicBg.classList.add('is-active');
        }

        if (link) {
            const title = link.querySelector('h3')?.innerText || '';
            const logoSrc = link.querySelector('img')?.src || '';
            const header = link.getAttribute('data-header') || '';
            const description = link.getAttribute('data-description') || '';

            const dynamicBg = document.getElementById('dynamic-background');
            if (dynamicBg) {
                dynamicBg.innerHTML = `
                    <div class="dynamic-content-stack">
                        <img src="${logoSrc}" alt="${title} Logo">
                        <h1>${title}</h1>
                        ${description ? `<p>${description}</p>` : ''}
                    </div>
                `;
                // Match animation timing exactly with wrapper
                gsap.to(dynamicBg, {
                    opacity: 1,
                    duration: 0.2,
                    ease: "power2.out",
                    delay: WRAPPER_OPEN.duration
                });
            }
        }
    }

    // Custom Cursor Logic
    const dynamicBg = document.getElementById('dynamic-background');
    if (dynamicBg) {
        const customCursor = document.getElementById('custom-cursor');

        // Set initial position immediately
        gsap.set(customCursor, {
            x: lastMousePosition.x,
            y: lastMousePosition.y
        });

        // Move cursor
        const moveCursor = (e) => {
            gsap.to(customCursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });
        };

        // Show cursor
        const showCursor = () => {
            gsap.to(customCursor, { opacity: 1, duration: 0.2 });
        };

        // Hide cursor
        const hideCursor = () => {
            gsap.to(customCursor, { opacity: 0, duration: 0.2 });
        };

        // Close drawer on click
        const handleClick = () => {
            if (isAnimating) return;
            closeSidedrawer({ updateUrl: true });
        };

        dynamicBg.addEventListener('mousemove', moveCursor);
        dynamicBg.addEventListener('mouseenter', showCursor);
        dynamicBg.addEventListener('mouseleave', hideCursor);
        dynamicBg.addEventListener('click', handleClick);

        // Store cleanup function
        dynamicBg._cleanupCursor = () => {
            dynamicBg.removeEventListener('mousemove', moveCursor);
            dynamicBg.removeEventListener('mouseenter', showCursor);
            dynamicBg.removeEventListener('mouseleave', hideCursor);
            dynamicBg.removeEventListener('click', handleClick);
            gsap.to(customCursor, { opacity: 0, duration: 0.2 });
        };
    }

    sidedrawer = document.createElement('div');
    sidedrawer.className = 'sidedrawer';
    sidedrawer.innerHTML = `<div class="drawer-content" style="opacity: 0;">Loading...</div>`;
    document.body.appendChild(sidedrawer);

    // Prevent scroll propagation to body
    sidedrawer.addEventListener('wheel', function (e) {
        const atTop = sidedrawer.scrollTop === 0;
        const atBottom = sidedrawer.scrollHeight - sidedrawer.scrollTop === sidedrawer.clientHeight;
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
            e.preventDefault();
        }
    }, { passive: false });

    sidedrawer.addEventListener('touchmove', function (e) {
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
                // Close the drawer starting from current dragged position
                const currentTransform = sidedrawer.style.transform;
                const currentY = currentTransform.match(/translateY\(([^)]+)\)/);
                const startFromY = currentY ? currentY[1] : '0px';

                // Start wrapper animation immediately (same as normal close)
                setWrapperInteraction(true);
                gsap.killTweensOf(getWrapper());
                gsap.to(getWrapper(), WRAPPER_MOBILE_CLOSE);

                // Animate drawer to closed position from current position
                gsap.fromTo(sidedrawer,
                    { y: startFromY },
                    {
                        y: '100%',
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: () => {
                            // Clean up without additional animations
                            if (sidedrawer._videoObserver) {
                                sidedrawer._videoObserver.disconnect();
                            }
                            if (sidedrawer._cleanupDragHandlers) {
                                sidedrawer._cleanupDragHandlers();
                            }
                            sidedrawer.style.background = '';

                            const wrapper = getWrapper();
                            gsap.set(wrapper, {
                                clearProps: "transform,scale,x,y,rotationY,transformOrigin,transformPerspective"
                            });
                            wrapper.classList.remove('mobile-drawer-open');

                            sidedrawer.remove();
                            sidedrawer = null;
                            removeEventListeners();
                            page.redirect('/');
                        }
                    }
                );
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
    fetchPage(`pages/${item}.html`)
        .then(html => {
            sidedrawer.querySelector('.drawer-content').innerHTML = html;

            // Show the content now that it's loaded
            sidedrawer.querySelector('.drawer-content').style.opacity = '1';

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

    // Animate drawer entry: from bottom on mobile, from right on desktop
    if (mobile) {
        gsap.fromTo(sidedrawer, { y: '100%' }, {
            y: '0%',
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                isAnimating = false;
            }
        });
    } else {
        gsap.fromTo(sidedrawer, { x: '100%' }, {
            x: '0%',
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                isAnimating = false;
            }
        });
    }

    function removeEventListeners() {
        document.removeEventListener('keydown', escHandler);
        document.removeEventListener('click', outsideClickHandler);
    }

    // Attach cleanup function to sidedrawer so it can be called from closeSidedrawer
    sidedrawer._cleanupListeners = removeEventListeners;

    function escHandler(e) {
        if (e.key === "Escape") {
            closeSidedrawer({ updateUrl: true });
        }
    }

    function outsideClickHandler(e) {
        if (isAnimating) return;

        if (!sidedrawer.contains(e.target)) {
            closeSidedrawer({ updateUrl: true });
            removeEventListeners();
        }
    }
}

// Remove sidedrawer
function closeSidedrawer({ navigate = false, updateUrl = false } = {}) {
    // Capture the current drawer instance to avoid race conditions if a new one is opened immediately
    const drawerToClose = sidedrawer;

    if (drawerToClose) {
        const mobile = isMobile();

        // Restore scroll position and re-enable scrolling
        const scrollY = document.body.style.top;
        document.body.classList.remove('drawer-open');
        document.body.style.top = '';
        if (scrollY) {
            // Temporarily disable smooth scrolling for instant restoration
            const originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'auto';

            // Use setTimeout to ensure this runs after browser's native scroll restoration
            setTimeout(() => {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
                // Restore original scroll behavior
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
            }, 10);
        }

        // Re-enable interactions and start wrapper animation immediately
        setWrapperInteraction(true);

        // Kill any existing wrapper animations to prevent conflicts
        gsap.killTweensOf(getWrapper());

        if (mobile) {
            gsap.to(getWrapper(), WRAPPER_MOBILE_CLOSE);
        } else {
            gsap.to(getWrapper(), WRAPPER_CLOSE);

            // Hide dynamic background
            const dynamicBg = document.getElementById('dynamic-background');
            if (dynamicBg) {
                gsap.killTweensOf(dynamicBg);
                gsap.set(dynamicBg, { opacity: 0 });
                dynamicBg.classList.remove('is-active');

                // Cleanup cursor listeners
                if (dynamicBg._cleanupCursor) {
                    dynamicBg._cleanupCursor();
                    dynamicBg._cleanupCursor = null;
                }
            }
        }

        // Animate drawer exit: to bottom on mobile, to right on desktop
        const exitAnimation = mobile
            ? { y: '100%', duration: 0.5, ease: "power2.out" }
            : { x: '100%', duration: 0.5, ease: "power2.out" };

        gsap.to(drawerToClose, {
            ...exitAnimation,
            onComplete: () => {
                // Clean up video observer
                if (drawerToClose._videoObserver) {
                    drawerToClose._videoObserver.disconnect();
                }

                // Clean up video timeouts
                if (drawerToClose._videoTimeouts) {
                    drawerToClose._videoTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
                    drawerToClose._videoTimeouts.clear();
                }

                // Clean up drag handlers (mobile)
                if (drawerToClose._cleanupDragHandlers) {
                    drawerToClose._cleanupDragHandlers();
                }

                // Clean up event listeners
                if (drawerToClose._cleanupListeners) {
                    drawerToClose._cleanupListeners();
                }

                // Reset background color
                drawerToClose.style.background = '';

                // Clear all transforms on wrapper to ensure clean state
                const wrapper = getWrapper();
                gsap.set(wrapper, {
                    clearProps: "transform,scale,x,y,rotationY,transformOrigin,transformPerspective"
                });
                wrapper.classList.remove('mobile-drawer-open');

                drawerToClose.remove();

                // Only clear the global reference if it's still pointing to the drawer we just closed
                if (sidedrawer === drawerToClose) {
                    sidedrawer = null;
                }

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
        closeSidedrawer({ navigate: false, updateUrl: false });
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

// Initialize router after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add class to enable FOUC prevention on initial load
    document.body.classList.add('entrance-animation-pending');

    page();
});

// Fallback if DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already ready
    document.body.classList.add('entrance-animation-pending');
    page();
}

// Handle window resize and orientation changes
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

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

    // Track timeouts for each video
    const videoTimeouts = new Map();

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;

            if (entry.isIntersecting) {
                // Clear any existing timeout for this video
                if (videoTimeouts.has(video)) {
                    clearTimeout(videoTimeouts.get(video));
                }

                // Video is in viewport, play it after 1 second delay
                const timeoutId = setTimeout(() => {
                    // Re-check if video is still in viewport using getBoundingClientRect
                    const rect = video.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    const isStillVisible = rect.top < containerRect.bottom &&
                        rect.bottom > containerRect.top &&
                        rect.left < containerRect.right &&
                        rect.right > containerRect.left;

                    if (isStillVisible) {
                        video.play().catch(e => {
                            // Handle autoplay policy restrictions
                            console.log('Autoplay prevented:', e);
                        });
                    }

                    // Remove timeout from tracking
                    videoTimeouts.delete(video);
                }, 1000);

                // Store timeout ID for this video
                videoTimeouts.set(video, timeoutId);
            } else {
                // Clear any pending timeout for this video
                if (videoTimeouts.has(video)) {
                    clearTimeout(videoTimeouts.get(video));
                    videoTimeouts.delete(video);
                }

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
        video.loop = video.hasAttribute('loop');  // Loop if loop attribute is present
        video.playsInline = true; // Prevent fullscreen on mobile
        video.controls = false; // Hide player controls

        observer.observe(video);
    });

    // Store observer reference for cleanup
    container._videoObserver = observer;
    container._videoTimeouts = videoTimeouts;
}