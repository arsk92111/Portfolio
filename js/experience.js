fetch("data/experience.json")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("experience-container");

        data.forEach(exp => {
            const projectsHTML = exp.projects.map(p =>
                `<li>${p.icon} <strong>${p.name}</strong> — ${p.detail}</li> `
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
    });
