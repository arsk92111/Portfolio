document.addEventListener("DOMContentLoaded", () => {
  fetch("data/sections.json")
    .then(res => res.json())
    .then(data => {
      renderSections(data.sections);

      fetch("data/landing.json")
        .then(res => res.json())
        .then(data => renderLanding(data))
        .catch(err => console.error("Error loading home JSON:", err));

      // AFTER sections are rendered, load experience
      fetch("data/experience.json")
        .then(res => res.json())
        .then(data => renderExperience(data))
        .catch(err => console.error("Error loading experience JSON:", err));

      fetch("data/about.json")
        .then(res => res.json())
        .then(data => renderAbout(data))
        .catch(err => console.error("Error loading about JSON:", err));

      fetch("data/skills.json")
        .then(res => res.json())
        .then(data => renderSkills(data.categories))
        .catch(err => console.error("Error loading skills JSON:", err));

      fetch("data/projects.json")
        .then(res => res.json())
        .then(data => renderProjects(data.projects))
        .catch(err => console.error("Error loading Projects JSON:", err));

    });
});

function renderSections(sections) {
  const wrapper = document.getElementById("all_section");

  sections.forEach(sec => {
    let html = "";

    switch (sec.type) {
      case "home":
        html = homeTemplate(sec);
        break;

      case "experience":
        html = experienceTemplate(sec);
        break;

      case "about":
        html = aboutTemplate(sec);
        break;

      case "skills":
        html = skillsTemplate(sec);
        break;

      case "projects":
        html = projectsTemplate(sec);
        break;
    }

    wrapper.insertAdjacentHTML("beforeend", html);
  });

  if (window.AOS) AOS.refresh();
}

//   *********    Home  *********
function homeTemplate(s) {
  return `
      <section id="${s.id}" class="${s.sectionClass}" data-aos="${s.aos}">
        <div class="home-section">
          <div class="info-dp-section">
            <div class="text-content">
              <div id="home-data"></div>
              <div class="contact-btn-div" data-aos="fade-up" data-aos-delay="800"></div>
            </div>
            <div class="dp" data-aos="fade-up"></div>
          </div>
        </div>
      </section>`;
}
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

//   *********    Experience  *********
function experienceTemplate(s) {
  return `
    <section id="${s.id}" class="${s.sectionClass}" data-aos="${s.aos}">
      <div class="experience-section">
        <div class="section-heading">
          <h2 class="section-heading-article" tabindex="0" aria-label="${s.heading.aria}">
            ${s.heading.text}
          </h2>
          <p class="sectionHeadingP"></p>
        </div>
        <div class="info-dp-section">
          <div id="experience-container-${s.id}"></div>
        </div>
      </div>
    </section>`;
}
function renderExperience(data) {
  const container = document.getElementById("experience-container-experience");
  if (!container) return;

  container.innerHTML = ""; // Clear previous content

  data.forEach(exp => {
    const projectsHTML = exp.projects.map(p =>
      `<li>${p.icon || ""} <strong>${p.name}</strong> — ${p.detail}</li>`
    ).join("");

    container.innerHTML += ` 
                     <div class="info-dp-section">
                        <div class="row" data-aos="fade-up">
                            <div class="col-12 col-md-6">
                                <div class="experience-card">
                                <div class="experience-header">
                                    <div class="company-row">
                                    <div style="display: flex; align-items: center;">
                                        <h3 class="company-name" style="margin: 0; padding: 0; font-weight: 600;">
                                            ${exp.company_name}
                                        </h3>
                                        <button class="company-btn" data-url="${exp.company_link}"
                                            onclick="openCompany(this)"  id="resume-btn" style="display: flex; align-items: center; margin-left: 8px;">

                                            <div class="sign-company">
                                                <svg fill="#326cb8" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" stroke="#326cb8"
                                                style="width: 20px; height: 20px; margin-right: 4px;">
                                                <path
                                                    d="${exp.svg_file}">
                                                </path>
                                                </svg>
                                                <div class="text-company">Visit Company</div>
                                            </div>
                                        </button>
                                        </div>
                                    </div>

                                    </div>
                                    <div class="placed">
                                    <p class="duration">📅 ${exp.time_frame}</p>
                                    <p class="location">📍 ${exp.location}</p>
                                    </div>
                                </div>
                                👩‍💻 <strong class="strong_text">${exp.experience_duration}</strong> <p class="role"> ${exp.role}</p>
                                <div class="experience-description">
                                    <p>
                                    ${exp.description}
                                    </p>
                                    <ul class="project-list">
                                    ${projectsHTML}
                                    
                                    </ul>
                                </div>
                                </div>
                            </div>

                        <div class="dp" data-aos="fade-up">
                            <a href="${exp.company_logo}" title="download image">
                            <img src="${exp.company_logo}" alt="${exp.company_name}" tabindex="0" aria-label="${exp.company_name}" />
                            </a>
                        </div>
                    </div>
        `;
  });
}

