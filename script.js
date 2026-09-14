/* =========================================================
   MIGEL PHOTOGRAPHY - MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------------
       1. PORTFOLIO IMAGE REVEAL ANIMATION
       ----------------------------------------------------- */

    const images = document.querySelectorAll(".gallery img");

    if ("IntersectionObserver" in window) {

        const imageObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        // Stop observing once the animation has happened
                        observer.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -50px 0px"
            }
        );

        images.forEach((image, index) => {

            // Slight stagger effect
            image.style.transitionDelay = `${index * 60}ms`;

            imageObserver.observe(image);
        });

    } else {

        // Fallback for older browsers
        images.forEach(image => {
            image.classList.add("visible");
        });

    }


    /* -----------------------------------------------------
       2. MOBILE NAVIGATION
       ----------------------------------------------------- */

    const nav = document.querySelector("nav");
    const navLinks = document.querySelector("nav ul");

    if (nav && navLinks) {

        // Create mobile menu button
        const menuButton = document.createElement("button");

        menuButton.className = "menu-toggle";
        menuButton.setAttribute("aria-label", "Open navigation menu");
        menuButton.setAttribute("aria-expanded", "false");

        menuButton.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        nav.appendChild(menuButton);

        menuButton.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("active");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuButton.classList.toggle("active", isOpen);
        });


        // Close menu after clicking a link
        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");
                menuButton.classList.remove("active");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* -----------------------------------------------------
       3. NAVIGATION SHADOW ON SCROLL
       ----------------------------------------------------- */

    const header = document.querySelector("header");

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    updateHeader();


    /* -----------------------------------------------------
       4. SMOOTH SCROLLING
       ----------------------------------------------------- */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (event) {

            const targetID = this.getAttribute("href");

            if (!targetID || targetID === "#") return;

            const target = document.querySelector(targetID);

            if (!target) return;

            event.preventDefault();

            const headerHeight = header
                ? header.offsetHeight
                : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                15;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });


    /* -----------------------------------------------------
       5. PORTFOLIO IMAGE LIGHTBOX
       ----------------------------------------------------- */

    const galleryImages = document.querySelectorAll(".gallery img");

    if (galleryImages.length > 0) {

        // Create lightbox
        const lightbox = document.createElement("div");

        lightbox.className = "lightbox";

        lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Close image">
                &times;
            </button>

            <button class="lightbox-prev" aria-label="Previous image">
                &#10094;
            </button>

            <img class="lightbox-image" src="" alt="Portfolio image">

            <button class="lightbox-next" aria-label="Next image">
                &#10095;
            </button>

            <div class="lightbox-counter"></div>
        `;

        document.body.appendChild(lightbox);

        const lightboxImage =
            lightbox.querySelector(".lightbox-image");

        const closeButton =
            lightbox.querySelector(".lightbox-close");

        const previousButton =
            lightbox.querySelector(".lightbox-prev");

        const nextButton =
            lightbox.querySelector(".lightbox-next");

        const counter =
            lightbox.querySelector(".lightbox-counter");

        let currentImage = 0;


        function showImage(index) {

            if (index < 0) {
                index = galleryImages.length - 1;
            }

            if (index >= galleryImages.length) {
                index = 0;
            }

            currentImage = index;

            const image = galleryImages[currentImage];

            lightboxImage.src = image.src;
            lightboxImage.alt =
                image.alt || "Migel Photography portfolio image";

            counter.textContent =
                `${currentImage + 1} / ${galleryImages.length}`;

        }


        function openLightbox(index) {

            showImage(index);

            lightbox.classList.add("active");

            document.body.classList.add("lightbox-open");

        }


        function closeLightbox() {

            lightbox.classList.remove("active");

            document.body.classList.remove("lightbox-open");

            // Prevent old image from consuming memory
            setTimeout(() => {
                if (!lightbox.classList.contains("active")) {
                    lightboxImage.src = "";
                }
            }, 300);

        }


        galleryImages.forEach((image, index) => {

            image.style.cursor = "zoom-in";

            image.addEventListener("click", () => {
                openLightbox(index);
            });

        });


        closeButton.addEventListener("click", closeLightbox);

        previousButton.addEventListener("click", () => {
            showImage(currentImage - 1);
        });

        nextButton.addEventListener("click", () => {
            showImage(currentImage + 1);
        });


        // Close when clicking the dark background
        lightbox.addEventListener("click", event => {

            if (event.target === lightbox) {
                closeLightbox();
            }

        });


        // Keyboard controls
        document.addEventListener("keydown", event => {

            if (!lightbox.classList.contains("active")) return;

            if (event.key === "Escape") {
                closeLightbox();
            }

            if (event.key === "ArrowLeft") {
                showImage(currentImage - 1);
            }

            if (event.key === "ArrowRight") {
                showImage(currentImage + 1);
            }

        });

    }


    /* -----------------------------------------------------
       6. CONTACT FORM → WHATSAPP
       ----------------------------------------------------- */

    const contactForm = document.querySelector("#contact form");

    if (contactForm) {

        contactForm.addEventListener("submit", event => {

            event.preventDefault();

            const nameInput =
                contactForm.querySelector(
                    'input[name="name"], input[type="text"]'
                );

            const emailInput =
                contactForm.querySelector(
                    'input[name="email"], input[type="email"]'
                );

            const messageInput =
                contactForm.querySelector(
                    "textarea"
                );


            const name =
                nameInput ? nameInput.value.trim() : "";

            const email =
                emailInput ? emailInput.value.trim() : "";

            const message =
                messageInput ? messageInput.value.trim() : "";


            if (!name || !message) {

                alert(
                    "Please enter your name and message before sending."
                );

                return;

            }


            const whatsappMessage =
                `Hello Migel Photography 👋\n\n` +
                `I would like to make an enquiry.\n\n` +
                `Name: ${name}\n` +
                `Email: ${email || "Not provided"}\n\n` +
                `Message:\n${message}`;


            const encodedMessage =
                encodeURIComponent(whatsappMessage);


            const whatsappURL =
                `https://wa.me/254792544527?text=${encodedMessage}`;


            window.open(
                whatsappURL,
                "_blank",
                "noopener,noreferrer"
            );

        });

    }


    /* -----------------------------------------------------
       7. WHATSAPP BUTTON TRACKING / FEEDBACK
       ----------------------------------------------------- */

    document.querySelectorAll(
        'a[href*="wa.me"]'
    ).forEach(button => {

        button.addEventListener("click", () => {

            button.classList.add("clicked");

            setTimeout(() => {
                button.classList.remove("clicked");
            }, 500);

        });

    });


    /* -----------------------------------------------------
       8. CURRENT YEAR
       ----------------------------------------------------- */

    document.querySelectorAll(
        "[data-year]"
    ).forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });


    /* -----------------------------------------------------
       9. ACTIVE NAVIGATION SECTION
       ----------------------------------------------------- */

    const sections =
        document.querySelectorAll("section[id]");

    const navigationLinks =
        document.querySelectorAll(
            'nav a[href^="#"]'
        );


    if (
        sections.length > 0 &&
        navigationLinks.length > 0 &&
        "IntersectionObserver" in window
    ) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) return;

                        navigationLinks.forEach(link => {
                            link.classList.remove("active");
                        });

                        const activeLink =
                            document.querySelector(
                                `nav a[href="#${entry.target.id}"]`
                            );

                        if (activeLink) {
                            activeLink.classList.add("active");
                        }

                    });

                },
                {
                    threshold: 0.35
                }
            );


        sections.forEach(section => {
            sectionObserver.observe(section);
        });

    }


    /* -----------------------------------------------------
       10. PREVENT BROKEN IMAGES FROM LOOKING UGLY
       ----------------------------------------------------- */

    document.querySelectorAll("img").forEach(image => {

        image.addEventListener("error", () => {

            image.classList.add("image-error");

            image.alt =
                "Migel Photography image unavailable";

        });

    });

});
