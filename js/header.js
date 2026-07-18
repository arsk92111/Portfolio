document.addEventListener("DOMContentLoaded", () => {
    fetch("data/header.json")
        .then(res => res.json())
        .then(data => {
            renderHeader(data);
            renderMobileNavbar(data);
            // Re-run active tab after sections render
            setTimeout(() => {
                setupActiveTab();
                setupMobileActiveTab();
            }, 500);
        })
        .catch(err => console.error("Error loading header JSON:", err));
});

function renderHeader(data) {
    const heyElement = document.getElementById("hey-text");
    if (heyElement) heyElement.textContent = data.heyText;

    const logoImg = document.getElementById("logo-img");
    if (logoImg) logoImg.src = data.logoSrc;

    const ul = document.getElementById("navbar-tabs-ul");
    if (!ul) return;
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
}

function setupActiveTab() {
    const navLi = document.querySelectorAll(".navbar-tabs-li");
    if (!navLi.length) return;

    window.addEventListener("scroll", () => {
        let current = "";
        navLi.forEach(li => {
            const a = li.querySelector("a");
            if (!a) return;
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
            if (a && a.getAttribute("href") === current) {
                li.classList.add("activeThistab");
            }
        });
    });

    // initial highlight
    window.dispatchEvent(new Event("scroll"));
}

function renderMobileNavbar(data) {
    const ul = document.getElementById("mobile-ul");
    if (!ul) return;
    ul.innerHTML = "";

    data.navbarTabs.forEach((tab, index) => {
        const li = document.createElement("li");
        li.id = tab.id;
        li.className = "mobile-navbar-tabs-li " + tab.class;
        if (index === 0) li.classList.add("activeThismobiletab");
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
    if (!navLi.length) return;

    window.addEventListener("scroll", () => {
        let current = "";
        navLi.forEach(li => {
            const a = li.querySelector("a");
            if (!a) return;
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
            if (a && a.getAttribute("href") === current) {
                li.classList.add("activeThismobiletab");
            }
        });
    });

    window.dispatchEvent(new Event("scroll"));
}