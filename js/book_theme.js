// ============================================================
//   📖 BOOK LAYOUT — Real Book Experience with 3D Flip
// ============================================================

let bookInitialized = false;
let currentPageIndex = 0;
let totalPages = 0;
let isTransitioning = false;
let pageMapping = {}; // map of section id -> page index

function initBookLayout() {
    if (!document.body.classList.contains('template-book')) {
        cleanupBookLayout();
        return;
    }
    if (bookInitialized && document.querySelector('.book-cover-wrapper') && document.querySelector('.book-pages-wrapper')) {
        return;
    }

    const allSections = document.querySelectorAll('section');
    if (!allSections.length) {
        console.log('⏳ No sections found, waiting...');
        return;
    }

    cleanupBookLayout();
    currentPageIndex = 0;
    isTransitioning = false;
    pageMapping = {};

    const homeSection = document.querySelector('.home-section');
    const main = document.querySelector('main');
    if (!main) return;

    // --- Create Book Cover ---
    if (homeSection) {
        const coverWrapper = document.createElement('div');
        coverWrapper.className = 'book-cover-wrapper book-container';
        coverWrapper.innerHTML = `
            <div class="book-cover" data-page="cover">
                ${homeSection.outerHTML}
                <div class="book-cover-hint">📖 Click to open the book →</div>
            </div>
        `;
        const coverInner = coverWrapper.querySelector('.book-cover .home-section');
        if (coverInner) coverInner.className = '';
        homeSection.replaceWith(coverWrapper);
    }

    // --- Get remaining sections ---
    const otherSections = document.querySelectorAll('section:not(.home-section)');
    if (!otherSections.length) return;

    totalPages = otherSections.length;

    // --- Create Pages Wrapper ---
    const pagesWrapper = document.createElement('div');
    pagesWrapper.className = 'book-pages-wrapper book-container';
    pagesWrapper.style.marginTop = '20px';
    pagesWrapper.style.perspective = '1200px';

    // --- Build pages with flip effect ---
    let pagesHTML = '';
    const pageNames = [];

    otherSections.forEach((section, index) => {
        const heading = section.querySelector('.section-heading-article');
        const pageName = heading?.textContent?.trim() || `Page ${index + 1}`;
        pageNames.push(pageName);

        // Store mapping for navbar links
        const sectionId = section.id || section.className.split(' ')[0];
        pageMapping[sectionId] = index;

        // Create page with 3D wrapper
        const pageDiv = document.createElement('div');
        pageDiv.id = `book-page-${index}`;
        pageDiv.className = `book-page ${index === 0 ? 'active' : ''}`;
        pageDiv.dataset.index = index;
        // Set up for 3D flip
        pageDiv.style.transformStyle = 'preserve-3d';
        pageDiv.style.backfaceVisibility = 'hidden';

        const content = section.cloneNode(true);
        content.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
        pageDiv.appendChild(content);
        pagesHTML += pageDiv.outerHTML;

        section.remove();
    });

    pagesWrapper.insertAdjacentHTML('beforeend', pagesHTML);

    // --- Navigation Controls ---
    const navControls = document.createElement('div');
    navControls.className = 'book-nav-controls';
    navControls.innerHTML = `
        <div class="book-nav-inner">
            <button class="book-nav-btn book-prev" onclick="goToPreviousPage()" disabled>
                <span>◀</span> Previous
            </button>
            <span class="book-page-indicator">1 / ${totalPages}</span>
            <button class="book-nav-btn book-next" onclick="goToNextPage()">
                Next <span>▶</span>
            </button>
        </div>
    `;
    pagesWrapper.appendChild(navControls);

    // --- Insert after cover ---
    const coverContainer = document.querySelector('.book-cover-wrapper');
    if (coverContainer) {
        coverContainer.after(pagesWrapper);
    } else {
        main.appendChild(pagesWrapper);
    }

    // --- Click on cover opens first page ---
    const cover = document.querySelector('.book-cover');
    if (cover) {
        cover.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            goToPage(0);
        });
        const hint = cover.querySelector('.book-cover-hint');
        if (hint) {
            hint.addEventListener('click', () => goToPage(0));
        }
    }

    // --- Click on page goes next ---
    document.querySelectorAll('.book-page').forEach(page => {
        page.addEventListener('click', function (e) {
            if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.book-nav-controls')) return;
            goToNextPage();
        });
    });

    // --- Keyboard navigation ---
    document.addEventListener('keydown', function (e) {
        if (!document.body.classList.contains('template-book')) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            goToNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            goToPreviousPage();
        } else if (e.key === 'Home') {
            e.preventDefault();
            goToPage(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            goToPage(totalPages - 1);
        }
    });

    // --- Touch swipe ---
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', function (e) {
        if (!document.body.classList.contains('template-book')) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    document.addEventListener('touchend', function (e) {
        if (!document.body.classList.contains('template-book')) return;
        const diffX = touchStartX - e.changedTouches[0].screenX;
        const diffY = touchStartY - e.changedTouches[0].screenY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) goToNextPage();
            else goToPreviousPage();
        }
    });

    // --- Navbar integration: override navbar link clicks ---
    setupNavbarBookNavigation();

    bookInitialized = true;
    updateNavButtons();
    console.log('📖 Book layout initialized with 3D flip!');
}

