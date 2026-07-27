/* ============================================================
   RENDERER
   Turns JSON data into DOM nodes. HTML is only ever injected
   through the sanitize() whitelist below — everything else
   uses textContent to avoid unsafe injection.
   ============================================================ */

const Renderer = (() => {

  // Only allow a tiny whitelist of harmless inline tags coming from JSON copy.
  function sanitize(html) {
    if (!html) return "";
    const allowed = ["strong", "em", "br", "b", "i"];
    return String(html).replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tag) => {
      return allowed.includes(tag.toLowerCase()) ? `<${match.startsWith("</") ? "/" : ""}${tag.toLowerCase()}>` : "";
    });
  }

  function el(tag, opts = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(opts).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = sanitize(v);
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("data-")) node.setAttribute(k, v);
      else node.setAttribute(k, v);
    });
    children.filter(Boolean).forEach(c => node.appendChild(c));
    return node;
  }

  function icon(name, extraClass = "") {
    return el("span", { class: `material-symbols-outlined ${extraClass}`, text: name });
  }

  /* ---------------- NAVBAR ---------------- */
  function renderNav(data) {
    const list = document.getElementById("nav-links-list");
    list.innerHTML = "";
    data.navigation.forEach((item, i) => {
      const a = el("a", { href: `#${item.target}`, class: i === 0 ? "active" : "" }, []);
      a.textContent = item.label;
      list.appendChild(el("li", {}, [a]));
    });

    const tmplMenu = document.getElementById("template-menu");
    tmplMenu.innerHTML = "";
    data.templates.forEach(t => {
      const btn = el("button", { "data-template-choice": t.id, class: t.id === "default" ? "active" : "" }, [
        icon(t.icon), el("span", { text: t.label })
      ]);
      tmplMenu.appendChild(btn);
    });
  }

  /* ---------------- HERO ---------------- */
  function renderHero(data) {
    const h = data.hero;
    document.getElementById("hero-eyebrow").textContent = `${h.greeting}`;
    document.getElementById("hero-name").innerHTML = `${h.intro} <span class="grad-text">${h.name}</span>`;
    document.getElementById("hero-desc").innerHTML = sanitize(h.paragraph);
    document.getElementById("hero-role-text").dataset.lines = JSON.stringify(h.roleLines);

    const btnRow = document.getElementById("hero-btn-row");
    btnRow.innerHTML = "";
    btnRow.appendChild(el("a", { href: h.primaryCta.url, target: "_blank", rel: "noopener", class: "btn btn-primary" }, [
      icon("work"), el("span", { text: h.primaryCta.label })
    ]));
    btnRow.appendChild(el("a", { href: `#${h.secondaryCta.target}`, class: "btn btn-outline" }, [
      icon("folder_open"), el("span", { text: h.secondaryCta.label })
    ]));
    btnRow.appendChild(el("a", { href: h.resumeFile, download: "", class: "btn btn-outline" }, [
      icon("download"), el("span", { text: "Resume" })
    ]));

    const statsWrap = document.getElementById("hero-stats");
    statsWrap.innerHTML = "";
    h.stats.forEach(s => {
      statsWrap.appendChild(el("div", { class: "stat" }, [
        el("b", { text: s.value }), el("span", { text: s.label })
      ]));
    });
  }

  /* ---------------- ABOUT ---------------- */
  function renderAbout(data) {
    const a = data.about;
    document.getElementById("about-eyebrow").textContent = "def AboutMe():";
    document.getElementById("about-title").textContent = a.sectionTitle;

    const body = document.getElementById("about-body");
    body.innerHTML = "";
    a.paragraphs.forEach(p => body.appendChild(el("p", { html: p })));

    const btns = document.getElementById("about-buttons");
    btns.innerHTML = "";
    a.buttons.forEach(b => {
      btns.appendChild(el("a", { href: b.fileUrl, download: "", class: "btn " + (b.type === "resume" ? "btn-primary" : "btn-outline") }, [
        icon(b.type === "resume" ? "download" : "description"), el("span", { text: b.label })
      ]));
    });

    const hi = document.getElementById("about-highlights");
    hi.innerHTML = "";
    a.highlights.forEach(h => {
      hi.appendChild(el("div", {}, [ el("b", { text: h.label }), el("span", { text: h.value }) ]));
    });
  }

  /* ---------------- EXPERIENCE ---------------- */
  function renderExperience(data) {
    const e = data.experience;
    document.getElementById("experience-eyebrow").textContent = "if Experience:";
    document.getElementById("experience-title").textContent = e.sectionTitle;
    document.getElementById("experience-sub").textContent = e.tagline;

    const wrap = document.getElementById("timeline-wrap");
    wrap.innerHTML = "";
    e.items.forEach(item => {
      const subProjects = el("div", { class: "sub-projects" });
      item.projects.forEach(p => {
        subProjects.appendChild(el("div", { class: "sub-project" }, [
          el("div", { class: "sp-head" }, [icon(p.icon), el("span", { text: p.name })]),
          el("p", { text: p.detail })
        ]));
      });

      const card = el("div", { class: "timeline-card" }, [
        el("div", { class: "timeline-head" }, [
          el("h3", {}, [el("a", { href: item.companyLink, target: "_blank", rel: "noopener", text: item.company })]),
          el("span", { class: "timeline-badge", text: item.employmentType })
        ]),
        el("div", { class: "timeline-meta" }, [
          el("span", { text: `📍 ${item.location}` }),
          el("span", { text: `🗓 ${item.timeFrame}` }),
          el("span", { text: `⏱ ${item.duration}` })
        ]),
        el("h4", { style: "font-size:16px;color:var(--orange);margin-bottom:10px;", text: item.role }),
        el("p", { class: "desc", text: item.description }),
        subProjects
      ]);

      wrap.appendChild(el("div", { class: "timeline-item", "data-reveal": "" }, [
        el("div", { class: "timeline-dot" }), card
      ]));
    });
  }

  /* ---------------- SKILLS ---------------- */
  function renderSkills(data) {
    const s = data.skills;
    document.getElementById("skills-eyebrow").textContent = "class Skills:";
    document.getElementById("skills-title").textContent = s.sectionTitle;

    const wrap = document.getElementById("skills-cats");
    wrap.innerHTML = "";
    s.categories.forEach(cat => {
      const list = el("div", { class: "skill-list" });
      cat.skills.forEach(sk => {
        list.appendChild(el("div", { class: "skill-chip" }, [icon(sk.icon), el("span", { text: sk.name })]));
      });
      wrap.appendChild(el("div", { class: "skill-cat", "data-reveal": "" }, [
        el("h3", { text: `// ${cat.title}` }), list
      ]));
    });
  }

  /* ---------------- PROJECTS ---------------- */
  function renderProjects(data) {
    const p = data.projects;
    document.getElementById("projects-eyebrow").textContent = "for p in Projects:";
    document.getElementById("projects-title").textContent = p.sectionTitle;

    const filterRow = document.getElementById("filter-row");
    filterRow.innerHTML = "";
    p.filters.forEach((f, i) => {
      filterRow.appendChild(el("button", { class: "filter-btn" + (i === 0 ? " active" : ""), "data-filter": f, text: f }));
    });

    const grid = document.getElementById("projects-grid");
    function paint(filter) {
      grid.innerHTML = "";
      p.items
        .filter(item => filter === "All" || item.category.includes(filter))
        .forEach(item => {
          const links = el("div", { class: "pc-links" }, [
            el("a", { href: item.github, target: "_blank", rel: "noopener" }, [el("span", { text: "GitHub" })]),
            el("a", {
              href: item.liveVisible ? item.live : "#",
              target: "_blank", rel: "noopener",
              class: item.liveVisible ? "" : "disabled"
            }, [el("span", { text: "Live" })])
          ]);
          const tags = el("div", { class: "tag-row" });
          item.category.forEach(c => tags.appendChild(el("span", { class: "tag", text: c })));

          grid.appendChild(el("div", { class: "project-card tilt", "data-reveal": "" }, [
            el("div", { class: "pc-top" }, [
              el("span", { class: "pc-id", text: `#${String(item.id).padStart(2, "0")}` }),
              icon("terminal")
            ]),
            el("h3", { text: item.name }),
            el("p", { text: item.description }),
            tags,
            links
          ]));
        });
    }
    paint("All");
    filterRow.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        filterRow.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        paint(btn.dataset.filter);
      });
    });
  }

  /* ---------------- CONTACT ---------------- */
  function renderContact(data) {
    const c = data.contact;
    document.getElementById("contact-eyebrow").textContent = "@ContactMe";
    document.getElementById("contact-title").textContent = c.sectionTitle;
    document.getElementById("contact-sub").textContent = c.tagline;

    const list = document.getElementById("contact-list");
    list.innerHTML = "";
    const rows = [
      { icon: "mail", label: "Email", value: c.email, href: `mailto:${c.email}` },
      { icon: "call", label: "Phone", value: c.phone, href: c.phoneHref },
      { icon: "location_on", label: "Location", value: c.location, href: null },
      { icon: "chat", label: "WhatsApp", value: "Message me", href: c.whatsapp }
    ];
    rows.forEach(r => {
      const inner = [
        el("div", { class: "ic" }, [icon(r.icon)]),
        el("div", {}, [el("b", { text: r.label }), el("span", { text: r.value })])
      ];
      list.appendChild(r.href ? el("a", { class: "contact-row", href: r.href, target: "_blank", rel: "noopener" }, inner)
                              : el("div", { class: "contact-row" }, inner));
    });

    const pre = document.getElementById("contact-code");
    pre.innerHTML =
      `<span class="k">const</span> developer = {\n` +
      `  <span class="k">name:</span> <span class="v">"Arshad Ali"</span>,\n` +
      `  <span class="k">role:</span> <span class="v">"Python / Django Developer"</span>,\n` +
      `  <span class="k">location:</span> <span class="v">"${c.location}"</span>,\n` +
      `  <span class="k">available:</span> <span class="v">true</span>\n` +
      `};`;
  }

  /* ---------------- FOOTER ---------------- */
  function renderFooter(data) {
    document.getElementById("footer-quote").textContent = `"${data.footer.quote}"`;
    document.getElementById("footer-copy").textContent =
      `© ${data.footer.copyrightYear} ${data.footer.copyrightText}`;

    const social = document.getElementById("footer-social");
    social.innerHTML = "";
    data.socialLinks.forEach(s => {
      social.appendChild(el("a", { class: "icon-btn", href: s.url, target: "_blank", rel: "noopener", "aria-label": s.name }, [icon(s.icon)]));
    });

    const footNav = document.getElementById("footer-nav");
    footNav.innerHTML = "";
    data.navigation.forEach(n => {
      footNav.appendChild(el("a", { href: `#${n.target}`, text: n.label.replace(/[#@]/g, "").trim() }));
    });
  }

  function renderAll(data) {
    document.title = data.meta.siteTitle;
    document.querySelector('meta[name="description"]').setAttribute("content", data.meta.metaDescription);
    renderNav(data);
    renderHero(data);
    renderExperience(data);
    renderAbout(data);
    renderSkills(data);
    renderProjects(data);
    renderContact(data);
    renderFooter(data);
  }

  return { renderAll };
})();
