document.addEventListener('DOMContentLoaded', () => {
    
        // Redirect to #/ if the URL is nils.io without any hash
        if (window.location.pathname === '/' && !window.location.hash) {
            window.location.hash = '#/';
        }
    
    const content = document.getElementById('content');

    const routes = {
        '#/': 'home.html',
        '#/work': 'work.html',
        '#/resume': 'resume.html',
        '#/work/viaplay-trailers': 'viaplay-trailers.html',
        '#/work/savr-new-design': 'savr-new-design.html',
        '#/work/es-insight-portal': 'es-insight-portal.html'
    };

    const routeOrder = [
        '#/',
        '#/work',
        '#/resume',
        '#/work/viaplay-trailers',
        '#/work/savr-new-design',
        '#/work/es-insight-portal'
    ];

    let lastRouteIndex = routeOrder.indexOf(window.location.hash || '#/');

    const preloadImages = (images) => {
        images.forEach((image) => {
            const img = new Image();
            img.src = image;
        });
    };

    const loadContent = (url) => {
        console.log(`Loading content from: ${url}`);
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load content: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                content.innerHTML = data;
                initializeHoverEffects(); // Re-initialize hover effects after loading content
                initializeVideoControls(); // Initialize video controls

                if (url === 'work.html') {
                    const images = Array.from(document.querySelectorAll('.work-item')).map(item => item.getAttribute('data-image'));
                    preloadImages(images);
                }

                fadeIn(lastRouteIndex, routeOrder.indexOf(window.location.hash));
                lastRouteIndex = routeOrder.indexOf(window.location.hash); // Update last route index after fading in
                window.scrollTo(0, 0); // Reset scroll position
            })
            .catch(error => {
                console.error(error);
                content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
                fadeIn(lastRouteIndex, routeOrder.indexOf(window.location.hash));
                lastRouteIndex = routeOrder.indexOf(window.location.hash); // Update last route index after fading in
                window.scrollTo(0, 0); // Reset scroll position
            });
    };

    const fadeIn = (lastIndex, currentIndex) => {
        console.log('Fading in content');
        let direction;
        if (lastIndex < currentIndex) {
            direction = { x: 24 }; // Moving to a higher index, animate from right to left
        } else if (lastIndex > currentIndex) {
            direction = { x: -24 }; // Moving to a lower index, animate from left to right
        } else {
            direction = { y: 24 }; // Same page, just fade in
        }
        gsap.fromTo(content, 
            { opacity: 0, ...direction },  // Start with opacity 0 and offset in the specified direction
            { opacity: 1, x: 0, y: 0, duration: 0.6, ease: "power3.out" }  // Fade in and move to original position
        );
    };

    const navigate = (hash) => {
        console.log(`Navigating to: ${hash}`);
        const url = routes[hash];
        const currentIndex = routeOrder.indexOf(hash);
        if (url) {
            gsap.to(content, { opacity: 0, duration: 0.4, ease: "power3.out", onComplete: () => {
                loadContent(url);
            }});
            updateActiveLink(hash);
        } else {
            console.error('Invalid route:', hash);
            content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
            fadeIn(lastRouteIndex, currentIndex);
            window.scrollTo(0, 0); // Reset scroll position
            lastRouteIndex = currentIndex; // Update last route index
        }
    };

    const handleHashChange = () => {
        console.log('Hash changed:', window.location.hash);
        navigate(window.location.hash);
    };

    const updateActiveLink = (hash) => {
        const links = document.querySelectorAll('nav a[data-link]');
        links.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === hash || 
                (hash.startsWith('#/work') && linkHref === '#/work')) { // Check if the current hash is under the work section
                link.parentElement.classList.add('active');
            } else {
                link.parentElement.classList.remove('active');
            }
        });
    };

    window.addEventListener('hashchange', handleHashChange);

    const handleNavigationEvent = (e) => {
        let target = e.target;

        // Find the closest element with an href or data-link attribute
        while (target && !target.getAttribute('href') && !target.getAttribute('data-link')) {
            target = target.parentElement;
        }

        if (target) {
            let hash = target.getAttribute('href') || target.getAttribute('data-link');
            if (hash) {
                // Check if the link is external
                if (hash.startsWith('http://') || hash.startsWith('https://')) {
                    // External link, allow default behavior
                    return;
                }
                // Internal link, handle navigation
                e.preventDefault();
                console.log('Link clicked:', hash);
                window.location.hash = hash;
            }
        }
    };

    document.body.addEventListener('click', handleNavigationEvent);
    document.body.addEventListener('touchend', handleNavigationEvent);

    const loadInitialContent = () => {
        const initialHash = window.location.hash || '#/';
        console.log('Initial content load:', initialHash);
        navigate(initialHash);
    };

    loadInitialContent();
});