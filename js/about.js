document.addEventListener("DOMContentLoaded", () => {
    fetch("data/about.json")
        .then(res => res.json())
        .then(data => renderAbout(data))
        .catch(err => console.error("Error loading about JSON:", err));
});
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
