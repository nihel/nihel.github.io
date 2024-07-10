document.addEventListener('DOMContentLoaded', () => {
    initializeHoverEffects(); // Initialize on initial load

    const content = document.getElementById('content');

    const routes = {
        '#/': 'home.html',
        '#/work': 'work.html',
        '#/resume': 'resume.html'
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
                    initializeVideoControls();
                    fadeIn();
                    window.scrollTo(0, 0); // Reset scroll position
                } else {
                    console.error('Failed to load content:', xhr.status);
                    content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
                    fadeIn();
                    window.scrollTo(0, 0); // Reset scroll position
                }
            }
        };
        xhr.send();
    };

    const fadeIn = () => {
        console.log('Fading in content');
        gsap.fromTo(content, 
            { opacity: 0, y: 24 },  // Start with opacity 0 and slightly below
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }  // Fade in and move upwards
        );
    };

    const navigate = (hash) => {
        console.log(`Navigating to: ${hash}`);
        const url = routes[hash];
        if (url) {
            gsap.to(content, { opacity: 0, duration: 0.4, ease: "power3.out", onComplete: () => {
                loadContent(url);
            }});
            updateActiveLink(hash);
        } else {
            console.error('Invalid route:', hash);
            content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
            fadeIn();
            window.scrollTo(0, 0); // Reset scroll position
        }
    };

    const handleHashChange = () => {
        console.log('Hash changed:', window.location.hash);
        navigate(window.location.hash);
    };

    const updateActiveLink = (hash) => {
        const links = document.querySelectorAll('nav a[data-link]');
        links.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.parentElement.classList.add('active');
            } else {
                link.parentElement.classList.remove('active');
            }
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