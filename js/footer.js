document.addEventListener("DOMContentLoaded", () => {
    fetch("data/footer.json")
        .then(res => res.json())
        .then(data => {
            renderFooter(data.footer);
        })
        .catch(err => console.error("Footer JSON error:", err));
});

function renderFooter(footer) {
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
            .map(link => renderSocialIcon(link))
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

function renderSocialIcon(link) {
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
