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

      fetch("data/footer.json")
        .then(res => res.json())
        .then(data => renderContact(data.footer))
        .catch(err => console.error("Error loading Contact/Footer JSON:", err));

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

      case "contact":
        html = contactTemplate(sec);
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
              <div class="dpo"></div> 
          </div>
        </div>
      </section>`;
}

function renderLanding(data) {
  const landingDiv = document.getElementById("home-data");
  const contactDiv = document.querySelector(".contact-btn-div");
  const dpDiv = document.querySelector(".dpo");

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
    if (elem.type === "settings") {
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
    else if (elem.type === "button") {
      contactDiv.innerHTML += `
        <a href="${elem.url}" ${elem.id ? `id="${elem.id}"` : ""} tabindex="-1">
          <button class="${elem.class}">
            <p class="letsTalkBtn-text">${elem.label}${elem.id ? `: <span id="user_count"></span>` : ""}</p>
            <span class="letsTalkBtn-BG"></span>
          </button>
        </a>
      `;
    }
  });

  // Profile image
  dpDiv.innerHTML = `<div style="visibility:${data.image.visible ? "visible" : "hidden"}">
            <div class="dp"  data-aos="fade-up"> 
              <a href="${data.image.src}" title="download image">
                <img src="${data.image.src}" alt="${data.image.alt}" tabindex="0" aria-label="${data.image.aria_label}" />
              </a>
            </div>
        </div>
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
          <div class="section-heading">
            <strong id="detail-friend" class="detail-jell">${s.heading.line_experinece}</strong>
          </div>
        <div class="info-dp-section"> 
          <div id="experience-container-${s.id}"></div>
        </div>
      </div>
    </section>`;
}

function renderExperience(data) {
  const container = document.getElementById("experience-container-experience");
  if (!container) {
    console.error("❌ experience-container-experience not found!");
    return;
  }

  container.innerHTML = "";

  data.forEach((exp) => {
    const projectsHTML = exp.projects.map(p =>
      `<li>${p.icon || ""} <strong id="detail-company-name" class="detail-jell">${p.name}</strong> — ${p.detail}</li>`
    ).join("");

    const html = `
      <div class="experience-item" style="
        margin-bottom: 40px;
        border-bottom: 1px solid var(--tech-stack-box-border-color);
        padding-bottom: 25px;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      ">
        <!-- TOP ROW: Company Info (Left) + Logo (Right) -->
        <div style="
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 15px 25px;
          width: 100%;
        ">
          <!-- LEFT SIDE -->
          <div style="
            flex: 1 1 55%;
            min-width: 200px;
            max-width: 100%;
            overflow: hidden;
          ">
            <!-- Company Name + Buttons -->
            <div style="
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 6px 10px;
              width: 100%;
            ">
              <h3 class="company-name" style="
                margin: 0;
                font-weight: 800;
                font-size: clamp(1.8rem, 2.8vw, 2.6rem);
                color: var(--color-white);
                word-break: break-word;
                max-width: 100%;
              ">
                <strong id="detail-friend" style="text-adjust contant-adjust" class="detail-jell">${exp.company_name}</strong>
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

                                        <span style="color: var(--color-white); font-weight: 300; font-size: 1.4rem; flex-shrink: 0;">/</span>
 
                                          <button class="company-btn" data-url="${exp.company_contract}"
                                              onclick="openCompany(this)"  id="resume-btn" style="display: flex; align-items: center; margin-left: 5px; ">

                                              <div class="sign-company">
                                                  <svg fill="transparent" viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg" stroke="transparent"
                                                  style="width: 20px; height: 15px; margin-right: 5px; color: #fff; background-color: transparent">
                                                  <path
                                                      d="${exp.svg_file_contract}">
                                                  </path>
                                                  </svg>
                                                  <div class="text-company">Check Contract</div>
                                              </div>
                                          </button> 
            </div>

            <!-- Duration & Location -->
            <div style="
              display: flex;
              flex-wrap: wrap;
              gap: 6px 15px;
              margin-top: 4px;
            ">
              <p class="duration" style="
                margin: 0;
                font-size: clamp(1.1rem, 1.3vw, 1.5rem);
                color: var(--color-white);
                word-break: break-word;
              ">
                📅 ${exp.time_frame}
              </p>
              <p class="location" style="
                margin: 0;
                font-size: clamp(1.1rem, 1.3vw, 1.5rem);
                color: var(--color-white);
                word-break: break-word;
              ">
                📍 ${exp.location}
              </p>
            </div>
          </div>

          <!-- RIGHT SIDE: Logo -->
          <div style="
            flex: 0 1 25%;
            min-width: 80px;
            max-width: 160px;
            display: flex;
            justify-content: center;
            align-items: center;
          ">
            <div class="dp" data-aos="fade-up" style="
              width: 100%;
              max-width: 150px;
            ">
              <a href="${exp.company_logo}" title="download image">
                <img src="${exp.company_logo}" alt="${exp.company_name}"
                  style="
                    width: 100%;
                    height: auto;
                    border-radius: 14px;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                    transition: 0.3s;
                    object-fit: contain;
                    display: block;
                  "
                  onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'"
                />
              </a>
            </div>
          </div>
        </div>

        <!-- BOTTOM ROW: Role, Description, Projects -->
        <div style="
          margin-top: 16px;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        ">
          <p class="role" style="
            font-size: clamp(1.5rem, 1.8vw, 2rem);
            font-weight: 700;
            color: var(--color-white);
            margin: 0 0 6px 0;
            word-break: break-word;
          ">
            👩‍💻 <strong class="strong_text">${exp.experience_duration}</strong>
            <strong id="detail-company-name" class="detail-jell" style="font-size: inherit;"> ${exp.role} </strong>
          </p>

          <div class="experience-description" style="width: 100%; max-width: 100%; overflow: hidden;">
            <p style="
              font-size: clamp(1.2rem, 1.4vw, 1.6rem);
              line-height: 1.7;
              color: var(--color-white);
              margin: 0 0 10px 0;
              word-break: break-word;
              overflow-wrap: break-word;
            ">
              ${exp.description}
            </p>
            <ul class="project-list" style="
              list-style: none;
              padding-left: 0;
              margin: 0;
              font-size: clamp(1.1rem, 1.2vw, 1.4rem);
              color: var(--color-white);
              width: 100%;
              max-width: 100%;
              overflow: hidden;
            ">
              ${projectsHTML}
            </ul>
          </div>
        </div>
      </div>
    `;

    container.innerHTML += html;
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
        
        <!-- Row 1: Text (left) + Image (right) — side by side -->
        <div class="about-top-row" style="
          display: flex;
          flex-wrap: nowrap;
          align-items: flex-start;
          gap: 30px;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        ">
          <div class="about-text-col" id="about-text-col" style="
            flex: 1 1 55%;
            min-width: 200px;
            max-width: 100%;
            overflow: hidden;
          "></div>
          
          <div class="about-image-col" id="about-image-col" style="
            flex: 0 1 30%;
            min-width: 120px;
            max-width: 250px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          "></div>
        </div>
        
        <!-- Row 2: Third paragraph + buttons (full width) -->
        <div class="about-bottom-row" style="
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          margin-top: 20px;
        ">
          <div id="about-bottom-content"></div>
        </div>
        
      </div>
    </section>`;
}
function renderAbout(data) {
  const textCol = document.getElementById("about-text-col");
  const imageCol = document.getElementById("about-image-col");
  const bottomContent = document.getElementById("about-bottom-content");

  if (!textCol || !imageCol || !bottomContent) {
    console.error("❌ About elements not found!");
    return;
  }

  // --- Pehle 2 paragraphs (left side) ---
  const firstTwo = data.paragraphs.slice(0, 2);
  firstTwo.forEach(text => {
    textCol.innerHTML += `<p tabindex="0" style="
      font-size: clamp(1.4rem, 1.6vw, 2rem);
      line-height: 1.8;
      color: var(--color-white);
      word-break: break-word;
      overflow-wrap: break-word;
      margin-bottom: 15px;
    ">${text}</p><br/>`;
  });

  // --- Image (right side) ---
  const img = data.profile_image;
  imageCol.innerHTML = `
    <div class="dp" data-aos="fade-up" style="
      width: 100%;
      max-width: 220px;
    ">
      <a href="${img.src}" title="download image">
        <img src="${img.src}" alt="${img.alt}" 
          style="
            width: 100%;
            height: auto;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.35);
            transition: 0.3s;
            display: block;
          "
          onmouseover="this.style.transform='scale(1.02)'" 
          onmouseout="this.style.transform='scale(1)'"
        />
      </a>
    </div>
  `;

  // --- 3rd paragraph (bottom, full width) ---
  const thirdPara = data.paragraphs.slice(2, 3);
  thirdPara.forEach(text => {
    bottomContent.innerHTML += `<p tabindex="0" style="
      font-size: clamp(1.4rem, 1.6vw, 2rem);
      line-height: 1.8;
      color: var(--color-white);
      word-break: break-word;
      overflow-wrap: break-word;
      margin-bottom: 15px;
    ">${text}</p><br/>`;
  });

  // --- Buttons (bottom, full width) ---
  const buttonsHTML = data.buttons.map(btn => `
    <button class="${btn.type}-btn" data-url="${btn.file_url}" style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border: none;
      border-radius: 30px;
      background: linear-gradient(82.3deg, #965de9 10.8%, #6358ee 94.3%);
      color: #fff;
      font-size: clamp(1.2rem, 1.4vw, 1.6rem);
      font-weight: 600;
      cursor: pointer;
      gap: 8px;
      transition: 0.3s;
    " 
    onmouseover="this.style.transform='scale(1.05)'" 
    onmouseout="this.style.transform='scale(1)'"
    >
      <div class="sign" style="display: flex; align-items: center;">
        <svg viewBox="0 0 640 512" style="width: 18px; height: 18px; fill: #fff;">
          <path d="${btn.svg_file}"/>
        </svg>
      </div>
      <div class="text" style="color: #fff; font-size: clamp(1rem, 1.2vw, 1.4rem);">${btn.label}</div>
    </button>
  `).join("");

  bottomContent.innerHTML += `
    <div class="btn-row" style="
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
    ">
      ${buttonsHTML}
    </div>
  `;

  // Add click listeners for buttons
  document.querySelectorAll(".btn-row button").forEach(button => {
    button.addEventListener("click", () => {
      const url = button.dataset.url;
      if (url) window.open(url, "_blank");
    });
  });
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


//   *********    Contacts  *********
function contactTemplate(s) { 

  return ` 
      <section id="${s.id}" class="${s.sectionClass}" data-aos="${s.aos}">
        <footer id="footer" >
          <button class="fas" id="backtotopbutton" onclick="scrolltoTopfunction()">
            <article aria-label="Back to top">&#8592;BACK TO TOP</article>
          </button>
          <div class="footer-background">
            <div class="footer-blob"></div>
          </div>
            <div id="footer-container"></div>
        </footer> 
      </section>
  `;

  attachFooterWhatsAppPopup();

}

function renderContact(footer) {
  const container = document.getElementById("footer-container");
  if (!container) return;

  container.innerHTML = ` 
        <div class="footer-foreground">
          <div class="footercontainer">

            <!-- Quote -->
            <div class="two-words">
              <article tabindex="0" aria-label="Footer Quote">
                "${footer.quote}"
              </article>
            </div>

            <!-- Social Section -->
            <div class="social-media-container">
              <div class="getintouch-heading">
                <article>${footer.getInTouchTitle}</article>
              </div>

              <div class="logos"> 
                <!-- WhatsApp -->
                <div id="wa-overlay-touch"></div>
                <a id="wa-float-touch"
                  title="WhatsApp Connect"
                  tabindex="0"
                  aria-label="My Whatsapp Contact">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="35" />
                </a>

                <!-- Other social icons -->
                ${footer.social_links
    .filter(l => l.name !== "WhatsApp")
    .map(link => getSocialIcon(link))
    .join("")}

                  </div>
                </div>

                <div class="footer-avatar-container">
                    <img src="${footer.footer_avatar.src}" alt="${footer.footer_avatar.alt}" class="footer-avatar-img" />
                </div>
                <div class="footer-bottom">
                    <article>
                    ${footer.copyright.text}
                    <i class="far fa-copyright"></i>  ${footer.copyright.year}
                    </article>
                </div> 
              </div>
        </div>
        
  `;

  attachFooterWhatsAppPopup();
}

function getSocialIcon(link) {
  return `
    <a href="${link.url}"
       title="${link.title}"
       target="_blank"
       aria-label="${link.ariaLabel}">
      <svg viewBox="${link.icon.viewBox}"
           width="40"
           height="40"
           fill="${link.icon.fill}">
        <path d="${link.icon.path_d}" />
      </svg>
    </a>
  `;
}

/* ---------- WhatsApp Popup ---------- */

function attachFooterWhatsAppPopup() {
  const floatBtn = document.getElementById("wa-float");
  const popup = document.getElementById("wa-popup");
  const overlay = document.getElementById("wa-overlay");
  const closeBtn = document.getElementById("wa-close");
  const floatBtn_touch = document.getElementById("wa-float-touch");
  const popup_touch = document.getElementById("wa-popup-touch");
  const overlay_touch = document.getElementById("wa-overlay-touch");
  const closeBtn_touch = document.getElementById("wa-close-touch");
  floatBtn.onclick = () => {
    popup.style.display = "block";
    overlay.style.display = "block";
  };
  floatBtn_touch.onclick = () => {
    popup_touch.style.display = "block";
    overlay_touch.style.display = "block";
    floatBtn_touch.style.display = "none";
  };
  closeBtn_touch.onclick = overlay_touch.onclick = () => {
    popup_touch.style.display = "none";
    overlay_touch.style.display = "none";
    floatBtn_touch.style.display = "block";
  };
  closeBtn.onclick = overlay.onclick = () => {
    popup.style.display = "none";
    overlay.style.display = "none";
  };
}


function openWhatsApp() {
  const msg = document.getElementById("wa-msg").value || "Hello! Arshad Ali";
  const phone = "+923401710232"; // <-- your number
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}  
