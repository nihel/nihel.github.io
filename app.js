let lastPageIndex = 0; // Initialize to track the last page index

// Function to set the active link
function setActiveLink(path) {
    path = path.replace(/\/$/, '').replace(/^\//, '');

    document.querySelectorAll('nav ul li').forEach(li => {
        li.classList.remove('active');
    });

    document.querySelectorAll('nav ul li a').forEach(link => {
        const linkHref = link.getAttribute('href').replace(/^\//, '');
        if (linkHref === path) {
            link.parentElement.classList.add('active');
        }
    });
}

// Function to determine the page index based on the path
function getPageIndex(path) {
    switch (path) {
        case '/work':
            return 2;
        case '/resume':
            return 3;
        default:
            return 1;
    }
}

// Function to animate the content based on page navigation direction
function animatePageIn(lastIndex, currentIndex) {
    const content = document.getElementById('wrapper');
    let direction = {}; // No default direction

    if (lastIndex < currentIndex) {
        direction = { x: 24, y: 0 }; // Moving to a higher index, animate from right to left
    } else if (lastIndex > currentIndex) {
        direction = { x: -24, y: 0 }; // Moving to a lower index, animate from left to right
    }

    gsap.fromTo(content, 
        { opacity: 0, ...direction }, 
        { opacity: 1, x: 0, y: 0, duration: 0.6, ease: "back.out(1.4)" }
    );
}

// Function to load page content with scroll reset and directional animation
function loadPageWithScrollReset(page, currentIndex) {
    const content = document.getElementById('wrapper');
    content.style.display = 'none'; // Hide content initially
    window.scrollTo(0, 0); // Reset scroll position to the top

    fetch(`pages/${page}.html`)
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                content.innerHTML = "<p>Sorry, the page could not be loaded.</p>";
                throw new Error('Page not found');
            }
        })
        .then(data => {
            content.innerHTML = data;
            content.style.display = ''; // Show content

            // Animate fade-in on the first load
            if (currentIndex === lastPageIndex && lastPageIndex === 1) {
                gsap.fromTo(content, { opacity: 0, y: 0 }, 
                { opacity: 1, y: -24,  duration: 1.2, ease: "power3.out" });
            } else {
                animatePageIn(lastPageIndex, currentIndex); // Animate with direction
            }

            lastPageIndex = currentIndex; // Update last page index
            initialize(); // Initialize animations for newly loaded content
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}

// Middleware to reset scroll before the route changes
function resetScroll(ctx, next) {
    window.scrollTo(0, 0); // Reset scroll position to the top
    next(); // Move to the next middleware or route handler
}

// Apply the scroll reset middleware before every route
page('*', resetScroll);

// Define the routes with corresponding page indices
page('/', () => {
    const currentIndex = getPageIndex('/');
    setActiveLink('/');
    loadPageWithScrollReset('intro', currentIndex);
});
page('/work', () => {
    const currentIndex = getPageIndex('/work');
    setActiveLink('/work');
    loadPageWithScrollReset('work', currentIndex);
});
page('/resume', () => {
    const currentIndex = getPageIndex('/resume');
    setActiveLink('/resume');
    loadPageWithScrollReset('resume', currentIndex);
});
page('*', () => {
    const currentIndex = getPageIndex('/');
    setActiveLink('/');
    loadPageWithScrollReset('intro', currentIndex);
});

// Initialize page.js routing
page();

// Handle popstate event for browser back/forward buttons
window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    const currentIndex = getPageIndex(path);

    setActiveLink(path);
    animatePageIn(lastPageIndex, currentIndex); // Apply the animation with correct direction
    loadPageWithScrollReset(path.substring(1) || 'intro', currentIndex); // Load content
    lastPageIndex = currentIndex; // Update the lastPageIndex
    window.scrollTo(0, 0); // Ensure scroll position is reset when using back/forward buttons
});

// Event listener for touch events on navigation links
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent the default touch behavior
        const path = link.getAttribute('href');
        page(path); // Trigger page.js navigation
    });
});

// Initialize the first page load
document.addEventListener('DOMContentLoaded', () => {
    const initialPath = window.location.pathname;
    const currentIndex = getPageIndex(initialPath);
    lastPageIndex = currentIndex;
    setActiveLink(initialPath);
    loadPageWithScrollReset(initialPath.substring(1) || 'intro', currentIndex);
});