// ===== Navbar integration =====
function setupNavbarBookNavigation() {
    const navLinks = document.querySelectorAll('.navbar-tabs-ul a, .mobile-navbar-tabs-ul a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (!document.body.classList.contains('template-book')) return;
            e.preventDefault();
            const href = this.getAttribute('href');
            if (!href) return;
            const targetId = href.replace('#', '');
            // Map section ID to page index
            const index = pageMapping[targetId];
            if (index !== undefined) {
                goToPage(index);
            } else {
                // If it's home, go to cover
                if (targetId === 'home') {
                    goToPage(-1); // special: go to cover
                }
            }
        });
    });
}

// ===== Navigation Functions =====

function goToNextPage() {
    if (isTransitioning) return;
    if (currentPageIndex < totalPages - 1) {
        goToPage(currentPageIndex + 1);
    }
}

function goToPreviousPage() {
    if (isTransitioning) return;
    if (currentPageIndex > 0) {
        goToPage(currentPageIndex - 1);
    }
}

function goToPage(index) {
    if (isTransitioning) return;
    // Special: index -1 means cover
    if (index === -1) {
        // Scroll to cover
        const cover = document.querySelector('.book-cover-wrapper');
        if (cover) cover.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    if (index === currentPageIndex) return;
    if (index < 0 || index >= totalPages) return;

    isTransitioning = true;

    const pages = document.querySelectorAll('.book-page');
    const currentPage = pages[currentPageIndex];
    const targetPage = pages[index];

    if (!currentPage || !targetPage) {
        isTransitioning = false;
        return;
    }

    // Determine direction for flip animation
    const direction = index > currentPageIndex ? 'forward' : 'backward';

    // Remove active from current
    currentPage.classList.remove('active');
    // Add active to target
    targetPage.classList.add('active');

    // Apply flip animation classes
    if (direction === 'forward') {
        currentPage.style.animation = 'pageFlipOut 0.6s ease-in-out forwards';
        targetPage.style.animation = 'pageFlipIn 0.6s ease-in-out forwards';
    } else {
        currentPage.style.animation = 'pageFlipOutBack 0.6s ease-in-out forwards';
        targetPage.style.animation = 'pageFlipInBack 0.6s ease-in-out forwards';
    }

    // Update index
    currentPageIndex = index;
    updateNavButtons();

    // Scroll to top of page wrapper
    const wrapper = document.querySelector('.book-pages-wrapper');
    if (wrapper) {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
        isTransitioning = false;
        // Reset animations
        currentPage.style.animation = '';
        targetPage.style.animation = '';
    }, 700);
}

function updateNavButtons() {
    const prevBtn = document.querySelector('.book-prev');
    const nextBtn = document.querySelector('.book-next');
    const indicator = document.querySelector('.book-page-indicator');
    if (prevBtn) prevBtn.disabled = currentPageIndex === 0;
    if (nextBtn) nextBtn.disabled = currentPageIndex === totalPages - 1;
    if (indicator) indicator.textContent = `${currentPageIndex + 1} / ${totalPages}`;
}

function cleanupBookLayout() {
    document.querySelectorAll('.book-pages-wrapper, .book-cover-wrapper').forEach(el => {
        const cover = el.querySelector('.book-cover');
        if (cover) {
            const homeSection = cover.querySelector('.home-section') || cover.querySelector('section');
            if (homeSection) {
                const newSection = document.createElement('section');
                newSection.className = 'home-section';
                newSection.innerHTML = homeSection.innerHTML;
                el.parentNode.insertBefore(newSection, el);
            }
        }
        el.remove();
    });
    document.querySelectorAll('.book-nav-controls').forEach(el => el.remove());
    bookInitialized = false;
    currentPageIndex = 0;
    totalPages = 0;
    pageMapping = {};
}

// ===== Initialization =====

function waitForSectionsAndInit() {
    if (document.querySelectorAll('section').length > 0) {
        setTimeout(initBookLayout, 200);
        return;
    }
    let attempts = 0;
    const maxAttempts = 30;
    const checkInterval = setInterval(() => {
        attempts++;
        const sections = document.querySelectorAll('section');
        if (sections.length > 0) {
            clearInterval(checkInterval);
            console.log('✅ Sections found, initializing book layout...');
            setTimeout(initBookLayout, 200);
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.warn('⚠️ No sections found after timeout');
        }
    }, 300);
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('template-book')) {
        waitForSectionsAndInit();
    }
});

// Watch for layout changes
const layoutObserver = new MutationObserver(() => {
    if (document.body.classList.contains('template-book')) {
        setTimeout(() => {
            bookInitialized = false;
            waitForSectionsAndInit();
        }, 400);
    } else {
        cleanupBookLayout();
    }
});
layoutObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });