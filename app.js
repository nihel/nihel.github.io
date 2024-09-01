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

// Load page content with scroll reset and apply animation
function loadPageWithScrollReset(path, currentIndex) {
    const content = document.getElementById('wrapper');
    content.style.display = 'none';
    window.scrollTo(0, 0);

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
        })
        .catch(error => {
            content.innerHTML = "<p>Sorry, the page could not be loaded.</p>";
            console.error('Error loading page:', error);
        });
}

// Reset scroll position before route changes
function resetScroll(ctx, next) {
    window.scrollTo(0, 0);
    next();
}

// Define routes
page('*', resetScroll);

page('/', () => {
    const currentIndex = getPageIndex('/');
    loadPageWithScrollReset('intro', currentIndex);
});
page('/insight-portal', () => {
    const currentIndex = getPageIndex('/insight-portal');
    loadPageWithScrollReset('insight-portal', currentIndex);
});

// Add new routes here
// page('/new-page', () => {
//     const currentIndex = getPageIndex('/new-page');
//     loadPageWithScrollReset('new-page', currentIndex);
// });

// Initialize page routing
page();

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    const currentIndex = getPageIndex(path);

    animatePageIn(lastPageIndex, currentIndex);
    loadPageWithScrollReset(path.substring(1) || 'intro', currentIndex);
    lastPageIndex = currentIndex;
});

// Handle touch events on navigation links
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const path = link.getAttribute('href');
        page(path);
    });
});

// Initialize the first page load
document.addEventListener('DOMContentLoaded', () => {
    const initialPath = window.location.pathname;
    const currentIndex = getPageIndex(initialPath);
    lastPageIndex = currentIndex;
    loadPageWithScrollReset(initialPath.substring(1) || 'intro', currentIndex);
});