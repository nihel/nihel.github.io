// Sidedrawer state
let sidedrawer = null;
let mainScrollY = 0; // Store main scroll position

// Show main content
function loadMainContent() {
    fetch('pages/intro.html')
        .then(res => res.ok ? res.text() : "<p>Not found.</p>")
        .then(html => {
            document.getElementById('wrapper').innerHTML = html;
            if (typeof initialize === 'function') initialize();
        });
}

// Create and show sidedrawer with portfolio content
function openSidedrawer(item) {
    // Save current scroll position
    mainScrollY = window.scrollY;

    closeSidedrawer(); // Remove any existing drawer

    // Animate wrapper with perspective effect and disable interactions
    const wrapper = document.getElementById('wrapper');
    wrapper.style.pointerEvents = 'none';
    wrapper.style.userSelect = 'none';
    gsap.to(wrapper, {
        scale: 0.9,
        rotationY: 0,
        x: -64,
        transformOrigin: "left center",
        transformPerspective: 1000,
        duration: 0.5,
        ease: "power3.out"
    });

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

    gsap.fromTo(sidedrawer, { x: '100%' }, { x: '0%', duration: 0.5, ease: "power2.out" });

    function escHandler(e) {
        if (e.key === "Escape") {
            closeSidedrawer({ updateUrl: true });
            document.removeEventListener('keydown', escHandler);
            document.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('wheel', scrollHandler);
        }
    }

    function outsideClickHandler(e) {
        if (!sidedrawer.contains(e.target)) {
            closeSidedrawer({ updateUrl: true });
            document.removeEventListener('keydown', escHandler);
            document.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('wheel', scrollHandler);
        }
    }

    function scrollHandler(e) {
        if (!sidedrawer.contains(e.target)) {
            e.preventDefault();
            closeSidedrawer({ updateUrl: true });
            document.removeEventListener('keydown', escHandler);
            document.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('wheel', scrollHandler);
        }
    }
}

// Remove sidedrawer
function closeSidedrawer({ navigate = false, updateUrl = false } = {}) {
    if (sidedrawer) {
        // Re-enable interactions and start wrapper animation immediately
        const wrapper = document.getElementById('wrapper');
        wrapper.style.pointerEvents = 'auto';
        wrapper.style.userSelect = 'auto';
        gsap.to(wrapper, {
            scale: 1,
            rotationY: 0,
            x: 0,
            transformOrigin: "center center",
            transformPerspective: 1000,
            duration: 0.65,
            ease: "power2.out"
        });

        gsap.to(sidedrawer, { 
            x: '100%', 
            duration: 0.5, 
            ease: "power2.out", 
            onComplete: () => {
            // Clean up video observer
            if (sidedrawer._videoObserver) {
                sidedrawer._videoObserver.disconnect();
            }
            // Reset background color
            sidedrawer.style.background = '';
            sidedrawer.remove();
            sidedrawer = null;
            if (navigate) {
                loadMainContent();
            }
            if (updateUrl) {
                page.redirect('/');
            }
        }});
    } else {
        // Re-enable interactions if they were disabled
        const wrapper = document.getElementById('wrapper');
        if (wrapper) {
            wrapper.style.pointerEvents = 'auto';
            wrapper.style.userSelect = 'auto';
        }
        if (navigate) {
            loadMainContent();
        }
        if (updateUrl) {
            page.redirect('/');
        }
    }
}

// Portfolio routes
page('/', () => {
    closeSidedrawer({ navigate: true, updateUrl: false });
});
page('/portfolio/:item', ctx => {
    // Always load main content first if not already loaded
    const wrapper = document.getElementById('wrapper');
    if (!wrapper || !wrapper.innerHTML.trim()) {
        // Load main content and wait for it to complete
        fetch('pages/intro.html')
            .then(res => res.ok ? res.text() : "<p>Not found.</p>")
            .then(html => {
                document.getElementById('wrapper').innerHTML = html;
                if (typeof initialize === 'function') initialize();
                // Now open the drawer
                openSidedrawer(ctx.params.item);
            });
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

// Initialize router
page();

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