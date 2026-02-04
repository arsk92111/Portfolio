document.addEventListener("DOMContentLoaded", () => {
  fetch("data/projects.json")
    .then(res => res.json())
    .then(data => renderProjects(data.projects))
    .catch(err => console.error("Error loading projects JSON:", err));
});

function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  container.innerHTML = "";

  for (let i = 0; i < projects.length; i += 2) {
    const row = [projects[i], projects[i + 1]].filter(Boolean);

    container.innerHTML += `
      <div class="projects-grid">
        ${row.map(p => `
          <div data-aos="fade-up" class="project-box-wrapper ">
            <div class="project-box project-box2">

              <div class="info-div">
                <div class="projects-title-grid">
                  <div class="projects-title-f-grid">
                    <img src="${p.favicon}" alt="${p.name} favicon" class="faviconforProject">
                  </div>
                  <div class="projects-title-s-grid">
                    <article class="ProjectHeading">${p.id}. ${p.name}</article>
                  </div>
                </div>

                <p class="ProjectDescription">${p.description}</p>

                <div class="project-buttons">
                  <a href="${p.github.url}" target="_blank" class="github-redirect" aria-label="${p.github.label}">
                    <img src="${p.github.icon}" alt="github redirect button">
                  </a>

                  <div style="visibility:${p.live.visible ? "visible" : "hidden"}">
                    <a href="${p.live.url}" target="_blank" class="cta" aria-label="${p.live.label}">
                      <span>Live view</span>
                      <svg viewBox="0 0 13 10">
                        <path d="M1,5 L11,5"></path>
                        <polyline points="8 1 12 5 8 9"></polyline>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div class="image-div">
                <a href="${p.main_image}" title="download image"> 
                  <img src="${p.main_image}" alt="${p.main_image_alt}" />
                </a>
              </div>

            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

