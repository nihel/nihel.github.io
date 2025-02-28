let lastPageIndex = 0;

// Determine the page index based on the path
function getPageIndex(path) {
    switch (path) {
        case '/':
            return 1;
        case '/insight-portal':
            return 2;
        // Add new pages here
        // case '/new-page':
        //     return 3;
        default:
            return 0;
    }
}

// Animate content based on navigation direction
function animatePageIn(lastIndex, currentIndex) {
    const content = document.getElementById('wrapper');
    const direction = lastIndex < currentIndex ? { x: 24, y: 0 } : { x: -24, y: 0 };

    gsap.fromTo(content, 
        { opacity: 0, x: direction.x, y: direction.y }, 
        { opacity: 1, x: 0, y: 0, duration: 0.6, ease: "back.out(1.4)" }
    );
}

// Load page content and apply animation, restoring scroll position if available
function loadPageWithScroll(path, currentIndex) {
    const content = document.getElementById('wrapper');
    content.style.display = 'none';

    fetch(`pages/${path}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Page not found');
            }
            return response.text();
        })
        .then(data => {
            content.innerHTML = data;
            content.style.display = '';

            animatePageIn(lastPageIndex, currentIndex);

            lastPageIndex = currentIndex;
            if (typeof initialize === 'function') initialize(); // Ensure initialize function exists

            // Restore scroll position if available
            const savedScroll = sessionStorage.getItem('scrollPosition-' + path);
            if (savedScroll) {
                window.scrollTo(0, parseInt(savedScroll, 10));
            }
        })
        .catch(error => {
            content.innerHTML = "<p>Sorry, the page could not be loaded.</p>";
            console.error('Error loading page:', error);
        });
}

// Save scroll position before route changes
function saveScrollPosition(path) {
    sessionStorage.setItem('scrollPosition-' + path, window.scrollY);
}

// Middleware to save scroll position
function handleScrollSave(ctx, next) {
    saveScrollPosition(window.location.pathname);
    next();
}

// Define routes
page('*', handleScrollSave);

page('/', () => {
    const currentIndex = getPageIndex('/');
    loadPageWithScroll('intro', currentIndex);
});
page('/insight-portal', () => {
    const currentIndex = getPageIndex('/insight-portal');
    loadPageWithScroll('insight-portal', currentIndex);
});

// Add new routes here
// page('/new-page', () => {
//     const currentIndex = getPageIndex('/new-page');
//     loadPageWithScroll('new-page', currentIndex);
// });

// Initialize page routing
page();

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    const currentIndex = getPageIndex(path);

    animatePageIn(lastPageIndex, currentIndex);
    loadPageWithScroll(path.substring(1) || 'intro', currentIndex);
    lastPageIndex = currentIndex;
});

// Handle touch events on navigation links
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const path = link.getAttribute('href');
        saveScrollPosition(window.location.pathname);
        page(path);
    });
});

// Initialize the first page load and restore scroll position
document.addEventListener('DOMContentLoaded', () => {
    const initialPath = window.location.pathname;
    const currentIndex = getPageIndex(initialPath);
    lastPageIndex = currentIndex;
    loadPageWithScroll(initialPath.substring(1) || 'intro', currentIndex);
});
