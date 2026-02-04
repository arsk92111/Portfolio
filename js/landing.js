document.addEventListener("DOMContentLoaded", () => {
    fetch("data/landing.json")
        .then(res => res.json())
        .then(data => renderLanding(data))
        .catch(err => console.error("Error loading home JSON:", err));
});

function renderLanding(data) {
    const landingDiv = document.getElementById("home-data");
    const contactDiv = document.querySelector(".contact-btn-div");
    const dpDiv = document.querySelector(".dp");

    // Render hello, name, work, infoPara
    landingDiv.innerHTML = `
    <article id="hello-friend" data-aos="fade-up" data-aos-delay="0">
      ${data.hello.concat(["&nbsp;"], data.intro).map(c => `<p class="jello">${c}</p>`).join("")}
    </article>

    <article id="name" data-aos="fade-up" data-aos-delay="200">  
        ${data.name.map(c => `<p class="jello">${c}</p>`).join("")}
    </article>

    <article id="work" data-aos="fade-up" data-aos-delay="400">
      ${data.work.map(line => `<div>${line.map(c => `<p class="jello">${c}</p>`).join("")}</div>`).join("")}
    </article>

    <p id="info-para" data-aos="fade-up" data-aos-delay="600">
      ${data.infoPara}
    </p>
  `;

    // Render buttons + settings container dynamically
    contactDiv.innerHTML = '';
    data.contactElements.forEach(elem => {
        if (elem.type === "button") {
            contactDiv.innerHTML += `
        <a href="${elem.url}" ${elem.id ? `id="${elem.id}"` : ""} tabindex="-1">
          <button class="${elem.class}">
            <p class="letsTalkBtn-text">${elem.label}${elem.id ? `: <span id="user_count"></span>` : ""}</p>
            <span class="letsTalkBtn-BG"></span>
          </button>
        </a>
      `;
        } else if (elem.type === "settings") {
            let settingsHTML = `<div class="${elem.class}" id="${elem.id}">`;
            elem.children.forEach(child => {
                if (child.type === "input") {
                    settingsHTML += `<input type="${child.inputType}" id="${child.id}" ${child.onClick ? `onclick="${child.onClick}"` : ""} />`;
                } else if (child.type === "label") {
                    settingsHTML += `<label for="${child.for}" class="${child.class || ''}" id="${child.id}" tabindex="${child.tabindex || 0}" aria-label="${child.ariaLabel || ''}"></label>`;
                }
            });
            settingsHTML += `</div>`;
            contactDiv.innerHTML += settingsHTML;
        }
    });

    // Profile image
    dpDiv.innerHTML = `
    <a href="${data.image.src}" title="download image">
      <img src="${data.image.src}" alt="${data.image.alt}" tabindex="0" aria-label="${data.image.aria_label}" />
    </a>
  `;
}
