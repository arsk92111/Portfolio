document.addEventListener("DOMContentLoaded", () => {
    fetch("data/skills.json")
        .then(res => res.json())
        .then(data => renderSkills(data.categories))
        .catch(err => console.error("Error loading skills JSON:", err));
});

function renderSkills(categories) {
    const container = document.getElementById("skills-container");
    container.innerHTML = "";

    categories.forEach(category => {
        const skillsHTML = category.skills.map(skill => `
      <li class="tech-stack-box" data-aos="fade-up">
        <img 
          src="${skill.logo}" 
          alt="${skill.alt}" 
          class="tech-stack-logo ${skill.invert ? "needtobeinvert" : ""}" 
        />
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