//   *********    About  *********
function aboutTemplate(s) {
  return `
      <section id="${s.id}" class="${s.sectionClass}" data-aos="${s.aos}">
        <div class="about-section">
          <div class="section-heading">
            <h2 class="section-heading-article" tabindex="0" aria-label="${s.heading.aria}">
              ${s.heading.text}
            </h2>
            <p class="sectionHeadingP"></p>
          </div>
          <div class="info-dp-section">
            <div class="about-info" id="about-content"></div>
            <div class="dp" data-aos="fade-up" id="about-image"></div>
          </div>
        </div>
      </section>`;
}
function renderAbout(data) {
  const aboutContent = document.getElementById("about-content");

  // Paragraphs
  data.paragraphs.forEach(text => {
    aboutContent.innerHTML += `<p tabindex="0">${text}</p><br/>`;
  });

  // Buttons
  const buttonsHTML = data.buttons.map(btn => `
      <button class="${btn.type}-btn" data-url="${btn.file_url}">
        <div class="sign">
          <svg viewBox="0 0 640 512">
            <path d="${btn.svg_file}"/>
          </svg>
        </div>
        <div class="text">${btn.label}</div>
      </button>
    `).join("");

  aboutContent.innerHTML += `
      <div class="row" data-aos="fade-up">
        <div class="col-12">
          <div class="btn-row">
            ${buttonsHTML}
          </div>
        </div>
      </div>
    `;

  // Add click listeners after adding buttons
  document.querySelectorAll(".btn-row button").forEach(button => {
    button.addEventListener("click", () => {
      const url = button.dataset.url;
      if (url) window.open(url, "_blank");
    });
  });

  // Image
  const img = data.profile_image;
  document.getElementById("about-image").innerHTML = `
      <a href="${img.src}" title="download image">
        <img src="${img.src}" alt="${img.alt}" tabindex="0" aria-label="${img.aria_label}">
      </a>
    `;
}

//   *********    Skills  *********
function skillsTemplate(s) {
  return `
      <section id="${s.id}" class="${s.sectionClass}">
        <div class="skills-section">
          <div class="section-heading" data-aos="fade-up">
            <h2 class="section-heading-article">${s.heading.text}</h2>
            <p class="sectionHeadingP"></p>
          </div>
          <div id="skills-container"></div>
        </div>
      </section>`;
}
function renderSkills(categories) {
  const container = document.getElementById("skills-container");
  container.innerHTML = "";

  categories.forEach(category => {
    const skillsHTML = category.skills.map(skill => `
      <li class="tech-stack-box" data-aos="fade-up">
      <a href="${skill.logo}" title="download image">
        <img 
          src="${skill.logo}" 
          alt="${skill.alt}" 
          class="tech-stack-logo ${skill.invert ? "needtobeinvert" : ""}" 
        />
        </a>
        <span class="tooltip">${skill.name}</span>
      </li>
    `).join("");

    container.innerHTML += `
      <div class="frontend-dev-section">
        <h3 class="frontend-dev-heading" 
            data-aos="fade-up" 
            tabindex="0"
            aria-label="${category.aria_label}">
          ${category.title}
        </h3>

        <ul class="tech-stack-wrapper">
          ${skillsHTML}
        </ul>
      </div>
    `;
  });
}

//   *********    Projects  *********
function projectsTemplate(s) {
  return `
    <section id="${s.id}" class="${s.sectionClass}" data-aos="${s.aos}">
      <div class="projects-section-div">
        <div class="section-heading" data-aos="fade-up">
          <h2 class="section-heading-article" tabindex="0" aria-label="${s.heading.aria}">
            ${s.heading.text}
          </h2>
          <p class="sectionHeadingP"></p>
        </div>
        <div class="project-boxes-div">
          <section id="projects-container"></section>
        </div>
      </div>
    </section>`;
}
function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < projects.length; i += 2) {
    const row = [projects[i], projects[i + 1]].filter(Boolean);

    container.innerHTML += `
            <div class="projects-grid">
                ${row.map(p => `
                    <div data-aos="fade-up" class="project-box-wrapper">
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
                                <a href="${p.image?.src || '#'}" title="${p.image?.alt || 'Project Image'}">
                                    <img src="${p.image?.src || 'images/default.png'}" alt="${p.image?.alt || 'Project Image'}" class="project-image"/>
                                </a>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
  }
}

