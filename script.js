/* =========================================================
   MIGEL PHOTOGRAPHY | A MJOLNIR GROUP
   Accessible homepage interactions
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".primary-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll(".primary-nav a[href^='#']");
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  const galleryImages = galleryItems.map(item => item.querySelector("img")).filter(Boolean);

  // Header background on scroll.
  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 35);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Mobile menu.
  const closeMenu = () => {
    nav?.classList.remove("active");
    menuButton?.classList.remove("active");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation menu");
  };
  menuButton?.addEventListener("click", () => {
    const open = nav?.classList.toggle("active") ?? false;
    menuButton.classList.toggle("active", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => {
    if (nav?.classList.contains("active") &&
        !nav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeMenu();
  });

  // Smooth navigation for in-page links.
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  // Reveal gallery images, with a fallback for browsers without IntersectionObserver.
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px 30px 0px" });
    galleryImages.forEach((img, index) => {
      img.style.transitionDelay = `${Math.min(index * 45, 270)}ms`;
      revealObserver.observe(img);
    });
  } else {
    galleryImages.forEach(img => img.classList.add("visible"));
  }

  // Mark unavailable portfolio images without breaking the rest of the layout.
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      img.classList.add("image-error");
      img.closest(".gallery-item")?.classList.add("image-unavailable");
    });
  });

  // Build lightbox hidden by default; it opens only after an image is activated.
  let currentIndex = 0;
  let previousFocus = null;
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Portfolio image viewer");
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>
    <button class="lightbox-prev" type="button" aria-label="Previous image">&#10094;</button>
    <div class="lightbox-content">
      <p class="lightbox-loading" aria-live="polite">Loading image…</p>
      <img class="lightbox-image" alt="" hidden>
      <p class="lightbox-error" hidden>Sorry, this photograph could not be loaded.</p>
    </div>
    <button class="lightbox-next" type="button" aria-label="Next image">&#10095;</button>
    <p class="lightbox-counter" aria-live="polite"></p>`;
  document.body.appendChild(lightbox);

  const largeImage = lightbox.querySelector(".lightbox-image");
  const loading = lightbox.querySelector(".lightbox-loading");
  const errorMessage = lightbox.querySelector(".lightbox-error");
  const counter = lightbox.querySelector(".lightbox-counter");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");

  const displayImage = index => {
    if (!galleryImages.length) return;
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const source = galleryImages[currentIndex];
    const src = source.currentSrc || source.src;
    largeImage.hidden = true;
    errorMessage.hidden = true;
    loading.hidden = false;
    loading.textContent = "Loading image…";
    counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
    largeImage.alt = source.alt || "Migel Photography portfolio image";
    largeImage.onload = () => {
      loading.hidden = true;
      errorMessage.hidden = true;
      largeImage.hidden = false;
    };
    largeImage.onerror = () => {
      loading.hidden = true;
      largeImage.hidden = true;
      errorMessage.hidden = false;
    };
    largeImage.src = src;
    if (largeImage.complete && largeImage.naturalWidth > 0) {
      loading.hidden = true;
      largeImage.hidden = false;
    }
  };

  const openLightbox = index => {
    previousFocus = document.activeElement;
    displayImage(index);
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    largeImage.removeAttribute("src");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });
  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => displayImage(currentIndex - 1));
  nextButton.addEventListener("click", () => displayImage(currentIndex + 1));
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("active")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") displayImage(currentIndex - 1);
    if (event.key === "ArrowRight") displayImage(currentIndex + 1);
    if (event.key === "Tab") {
      const controls = [closeButton, previousButton, nextButton];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });

  // WhatsApp contact form. No server is needed: visitor reviews and sends the draft in WhatsApp.
  const form = document.querySelector("#contactForm");
  form?.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const service = String(data.get("service") || "").trim();
    const message = String(data.get("message") || "").trim();
    const body = [
      "Hello Migel Photography 👋",
      "",
      "I would like to make an enquiry.",
      "",
      `Name: ${name}`,
      `Email: ${email || "Not provided"}`,
      `Service: ${service || "Not specified"}`,
      "",
      "Message:",
      message
    ].join("\n");
    const url = `https://wa.me/254792544527?text=${encodeURIComponent(body)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    const status = document.querySelector("#formStatus");
    if (status) status.textContent = opened === null
      ? "Your browser blocked the new tab. Please use the WhatsApp button or allow pop-ups for this site."
      : "WhatsApp opened with your message. Review it there and press Send.";
  });

  // Active navigation link based on visible section.
  if ("IntersectionObserver" in window) {
    const sections = document.querySelectorAll("main section[id]");
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
    sections.forEach(section => activeObserver.observe(section));
  }

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
});
