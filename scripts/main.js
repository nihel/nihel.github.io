document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');

    const routes = {
        '/': 'home.html',
        '/cv': 'cv.html',
    };

    const loadContent = (url) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                content.innerHTML = xhr.responseText;
                fadeIn();
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
                fadeIn();
            }
        };
        xhr.send();
    };

    const fadeIn = () => {
        content.style.opacity = 0;
        setTimeout(() => {
            content.style.transition = 'opacity 0.2s';
            content.style.opacity = 1;
        }, 10);
    };

    const navigate = (path) => {
        const url = routes[path];
        if (url) {
            content.style.transition = 'none';
            content.style.opacity = 0;
            setTimeout(() => {
                loadContent(url);
            }, 200);
        } else {
            content.innerHTML = '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>';
            fadeIn();
        }
    };

    const handleLinkClick = (e) => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            const path = e.target.getAttribute('href');
            window.history.pushState(null, null, path);
            navigate(path);
        }
    };

    window.addEventListener('popstate', () => {
        navigate(window.location.pathname);
    });

    document.body.addEventListener('click', handleLinkClick);

    // Load the initial content based on the current path
    navigate(window.location.pathname);
});
