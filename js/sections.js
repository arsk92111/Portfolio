document.addEventListener("DOMContentLoaded", () => {
  fetch("data/sections.json")
    .then(res => res.json())
    .then(data => renderSections(data.sections));
});

const sectionTemplateMap = {
  home: homeTemplate,
  experience: experienceTemplate,
  about: aboutTemplate,
  skills: skillsTemplate,
  projects: projectsTemplate
};

function renderSections(sections) {
  const wrapper = document.getElementById("all_section");

  sections.forEach(sec => {
    const templateFn = sectionTemplateMap[sec.type];
    if (!templateFn) return; // safety

    wrapper.insertAdjacentHTML("beforeend", templateFn(sec));
  });

  if (window.AOS) AOS.refresh();
}

function homeTemplate(s) {
  return `
<section id="${s.id}" class="${s.sectionClass}" data-aos="${s.aos}">
  <div class="${s.id}-section">
    <div class="info-dp-section">
      <div class="text-content">
        <div id="${s.id}-data"></div>
        <div class="contact-btn-div" data-aos="fade-up" data-aos-delay="800"></div>
      </div>
      <div class="dp" data-aos="fade-up"></div>
    </div>
  </div>
</section>`;
};

function experienceTemplate(s) {
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
      <div id="experience-container"></div>
    </div>
  </div>
</section>`;
};

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
};

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
};

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
};
