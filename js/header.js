document.addEventListener("DOMContentLoaded", () => {
    fetch("data/header.json")
        .then(res => res.json())
        .then(data => { renderHeader(data); renderMobileNavbar(data) })
        .catch(err => console.error("Error loading header JSON:", err));
});

function renderHeader(data) {
    // Set Hey! text
    document.getElementById("hey-text").textContent = data.heyText;

    // Set logo image
    document.getElementById("logo-img").src = data.logoSrc;

    // Render navbar tabs
    const ul = document.getElementById("navbar-tabs-ul");
    ul.innerHTML = "";

    data.navbarTabs.forEach(tab => {
        const li = document.createElement("li");
        li.className = tab.class + " navbar-tabs-li";
        li.setAttribute("data-aos", "fade-down");
        li.setAttribute("data-aos-delay", tab.dataAosDelay);

        const a = document.createElement("a");
        a.href = tab.href;
        a.textContent = tab.text;
        a.setAttribute("aria-label", tab.text + " menu button");

        li.appendChild(a);
        ul.appendChild(li);
    });

    // Now setup scroll-based active tab
    setupActiveTab();
}

function setupActiveTab() {
    const navLi = document.querySelectorAll(".navbar-tabs-li");

    window.addEventListener("scroll", () => {
        let current = "";

        navLi.forEach(li => {
            const a = li.querySelector("a");
            const target = document.querySelector(a.getAttribute("href"));

            if (!target) return;

            const top = target.offsetTop - 120;
            const bottom = top + target.offsetHeight;

            if (window.scrollY >= top && window.scrollY < bottom) {
                current = a.getAttribute("href");
            }
        });

        navLi.forEach(li => {
            li.classList.remove("activeThistab");
            const a = li.querySelector("a");
            if (a.getAttribute("href") === current) {
                li.classList.add("activeThistab");
            }
        });
    });

    // initial highlight
    window.dispatchEvent(new Event("scroll"));
}

//  *****************************************************   **************   MOBILE HEADER   **********************

function renderMobileNavbar(data) {
    const ul = document.getElementById("mobile-ul");
    ul.innerHTML = "";

    data.navbarTabs.forEach((tab, index) => {
        const li = document.createElement("li");
        li.id = tab.id;
        li.className = "mobile-navbar-tabs-li " + tab.class;
        if (index === 0) li.classList.add("activeThismobiletab"); // first tab active initially
        li.setAttribute("onclick", "hidemenubyli()");

        const a = document.createElement("a");
        a.href = tab.href;
        a.textContent = tab.text;
        a.setAttribute("tabindex", 0);
        a.setAttribute("aria-label", tab.text + " menu button");

        li.appendChild(a);
        ul.appendChild(li);
    });
    setupMobileActiveTab();
}


function setupMobileActiveTab() {
    const navLi = document.querySelectorAll(".mobile-navbar-tabs-li");

    window.addEventListener("scroll", () => {
        let current = "";

        navLi.forEach(li => {
            const a = li.querySelector("a");
            const target = document.querySelector(a.getAttribute("href"));

            if (!target) return;

            const top = target.offsetTop - 120;
            const bottom = top + target.offsetHeight;

            if (window.scrollY >= top && window.scrollY < bottom) {
                current = a.getAttribute("href");
            }
        });

        navLi.forEach(li => {
            li.classList.remove("activeThismobiletab");
            const a = li.querySelector("a");
            if (a.getAttribute("href") === current) {
                li.classList.add("activeThismobiletab");
            }
        });
    });

    // initial highlight
    window.dispatchEvent(new Event("scroll"));
}