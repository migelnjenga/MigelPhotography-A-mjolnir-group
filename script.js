/* =========================================================
   MIGEL PHOTOGRAPHY - MAIN JAVASCRIPT
   VERCEL-SAFE / PRODUCTION VERSION
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

                        // Stop observing once animation has happened
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
        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        nav.appendChild(menuButton);

        menuButton.addEventListener("click", () => {

            const isOpen =
                navLinks.classList.toggle("active");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuButton.classList.toggle(
                "active",
                isOpen
            );

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

    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );

    updateHeader();


    /* -----------------------------------------------------
       4. SMOOTH SCROLLING
       ----------------------------------------------------- */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                function (event) {

                    const targetID =
                        this.getAttribute("href");

                    if (
                        !targetID ||
                        targetID === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetID
                        );

                    if (!target) return;

                    event.preventDefault();

                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;

                    const targetPosition =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        headerHeight -
                        15;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                    });

                }
            );

        });


    /* -----------------------------------------------------
       5. PORTFOLIO IMAGE LIGHTBOX
       VERCEL-SAFE VERSION
       ----------------------------------------------------- */

    const galleryImages =
        document.querySelectorAll(".gallery img");

    if (galleryImages.length > 0) {

        /* -----------------------------------------------
           CREATE LIGHTBOX
           ----------------------------------------------- */

        const lightbox =
            document.createElement("div");

        lightbox.className = "lightbox";

        lightbox.innerHTML = `
            <button
                class="lightbox-close"
                aria-label="Close image"
                type="button"
            >
                &times;
            </button>

            <button
                class="lightbox-prev"
                aria-label="Previous image"
                type="button"
            >
                &#10094;
            </button>

            <div class="lightbox-content">

                <div
                    class="lightbox-loading"
                    aria-hidden="true"
                >
                    Loading...
                </div>

                <img
                    class="lightbox-image"
                    src=""
                    alt="Portfolio image"
                    decoding="async"
                >

                <div
                    class="lightbox-error"
                    aria-hidden="true"
                >
                    <span>
                        This image could not be loaded.
                    </span>
                    <button
                        class="lightbox-retry"
                        type="button"
                    >
                        Try Again
                    </button>
                </div>

            </div>

            <button
                class="lightbox-next"
                aria-label="Next image"
                type="button"
            >
                &#10095;
            </button>

            <div class="lightbox-counter"></div>
        `;

        document.body.appendChild(lightbox);


        /* -----------------------------------------------
           GET LIGHTBOX ELEMENTS
           ----------------------------------------------- */

        const lightboxImage =
            lightbox.querySelector(
                ".lightbox-image"
            );

        const closeButton =
            lightbox.querySelector(
                ".lightbox-close"
            );

        const previousButton =
            lightbox.querySelector(
                ".lightbox-prev"
            );

        const nextButton =
            lightbox.querySelector(
                ".lightbox-next"
            );

        const counter =
            lightbox.querySelector(
                ".lightbox-counter"
            );

        const loadingMessage =
            lightbox.querySelector(
                ".lightbox-loading"
            );

        const errorMessage =
            lightbox.querySelector(
                ".lightbox-error"
            );

        const retryButton =
            lightbox.querySelector(
                ".lightbox-retry"
            );


        /* -----------------------------------------------
           STATE
           ----------------------------------------------- */

        let currentImage = 0;

        let currentImageURL = "";

        let isLoading = false;


        /* -----------------------------------------------
           GET RELIABLE IMAGE URL
           
           Important for Vercel:
           We use the browser-resolved absolute URL
           from the actual gallery image.
           ----------------------------------------------- */

        function getImageURL(image) {

            if (!image) return "";

            /*
             * currentSrc is preferred because browsers may
             * choose the correct responsive image.
             */
            const source =
                image.currentSrc ||
                image.src ||
                image.getAttribute("src");

            if (!source) return "";

            /*
             * Convert relative paths into an absolute URL.
             * This makes the lightbox independent of whether
             * the site is running on GitHub Pages, Vercel,
             * localhost, or another domain.
             */
            try {

                return new URL(
                    source,
                    document.baseURI
                ).href;

            } catch (error) {

                console.error(
                    "Migel Photography: Invalid image URL",
                    source,
                    error
                );

                return source;
            }

        }


        /* -----------------------------------------------
           SHOW / HIDE LOADING
           ----------------------------------------------- */

        function showLoading() {

            isLoading = true;

            if (loadingMessage) {

                loadingMessage.style.display =
                    "block";

            }

            if (errorMessage) {

                errorMessage.style.display =
                    "none";

            }

            lightboxImage.style.display =
                "none";

        }


        function hideLoading() {

            isLoading = false;

            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }

            lightboxImage.style.display =
                "block";

        }


        /* -----------------------------------------------
           SHOW ERROR
           ----------------------------------------------- */

        function showImageError() {

            isLoading = false;

            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }

            lightboxImage.style.display =
                "none";

            if (errorMessage) {

                errorMessage.style.display =
                    "flex";

            }

            console.error(
                "Migel Photography: Unable to load image:",
                currentImageURL
            );

        }


        /* -----------------------------------------------
           HIDE ERROR
           ----------------------------------------------- */

        function hideImageError() {

            if (errorMessage) {

                errorMessage.style.display =
                    "none";

            }

        }


        /* -----------------------------------------------
           LOAD IMAGE
           ----------------------------------------------- */

        function loadLightboxImage(
            image,
            retry = false
        ) {

            if (!image) return;

            const imageURL =
                getImageURL(image);

            if (!imageURL) {

                showImageError();

                return;

            }

            currentImageURL =
                imageURL;

            showLoading();

            hideImageError();


            /*
             * Don't directly depend on the gallery image
             * finishing its own loading event.
             *
             * Create a separate Image object so the lightbox
             * can reliably detect success/failure.
             */

            const preloader =
                new Image();

            preloader.decoding = "async";


            preloader.onload = () => {

                /*
                 * Ignore an old request if the user has
                 * already moved to another photograph.
                 */
                if (
                    currentImageURL !==
                    imageURL
                ) {
                    return;
                }

                lightboxImage.src =
                    imageURL;

                lightboxImage.alt =
                    image.alt ||
                    "Migel Photography portfolio image";

                hideLoading();

            };


            preloader.onerror = () => {

                /*
                 * If this is a Vercel/static-hosting
                 * path problem, log the exact URL.
                 */
                console.error(
                    "Migel Photography: Image failed to load.",
                    {
                        requestedURL: imageURL,
                        pageURL: window.location.href,
                        imageElement: image
                    }
                );

                /*
                 * Don't immediately retry forever.
                 */
                if (!retry) {

                    showImageError();

                } else {

                    showImageError();

                }

            };


            /*
             * Start loading.
             */
            preloader.src = imageURL;

        }


        /* -----------------------------------------------
           SHOW IMAGE
           ----------------------------------------------- */

        function showImage(index) {

            if (index < 0) {

                index =
                    galleryImages.length - 1;

            }

            if (
                index >=
                galleryImages.length
            ) {

                index = 0;

            }

            currentImage =
                index;

            const image =
                galleryImages[currentImage];

            counter.textContent =
                `${currentImage + 1} / ${galleryImages.length}`;

            loadLightboxImage(image);

        }


        /* -----------------------------------------------
           OPEN LIGHTBOX
           ----------------------------------------------- */

        function openLightbox(index) {

            showImage(index);

            lightbox.classList.add("active");

            document.body.classList.add(
                "lightbox-open"
            );

        }


        /* -----------------------------------------------
           CLOSE LIGHTBOX
           ----------------------------------------------- */

        function closeLightbox() {

            lightbox.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "lightbox-open"
            );

            isLoading = false;

            /*
             * Don't leave the large original image
             * occupying memory after closing.
             */
            setTimeout(() => {

                if (
                    !lightbox.classList.contains(
                        "active"
                    )
                ) {

                    lightboxImage.removeAttribute(
                        "src"
                    );

                    lightboxImage.style.display =
                        "none";

                    hideImageError();

                    if (loadingMessage) {

                        loadingMessage.style.display =
                            "none";

                    }

                }

            }, 300);

        }


        /* -----------------------------------------------
           GALLERY CLICK EVENTS
           ----------------------------------------------- */

        galleryImages.forEach(
            (image, index) => {

                image.style.cursor =
                    "zoom-in";

                image.addEventListener(
                    "click",
                    () => {

                        openLightbox(index);

                    }
                );

            }
        );


        /* -----------------------------------------------
           CLOSE BUTTON
           ----------------------------------------------- */

        closeButton.addEventListener(
            "click",
            closeLightbox
        );


        /* -----------------------------------------------
           PREVIOUS IMAGE
           ----------------------------------------------- */

        previousButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showImage(
                    currentImage - 1
                );

            }
        );


        /* -----------------------------------------------
           NEXT IMAGE
           ----------------------------------------------- */

        nextButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showImage(
                    currentImage + 1
                );

            }
        );


        /* -----------------------------------------------
           RETRY FAILED IMAGE
           ----------------------------------------------- */

        if (retryButton) {

            retryButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const image =
                        galleryImages[
                            currentImage
                        ];

                    loadLightboxImage(
                        image,
                        true
                    );

                }
            );

        }


        /* -----------------------------------------------
           CLOSE WHEN CLICKING DARK BACKGROUND
           ----------------------------------------------- */

        lightbox.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    lightbox
                ) {

                    closeLightbox();

                }

            }
        );


        /* -----------------------------------------------
           KEYBOARD CONTROLS
           ----------------------------------------------- */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    !lightbox.classList.contains(
                        "active"
                    )
                ) {
                    return;
                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    closeLightbox();

                    return;

                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    showImage(
                        currentImage - 1
                    );

                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    showImage(
                        currentImage + 1
                    );

                }

            }
        );


        /* -----------------------------------------------
           PREVENT LIGHTBOX SCROLL ISSUES
           ----------------------------------------------- */

        lightbox.addEventListener(
            "wheel",
            event => {

                if (
                    lightbox.classList.contains(
                        "active"
                    )
                ) {

                    event.stopPropagation();

                }

            },
            {
                passive: true
            }
        );

    }


    /* -----------------------------------------------------
       6. CONTACT FORM → WHATSAPP
       ----------------------------------------------------- */

    const contactForm =
        document.querySelector(
            "#contact form"
        );

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            event => {

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
                    nameInput
                        ? nameInput.value.trim()
                        : "";


                const email =
                    emailInput
                        ? emailInput.value.trim()
                        : "";


                const message =
                    messageInput
                        ? messageInput.value.trim()
                        : "";


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
                    encodeURIComponent(
                        whatsappMessage
                    );


                const whatsappURL =
                    `https://wa.me/254792544527?text=${encodedMessage}`;


                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    /* -----------------------------------------------------
       7. WHATSAPP BUTTON TRACKING / FEEDBACK
       ----------------------------------------------------- */

    document
        .querySelectorAll(
            'a[href*="wa.me"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    button.classList.add(
                        "clicked"
                    );

                    setTimeout(() => {

                        button.classList.remove(
                            "clicked"
                        );

                    }, 500);

                }
            );

        });


    /* -----------------------------------------------------
       8. CURRENT YEAR
       ----------------------------------------------------- */

    document
        .querySelectorAll(
            "[data-year]"
        )
        .forEach(element => {

            element.textContent =
                new Date().getFullYear();

        });


    /* -----------------------------------------------------
       9. ACTIVE NAVIGATION SECTION
       ----------------------------------------------------- */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );

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

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }


                            navigationLinks.forEach(
                                link => {

                                    link.classList.remove(
                                        "active"
                                    );

                                }
                            );


                            const activeLink =
                                document.querySelector(
                                    `nav a[href="#${entry.target.id}"]`
                                );


                            if (activeLink) {

                                activeLink.classList.add(
                                    "active"
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.35
                }
            );


        sections.forEach(
            section => {

                sectionObserver.observe(
                    section
                );

            }
        );

    }


    /* -----------------------------------------------------
       10. IMAGE ERROR HANDLING
       
       IMPORTANT:
       Don't change the image ALT text to an error message.
       ALT text is not meant to be used as an error display.
       ----------------------------------------------------- */

    document
        .querySelectorAll("img")
        .forEach(image => {

            image.addEventListener(
                "error",
                () => {

                    /*
                     * Only mark the image as broken.
                     * Keep the original alt text.
                     */
                    image.classList.add(
                        "image-error"
                    );

                    console.error(
                        "Migel Photography: Image failed:",
                        image.currentSrc ||
                        image.src
                    );

                }
            );

        });


    /* -----------------------------------------------------
       11. PREVENT EMPTY IMAGE ERRORS
       ----------------------------------------------------- */

    /*
     * The lightbox starts with no image.
     *
     * Using removeAttribute("src") when closed means the
     * browser doesn't try to request an empty image URL.
     */


    /* -----------------------------------------------------
       12. FINAL DEBUG INFORMATION
       ----------------------------------------------------- */

    console.log(
        "Migel Photography website initialized successfully."
    );

    console.log(
        `Portfolio images detected: ${galleryImages.length}`
    );

});
