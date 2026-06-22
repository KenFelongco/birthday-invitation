const EVENT_DATE = new Date("2026-06-24T19:00:00+08:00").getTime();
const countdownFields = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
};
const openingScreen = document.getElementById("opening-screen");
const backgroundMusic = document.getElementById("background-music");
const musicPlayer = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const musicVolume = document.getElementById("music-volume");
const INITIAL_MUSIC_VOLUME = 0.5;
let musicUserPaused = false;

function updateMusicToggleState() {
    if (!backgroundMusic || !musicToggle) {
        return;
    }

    const isPaused = backgroundMusic.paused;
    musicToggle.classList.toggle("is-paused", isPaused);
    musicToggle.setAttribute("aria-label", isPaused ? "Play music" : "Pause music");
    musicToggle.setAttribute("aria-pressed", String(!isPaused));
}

function setMusicVolume(value) {
    if (!backgroundMusic) {
        return;
    }

    backgroundMusic.volume = Math.min(Math.max(value, 0), 1);
}

function playBackgroundMusic(force = false) {
    if (!backgroundMusic) {
        return Promise.resolve(false);
    }

    if (musicUserPaused && !force) {
        return Promise.resolve(false);
    }

    backgroundMusic.muted = false;
    backgroundMusic.autoplay = true;

    const playPromise = backgroundMusic.play();

    if (!playPromise) {
        updateMusicToggleState();
        return Promise.resolve(true);
    }

    return playPromise
        .then(() => {
            musicPlayer?.classList.remove("is-blocked");
            updateMusicToggleState();
            return true;
        })
        .catch(() => {
            musicPlayer?.classList.add("is-blocked");
            updateMusicToggleState();
            return false;
        });
}

function requestMusicAfterInteraction(event) {
    if (event?.target && musicPlayer?.contains(event.target)) {
        return;
    }

    playBackgroundMusic();
}

if (backgroundMusic) {
    setMusicVolume(INITIAL_MUSIC_VOLUME);
    backgroundMusic.muted = false;
    backgroundMusic.autoplay = true;

    backgroundMusic.addEventListener("play", updateMusicToggleState);
    backgroundMusic.addEventListener("pause", updateMusicToggleState);
    backgroundMusic.addEventListener("volumechange", updateMusicToggleState);
    backgroundMusic.addEventListener("loadeddata", () => playBackgroundMusic(), { once: true });
    backgroundMusic.addEventListener("canplay", () => playBackgroundMusic(), { once: true });

    playBackgroundMusic();
    [120, 600, 1400].forEach((delay) => {
        window.setTimeout(() => playBackgroundMusic(), delay);
    });

    document.addEventListener("DOMContentLoaded", () => playBackgroundMusic(), { once: true });
    window.addEventListener("load", () => playBackgroundMusic(), { once: true });
    window.addEventListener("pageshow", () => playBackgroundMusic(), { once: true });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            playBackgroundMusic();
        }
    });

    ["pointerdown", "keydown"].forEach((eventName) => {
        document.addEventListener(eventName, requestMusicAfterInteraction, { once: true });
    });
}

if (musicToggle && backgroundMusic) {
    musicToggle.addEventListener("click", () => {
        if (backgroundMusic.paused) {
            musicUserPaused = false;
            playBackgroundMusic(true);
        } else {
            musicUserPaused = true;
            backgroundMusic.pause();
        }
    });
}

if (musicVolume) {
    musicVolume.value = String(INITIAL_MUSIC_VOLUME * 100);
    musicVolume.addEventListener("input", () => {
        setMusicVolume(Number(musicVolume.value) / 100);
    });
}

function hideOpeningScreen() {
    if (!openingScreen) {
        return;
    }

    openingScreen.classList.add("hidden");
    window.setTimeout(() => {
        openingScreen.remove();
    }, 700);
}

window.addEventListener("load", () => {
    window.setTimeout(hideOpeningScreen, 2600);
});

window.setTimeout(hideOpeningScreen, 4200);

function padTime(value) {
    return String(value).padStart(2, "0");
}

