document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');

    const routes = {
        '#/': 'home.html',
        '#/work': 'work.html',
        '#/resume': 'resume.html'
    };

    const routeOrder = ['#/', '#/work', '#/resume'];
    let lastRouteIndex = routeOrder.indexOf(window.location.hash || '#/');

    // Function to preload images
    const preloadImages = (images) => {
        images.forEach((image) => {
            const img = new Image();
            img.src = image;
        });
    };

    const loadContent = (url) => {
        console.log(`Loading content from: ${url}`);
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('Content loaded successfully');
                    content.innerHTML = xhr.responseText;
                    initializeHoverEffects(); // Re-initialize hover effects after loading content
                    initializeVideoControls(); // Initialize video controls

                    // Preload images after loading content
                    if (url === 'work.html') {
                        const images = Array.from(document.querySelectorAll('.work-item')).map(item => item.getAttribute('data-image'));
                        preloadImages(images);
                    }

                    fadeIn(lastRouteIndex, routeOrder.indexOf(window.location.hash));
                    lastRouteIndex = routeOrder.indexOf(window.location.hash); // Update last route index after fading in
                } else {
                    console.error('Failed to load content:', xhr.status);
                    content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
                    fadeIn(lastRouteIndex, routeOrder.indexOf(window.location.hash));
                    lastRouteIndex = routeOrder.indexOf(window.location.hash); // Update last route index after fading in
                }
                window.scrollTo(0, 0); // Reset scroll position
            }
        };
        xhr.send();
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
            link.parentElement.classList.toggle('active', link.getAttribute('href') === hash);
        });
    };

    window.addEventListener('hashchange', handleHashChange);

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            const hash = e.target.getAttribute('href');
            console.log('Link clicked:', hash);
            window.location.hash = hash;
        }
    });

    // Function to load the initial content
    const loadInitialContent = () => {
        const initialHash = window.location.hash || '#/';
        console.log('Initial content load:', initialHash);
        navigate(initialHash);
    };

    // Load the initial content
    loadInitialContent();
});