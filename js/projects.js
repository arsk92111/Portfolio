
document.addEventListener("DOMContentLoaded", function () {
  fetch("data/projects.csv")
    .then(response => response.text())
    .then(csvText => {
      const projects = parseCSV(csvText);
      renderProjects(projects);
    })
    .catch(err => console.error("Error loading CSV:", err));
});

// CSV → JSON parser
function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows.shift().split(",");
  return rows.map(row => {
    const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]]));
  });
}

// Render all projects dynamically in rows and columns
function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  container.innerHTML = "";

  for (let i = 0; i < projects.length; i += 2) {
    const rowHTML = `
       <div class="projects-grid">
        ${[projects[i], projects[i + 1]]
          .filter(Boolean)
      .map(p => `  <div data-aos="fade-up" class="project-box-wrapper">
                <div class="project-box project-box2">
                <div class="info-div">
                  <div class="projects-title-grid">
                    <div class="projects-title-f-grid">
                      <img src="${p.favicon}" alt="${p.project_name} favicon" class="faviconforProject" />
                    </div>
                    <div class="projects-title-s-grid">
                      <article class="ProjectHeading">${p.project_name}</article>
                    </div>
                  </div>
                  <p class="ProjectDescription">${p.description}</p>
                  <div class="project-buttons">
                    <a href="${p.github_url}" target="_blank" class="github-redirect" aria-label="${p.github_label}">
                      <img src="${p.github_icon}" alt="github redirect button" />
                    </a>
                <!-- start -->
                    <div class="" style="visibility: ${display};">
                      <a href="${p.live_url}" target="_blank" class="cta" aria-label="${p.live_label}" >
                        <span>Live view</span>
                        <svg viewBox="0 0 13 10" height="10px" width="15px">
                          <path d="M1,5 L11,5"></path>
                          <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                      </a>
                    </div>
                <!-- End -->
                  </div>
                </div>
                <div class="image-div">
                  <img src="${p.main_image}" alt="${p.main_image_alt}" />
                </div> 
            </div>
            </div> 
          `)
          .join("")}
      </div>
    `;
    container.innerHTML += rowHTML;
  }
}