function updateCountdown() {
    const remaining = Math.max(EVENT_DATE - Date.now(), 0);
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownFields.days.textContent = padTime(days);
    countdownFields.hours.textContent = padTime(hours);
    countdownFields.minutes.textContent = padTime(minutes);
    countdownFields.seconds.textContent = padTime(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const siteHeader = document.querySelector(".site-header");
const navMenu = document.getElementById("primary-nav");
const menuToggle = document.querySelector(".menu-toggle");
const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
const scrollSections = navAnchors
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
let navTicking = false;

function closeMobileMenu() {
    if (!navMenu || !menuToggle) {
        return;
    }

    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-open");
}

function toggleMobileMenu() {
    if (!navMenu || !menuToggle) {
        return;
    }

    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", isOpen);
}

function setActiveNav(sectionId) {
    navAnchors.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
    });
}

function updateHeaderState() {
    if (siteHeader) {
        siteHeader.classList.toggle("scrolled", window.scrollY > 12);
    }

    const offset = (siteHeader?.offsetHeight || 0) + 90;
    let currentSection = "home";

    scrollSections.forEach((section) => {
        if (section.offsetTop - offset <= window.scrollY) {
            currentSection = section.id;
        }
    });

    setActiveNav(currentSection);
    navTicking = false;
}

function requestHeaderUpdate() {
    if (!navTicking) {
        window.requestAnimationFrame(updateHeaderState);
        navTicking = true;
    }
}

if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
}

navAnchors.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
});

document.querySelector(".rsvp-button")?.addEventListener("click", closeMobileMenu);

document.addEventListener("click", (event) => {
    if (!siteHeader || !navMenu || !navMenu.classList.contains("open")) {
        return;
    }

    if (!siteHeader.contains(event.target)) {
        closeMobileMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
        closeMobileMenu();
    }

    requestHeaderUpdate();
});

window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
updateHeaderState();

const revealTargets = Array.from(document.querySelectorAll(
    ".about-layout, .countdown-card, .details-inner, .detail-item, .schedule-inner, .timeline-item, .gallery-inner, .rsvp-inner, .footer-inner"
));

revealTargets.forEach((target, index) => {
    target.classList.add("scroll-reveal");
    target.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
});

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16 });

    revealTargets.forEach((target) => revealObserver.observe(target));
} else {
    revealTargets.forEach((target) => target.classList.add("visible"));
}

const galleryTrack = document.getElementById("gallery-track");
const gallerySlides = Array.from(document.querySelectorAll(".gallery-slide"));
const galleryPrev = document.getElementById("gallery-prev");
const galleryNext = document.getElementById("gallery-next");
const galleryDots = document.getElementById("gallery-dots");
let galleryIndex = 0;
let galleryTimer;

function showGallerySlide(index) {
    galleryIndex = (index + gallerySlides.length) % gallerySlides.length;
    galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;

    gallerySlides.forEach((slide, slideIndex) => {
        slide.setAttribute("aria-hidden", String(slideIndex !== galleryIndex));
    });

    Array.from(galleryDots.children).forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === galleryIndex);
        dot.setAttribute("aria-current", dotIndex === galleryIndex ? "true" : "false");
    });
}

function startGalleryLoop() {
    clearInterval(galleryTimer);
    galleryTimer = setInterval(() => {
        showGallerySlide(galleryIndex + 1);
    }, 4200);
}

if (galleryTrack && gallerySlides.length && galleryPrev && galleryNext && galleryDots) {
    gallerySlides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "gallery-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Show gallery photo ${index + 1}`);
        dot.addEventListener("click", () => {
            showGallerySlide(index);
            startGalleryLoop();
        });
        galleryDots.appendChild(dot);
    });

    galleryPrev.addEventListener("click", () => {
        showGallerySlide(galleryIndex - 1);
        startGalleryLoop();
    });

    galleryNext.addEventListener("click", () => {
        showGallerySlide(galleryIndex + 1);
        startGalleryLoop();
    });

    showGallerySlide(0);
    startGalleryLoop();
}

const rsvpForm = document.getElementById("rsvp-form");
const rsvpStatus = document.getElementById("rsvp-status");

if (rsvpForm && rsvpStatus) {
    rsvpForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(rsvpForm);
        const name = String(formData.get("guest-name") || "Guest").trim();
        const attendance = formData.get("attendance");

        rsvpStatus.textContent = attendance === "Yes"
            ? `Thank you, ${name}. Your RSVP has been noted.`
            : `Thank you, ${name}. Your response has been noted.`;
        rsvpForm.reset();
    });
}

