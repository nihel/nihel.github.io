document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');

    const routes = {
        '#/': 'home.html',
        '#/work': 'work.html',
        '#/journey': 'journey.html'
    };

    const loadContent = (url) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                content.innerHTML = xhr.responseText;
                initializeVideoControls();
                fadeIn();
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
                fadeIn();
            }
        };
        xhr.send();
    };

    const fadeIn = () => {
        gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
    };

    const navigate = (hash) => {
        const url = routes[hash];
        if (url) {
            gsap.to(content, { opacity: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => {
                loadContent(url);
            }});
        } else {
            content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
            fadeIn();
        }
    };

    const handleHashChange = () => {
        navigate(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            const hash = e.target.getAttribute('href');
            window.location.hash = hash;
        }
    });

    // Load the initial content based on the current hash
    if (!window.location.hash) {
        window.location.hash = '#/';
    } else {
        navigate(window.location.hash);
    }
});