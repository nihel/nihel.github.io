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
    sidedrawer.innerHTML = `<div class="drawer-content">Loading...</div>`;
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
            // Animate images in drawer-content with GSAP fade-in sequence
            const images = sidedrawer.querySelectorAll('.drawer-content img');
            if (images.length > 0) {
                gsap.set(images, { opacity: 0, y: 32 });
                gsap.to(images, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.24,
                    ease: 'power3.out'
                });
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
            duration: 0.5,
            ease: "power3.out"
        });

        gsap.to(sidedrawer, { 
            x: '100%', 
            duration: 0.5, 
            ease: "power2.out", 
            onComplete: () => {
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
    openSidedrawer(ctx.params.item);
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