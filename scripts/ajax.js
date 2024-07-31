document.addEventListener('DOMContentLoaded', () => {
    // Redirect to #/ if the URL is '/' without any hash
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
        '#/work/es-insight-portal': 'es-insight-portal.html',
        '#/work/viaplay-core-player': 'viaplay-core-player.html'
    };

    const routeOrder = [
        '#/',
        '#/work',
        '#/resume',
        '#/work/viaplay-trailers',
        '#/work/savr-new-design',
        '#/work/es-insight-portal',
        '#/work/viaplay-core-player'
    ];

    let lastRouteIndex = routeOrder.indexOf(window.location.hash || '#/');

    const preloadImages = (images) => {
        images.forEach((image) => {
            const img = new Image();
            img.src = image;
        });
    };

    const loadContent = async (url, animate = true) => {
        console.log(`Loading content from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status}`);
            }
            const data = await response.text();
            content.innerHTML = data;
            initializeHoverEffects();
            initializeVideoControls();
            initializePortfolioVideoHover();

            if (url === 'work.html') {
                const images = Array.from(document.querySelectorAll('.work-item')).map(item => item.getAttribute('data-image'));
                preloadImages(images);
            }

            if (animate) {
                fadeIn(lastRouteIndex, routeOrder.indexOf(window.location.hash));
            }
            lastRouteIndex = routeOrder.indexOf(window.location.hash);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
            if (animate) {
                fadeIn(lastRouteIndex, routeOrder.indexOf(window.location.hash));
            }
            lastRouteIndex = routeOrder.indexOf(window.location.hash);
            window.scrollTo(0, 0);
        }
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
            { opacity: 0, ...direction }, 
            { opacity: 1, x: 0, y: 0, duration: 0.6, ease: "power3.out" }
        );
    };

    const navigate = (hash, animate = true) => {
        console.log(`Navigating to: ${hash}`);
        const url = routes[hash];
        const currentIndex = routeOrder.indexOf(hash);
        if (url) {
            if (animate) {
                gsap.to(content, { opacity: 0, duration: 0.4, ease: "power3.out", onComplete: () => {
                    loadContent(url, animate);
                }});
            } else {
                loadContent(url, animate);
            }
            updateActiveLink(hash);
        } else {
            console.error('Invalid route:', hash);
            content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
            if (animate) {
                fadeIn(lastRouteIndex, currentIndex);
            }
            window.scrollTo(0, 0);
            lastRouteIndex = currentIndex;
        }
    };

    const handleHashChange = (animate = true) => {
        console.log('Hash changed:', window.location.hash);
        navigate(window.location.hash, animate);
    };

    const updateActiveLink = (hash) => {
        const links = document.querySelectorAll('nav a[data-link]');
        links.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === hash || (hash.startsWith('#/work') && linkHref === '#/work')) {
                link.parentElement.classList.add('active');
            } else {
                link.parentElement.classList.remove('active');
            }
        });
    };

    // Debounce the hash change handler
    const debouncedHandleHashChange = debounce(() => handleHashChange(true), 100);
    window.addEventListener('hashchange', debouncedHandleHashChange);

    const handleNavigationEvent = (e) => {
        let target = e.target;

        // Find the closest element with an href or data-link attribute
        while (target && !target.getAttribute('href') && !target.getAttribute('data-link')) {
            target = target.parentElement;
        }

        if (target) {
            const hash = target.getAttribute('href') || target.getAttribute('data-link');
            if (hash) {
                // Check if the link is an email link
                if (hash.startsWith('mailto:') || hash.startsWith('http://') || hash.startsWith('https://')) {
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
        navigate(initialHash, false);
    };

    let startX;
    let startY;
    let threshold = 50; // Minimum distance for a swipe gesture
    let allowedTime = 300; // Maximum time for a swipe gesture
    let startTime;

    document.addEventListener('touchstart', (e) => {
        const touch = e.changedTouches[0];
        startX = touch.pageX;
        startY = touch.pageY;
        startTime = new Date().getTime();
    }, false);

    document.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const distX = touch.pageX - startX;
        const distY = touch.pageY - startY;
        const elapsedTime = new Date().getTime() - startTime;

        if (elapsedTime <= allowedTime) {
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= 100) {
                const isSwipeLeft = distX < 0;
                const isSwipeRight = distX > 0;
                if (isSwipeLeft || isSwipeRight) {
                    const currentHashIndex = routeOrder.indexOf(window.location.hash);
                    let newHashIndex = currentHashIndex;
                    if (isSwipeLeft) {
                        newHashIndex = Math.min(routeOrder.length - 1, currentHashIndex + 1);
                    } else if (isSwipeRight) {
                        newHashIndex = Math.max(0, currentHashIndex - 1);
                    }
                    if (newHashIndex !== currentHashIndex) {
                        window.location.hash = routeOrder[newHashIndex];
                        handleHashChange(false);
                    }
                }
            }
        }
    }, false);

    loadInitialContent();
});