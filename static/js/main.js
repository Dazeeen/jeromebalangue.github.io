// Portfolio navigation, page transitions, and motion effects.
const PrintWebGLViewer = window.Print3D?.PrintWebGLViewer;
const navToggle = document.querySelector(".nav-toggle");
const sidebar = document.querySelector(".toc-sidebar");
const sidebarNav = sidebar.querySelector(".toc-sidebar__nav");
const scrim = document.querySelector(".toc-scrim");
const navLabel = navToggle.querySelector(".sr-only");
const pageViews = [...document.querySelectorAll(".page-view")];
const pageLinks = [...sidebar.querySelectorAll('a[href^="#"]')];
const pageJumpLinks = [...document.querySelectorAll("[data-page-jump]")];
const mobileSidebar = window.matchMedia("(max-width: 720px)");
const portfolioCharacters = [...document.querySelectorAll(".portfolio-title__character")];
const portfolioCursor = document.querySelector(".portfolio-title__cursor");
const aboutCopy = document.querySelector(".about-section__copy");
const educationSection = document.querySelector(".education-section");
const educationTimeline = document.querySelector(".education-timeline");
const educationTimelineItems = [...document.querySelectorAll(".education-timeline__item")];
const educationExitCue = document.querySelector("[data-education-exit-cue]");
const educationExitMessage = document.querySelector("[data-education-exit-message]");
const socialSection = document.querySelector(".social-section");
const socialFilters = document.querySelector("[data-social-filters]");
const socialCarouselStage = document.querySelector(".social-carousel__stage");
let socialSlides = [];
let socialFilterButtons = [];
const socialPreviousButton = document.querySelector(".social-carousel__control--previous");
const socialNextButton = document.querySelector(".social-carousel__control--next");
const socialCurrentNumber = document.querySelector("[data-social-current]");
const socialTotalNumber = document.querySelector("[data-social-total]");
const socialLightbox = document.querySelector(".social-lightbox");
const socialLightboxImage = document.querySelector(".social-lightbox__image");
const socialLightboxCaption = document.querySelector("[data-social-lightbox-caption]");
const socialLightboxCurrent = document.querySelector("[data-social-lightbox-current]");
const socialLightboxTotal = document.querySelector("[data-social-lightbox-total]");
const socialLightboxClose = document.querySelector(".social-lightbox__close");
const socialLightboxBackdrop = document.querySelector(".social-lightbox__backdrop");
const socialLightboxPrevious = document.querySelector(".social-lightbox__control--previous");
const socialLightboxNext = document.querySelector(".social-lightbox__control--next");
const printSection = document.querySelector(".print-section");
const printObjects = [...document.querySelectorAll(".print-object")];
const printViewer = document.querySelector(".print-viewer");
const printViewerTitle = document.querySelector(".print-viewer__title");
const printViewerStage = document.querySelector(".print-viewer__stage");
const printViewerCanvas = document.querySelector(".print-viewer__webgl");
const printViewerRotator = document.querySelector(".print-viewer__rotator");
const printViewerModel = document.querySelector(".print-viewer__model");
const printViewerFront = document.querySelector(".print-viewer__image--front");
const printViewerBack = document.querySelector(".print-viewer__image--back");
const printViewerClose = document.querySelector(".print-viewer__close");
const printViewerBackdrop = document.querySelector(".print-viewer__backdrop");
const printViewerReset = document.querySelector(".print-viewer__reset");
const aiSection = document.querySelector(".ai-section");
const aiAmbient = document.querySelector("[data-ai-ambient]");
const aiGallery = document.querySelector("[data-ai-gallery]");
const aiGalleryStatus = document.querySelector("[data-ai-gallery-status]");
const aiViewer = document.querySelector(".ai-viewer");
const aiViewerImage = document.querySelector(".ai-viewer__image");
const aiViewerCaption = document.querySelector("[data-ai-viewer-caption]");
const aiViewerClose = document.querySelector(".ai-viewer__close");
const videoSection = document.querySelector(".video-section");
const videoCategoriesNav = document.querySelector("[data-video-categories]");
const videoGallery = document.querySelector("[data-video-gallery]");
const videoCategoryName = document.querySelector("[data-video-category-name]");
const videoCategoryCount = document.querySelector("[data-video-category-count]");
const videoCinema = document.querySelector("[data-video-cinema]");
const videoPreviousButton = document.querySelector("[data-video-previous]");
const videoNextButton = document.querySelector("[data-video-next]");
const videoCurrentNumber = document.querySelector("[data-video-current]");
const videoDetail = document.querySelector("[data-video-detail]");
const videoDetailVideo = document.querySelector("[data-video-detail-video]");
const videoDetailTitle = document.querySelector("[data-video-detail-title]");
const videoDetailCategory = document.querySelector("[data-video-detail-category]");
const videoWatchButton = document.querySelector("[data-video-watch]");
const videoDetailCloseButton = document.querySelector("[data-video-detail-close]");
const contactForm = document.querySelector("[data-contact-form]");
const contactFormStatus = document.querySelector("[data-contact-status]");
const contactFormSubmit = contactForm?.querySelector('button[type="submit"]');
const contactFormSubmitLabel = document.querySelector("[data-contact-submit-label]");
const contactMailerCapabilityFrame = document.querySelector('iframe[name="contact-mailer-capability-frame"]');
const contactAttachmentInput = document.querySelector("[data-contact-attachment]");
const contactAttachmentDropzone = document.querySelector("[data-contact-dropzone]");
const contactAttachmentStatus = document.querySelector("[data-contact-attachment-status]");
const contactAttachmentList = document.querySelector("[data-contact-attachment-list]");
const contactAttachmentsJson = document.querySelector("[data-contact-attachments-json]");
const contactUploadProgress = document.querySelector("[data-contact-upload-progress]");
const contactUploadProgressLabel = document.querySelector("[data-contact-upload-progress-label]");
const contactUploadProgressPercent = document.querySelector("[data-contact-upload-progress-percent]");
const contactUploadProgressTrack = document.querySelector("[data-contact-upload-progress-track]");
const contactUploadProgressBar = document.querySelector("[data-contact-upload-progress-bar]");
const reviewForm = document.querySelector("[data-review-form]");
const reviewFormStatus = document.querySelector("[data-review-form-status]");
const reviewFormSubmit = reviewForm?.querySelector('button[type="submit"]');
const reviewFormSubmitLabel = document.querySelector("[data-review-submit-label]");
const reviewsDataFrame = document.querySelector("[data-reviews-data-frame]");
const reviewList = document.querySelector("[data-review-list]");
const reviewCount = document.querySelector("[data-review-count]");
const homeReviewTrack = document.querySelector("[data-home-review-track]");
const siteToastStack = document.querySelector("[data-site-toast-stack]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const CONTACT_SITE_ORIGIN = "https://jeromebalangue.github.io";
const CONTACT_MAILER_SOURCE = "jerome-portfolio-contact-mailer";
const CONTACT_MAILER_TIMEOUT_MS = 45000;
const CONTACT_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
const CONTACT_ATTACHMENT_MAX_COUNT = 10;
const CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const REVIEW_FORM_TIMEOUT_MS = 45000;
const SITE_TOAST_MAX_COUNT = 3;
const SITE_TOAST_DEFAULT_DURATION_MS = 6000;
const CONTACT_ATTACHMENT_DEFAULT_MESSAGE = "Up to 10 documents · 5 MB each · 20 MB total";
const CONTACT_DOCUMENT_TYPES = Object.freeze({
    pdf: { mimeType: "application/pdf", accepted: ["application/pdf"] },
    docx: {
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        accepted: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    },
    xlsx: {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        accepted: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
    },
    pptx: {
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        accepted: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"]
    },
    odt: { mimeType: "application/vnd.oasis.opendocument.text", accepted: ["application/vnd.oasis.opendocument.text"] },
    ods: { mimeType: "application/vnd.oasis.opendocument.spreadsheet", accepted: ["application/vnd.oasis.opendocument.spreadsheet"] },
    odp: { mimeType: "application/vnd.oasis.opendocument.presentation", accepted: ["application/vnd.oasis.opendocument.presentation"] },
    rtf: { mimeType: "application/rtf", accepted: ["application/rtf", "text/rtf", "application/x-rtf"] },
    txt: { mimeType: "text/plain", accepted: ["text/plain"] },
    csv: { mimeType: "text/csv", accepted: ["text/csv", "application/vnd.ms-excel"] }
});
const CONTACT_GENERIC_DOCUMENT_MIME_TYPES = ["application/octet-stream", "application/zip", ""];
let lastTypedCharacter = null;
let aboutRevealFrame = null;
let educationTimelineFrame = null;
let educationLineProgress = 0;
let socialRevealFrame = null;
let socialActiveIndex = 0;
let socialActiveCategory = "all";
let socialDragPointerId = null;
let socialDragStartX = 0;
let socialDragStartY = 0;
let socialDragStartIndex = 0;
let socialDragStepDistance = 1;
let socialDragAxis = null;
let socialDragSuppressClick = false;
let socialLightboxIndex = 0;
let socialLightboxOpener = null;
let printViewerOpener = null;
let printWebGLViewer = null;
let printRotationX = -8;
let printRotationY = -18;
let contactMailerCapabilityProbePending = false;
let contactDocumentAttachmentsEnabled = false;
let printDragPointerId = null;
let printDragStartX = 0;
let printDragStartY = 0;
let printDragStartRotationX = 0;
let printDragStartRotationY = 0;
let aiImages = [];
let aiViewerOpener = null;
let aiViewerAnimation = null;
let aiViewerCloseTimer = null;
let aiGalleryResizeObserver = null;
let aiFloatImageDeck = [];
let aiFloatSequenceToken = 0;
let aiFloatResizeTimer = null;
let videoCategories = [];
let videoCategoryButtons = [];
let videoActiveCategoryId = "";
let videoActiveIndex = 0;
let videoPosterButtons = [];
let videoMode = "rail";
let videoDetailSource = null;
let videoDetailAnimation = null;
let requestedVideoCategoryId = "";
const aiCardEntries = new WeakMap();
const aiFloatSequenceTimers = new Set();
const aiFloatCardStates = new Map();
const educationRevealTimers = new Set();
let wheelDelta = 0;
let wheelResetTimer = null;
let pageNavigationLocked = false;
let contactMailerTimeout = null;
let contactStatusToast = null;
let contactSelectedAttachments = [];
let contactUploadProgressResetTimer = null;
let reviewFormTimeout = null;
let reviewStatusToast = null;
let reviewServiceReady = false;
let educationExitArmed = false;
let educationExitDirection = 0;
let educationExitConfirmationReady = false;
let educationExitConfirmationGestureActive = false;
let educationExitGestureTimer = null;

const WHEEL_NAVIGATION_THRESHOLD = 40;
const PAGE_NAVIGATION_LOCK_MS = 650;
const EDUCATION_EXIT_GESTURE_PAUSE_MS = 220;
const EDUCATION_REVEAL_POINT = 0.68;
const SOCIAL_DRAG_INTENT_THRESHOLD = 7;
const SOCIAL_GALLERY_MANIFEST_URL = "static/media/images/social-media-designs/gallery.json";
const AI_GALLERY_MANIFEST_URL = "static/media/images/AI_generated_design/gallery.json";
const VIDEO_GALLERY_MANIFEST_URL = "static/media/videos/gallery.json";
const AI_FLOAT_FADE_MS = 760;

if (printViewerCanvas) {
    try {
        printWebGLViewer = new PrintWebGLViewer(printViewerCanvas);
    } catch (error) {
        console.warn("WebGL 3D viewer could not be initialized.", error);
    }
}

const positionPortfolioCursor = (character) => {
    const cursorPosition = character ? character.offsetLeft + character.offsetWidth : 0;
    portfolioCursor.style.left = `${cursorPosition}px`;
};

const startPortfolioTyping = () => {
    if (reducedMotion.matches) {
        portfolioCharacters.forEach((character) => character.classList.add("is-typed"));
        return;
    }

    let characterIndex = 0;

    const typeNextCharacter = () => {
        if (characterIndex >= portfolioCharacters.length) return;

        lastTypedCharacter = portfolioCharacters[characterIndex];
        lastTypedCharacter.classList.add("is-typed");
        requestAnimationFrame(() => positionPortfolioCursor(lastTypedCharacter));
        characterIndex += 1;

        if (characterIndex === portfolioCharacters.length) {
            window.setTimeout(() => portfolioCursor.classList.add("is-finished"), 2000);
        } else {
            window.setTimeout(typeNextCharacter, 260);
        }
    };

    window.setTimeout(typeNextCharacter, 1500);
};

if (document.readyState === "complete") {
    startPortfolioTyping();
} else {
    window.addEventListener("load", startPortfolioTyping, { once: true });
}

window.addEventListener("resize", () => positionPortfolioCursor(lastTypedCharacter));

const syncSidebarAvailability = () => {
    const isHiddenMobileMenu = mobileSidebar.matches && sidebar.dataset.open !== "true";
    sidebar.inert = isHiddenMobileMenu;
    sidebar.setAttribute("aria-hidden", String(isHiddenMobileMenu));
};

const setSidebarOpen = (isOpen) => {
    sidebar.dataset.open = String(isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navLabel.textContent = isOpen ? "Close table of contents" : "Open table of contents";
    document.body.classList.toggle("nav-open", isOpen);
    syncSidebarAvailability();
};

const legacyPageAliases = {
    "video-edited": "video-editing",
    "trend-editing": "video-editing",
    "editing-project": "video-editing"
};
const legacyVideoCategories = {
    "video-edited": "app-promotional-video",
    "trend-editing": "trend-editing",
    "editing-project": "editing-project"
};
const resolvePageId = (pageId) => legacyPageAliases[pageId] || pageId;
const pageExists = (pageId) => pageViews.some((view) => view.dataset.page === resolvePageId(pageId));
const pageNavigationOrder = pageLinks
    .map((link) => resolvePageId(link.getAttribute("href").slice(1)))
    .filter((pageId, index, pageIds) => pageExists(pageId) && pageIds.indexOf(pageId) === index);
const pageTitles = {
    home: "Jerome Balangue | Portfolio",
    "about-me": "About Me | Jerome Balangue",
    education: "Education | Jerome Balangue",
    "social-media-design": "Social Media Designs | Jerome Balangue",
    "print-marketing-materials": "Print & Marketing Materials | Jerome Balangue",
    "ai-generated-design": "A.I. Generated Design | Jerome Balangue",
    "video-editing": "Video Editing | Jerome Balangue",
    "why-work-with-me": "Why Work With Me | Jerome Balangue",
    "contact-collaboration": "Contact & Collaboration | Jerome Balangue",
    reviews: "Reviews | Jerome Balangue"
};
const cleanPageUrl = `${window.location.pathname}${window.location.search}`;
const PAGE_SCROLL_EDGE_TOLERANCE = 1;

const setAboutCopyVisible = (isVisible) => {
    if (aboutRevealFrame !== null) {
        window.cancelAnimationFrame(aboutRevealFrame);
        aboutRevealFrame = null;
    }

    aboutCopy.classList.remove("is-in-view");
    if (!isVisible) return;

    // Start from the clipped, left-shifted state after About is visible.
    void aboutCopy.offsetWidth;
    aboutRevealFrame = window.requestAnimationFrame(() => {
        aboutCopy.classList.add("is-in-view");
        aboutRevealFrame = null;
    });
};

const clearEducationRevealTimers = () => {
    educationRevealTimers.forEach((timer) => window.clearTimeout(timer));
    educationRevealTimers.clear();
};

const revealEducationItemsAtCurrentScroll = () => {
    if (
        !educationSection ||
        !educationTimeline ||
        !educationSection.classList.contains("is-active")
    ) return;

    const sectionRect = educationSection.getBoundingClientRect();
    const scrollTop = educationSection.scrollTop;
    const viewportBottom = scrollTop + educationSection.clientHeight;
    const scrollLimit = getPageScrollLimit(educationSection);
    const isAtTimelineEnd = scrollTop >= scrollLimit - PAGE_SCROLL_EDGE_TOLERANCE;
    const revealPoint = isAtTimelineEnd
        ? viewportBottom
        : scrollTop + educationSection.clientHeight * EDUCATION_REVEAL_POINT;
    const newlyReachedItems = educationTimelineItems.filter((item) => {
        if (item.classList.contains("is-revealed") || item.classList.contains("is-reveal-pending")) {
            return false;
        }

        const axis = item.querySelector(".education-timeline__axis");
        const axisRect = axis.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const axisCenter = scrollTop + axisRect.top - sectionRect.top + axisRect.height / 2;
        const itemTop = scrollTop + itemRect.top - sectionRect.top;
        const itemBottom = itemTop + itemRect.height;
        const isInViewport = itemBottom >= scrollTop && itemTop <= viewportBottom;

        return isInViewport && axisCenter <= revealPoint;
    });

    newlyReachedItems.forEach((item, index) => {
        item.classList.add("is-reveal-pending");
        const timer = window.setTimeout(() => {
            item.classList.remove("is-reveal-pending");
            item.classList.add("is-revealed");
            educationRevealTimers.delete(timer);
        }, index * 180);
        educationRevealTimers.add(timer);
    });
};

const updateEducationTimeline = () => {
    educationTimelineFrame = null;
    if (
        !educationSection ||
        !educationTimeline ||
        !educationSection.classList.contains("is-active")
    ) return;

    if (reducedMotion.matches) {
        educationLineProgress = 1;
        educationTimeline.style.setProperty("--education-line-progress", "100%");
        educationTimelineItems.forEach((item) => item.classList.add("is-revealed"));
        return;
    }

    const revealPoint = educationSection.scrollTop
        + educationSection.clientHeight * EDUCATION_REVEAL_POINT;
    const timelineStart = educationTimeline.offsetTop;
    const drawableHeight = Math.max(1, educationTimeline.offsetHeight);
    const scrollLimit = getPageScrollLimit(educationSection);
    const isAtTimelineEnd = educationSection.scrollTop >= scrollLimit - PAGE_SCROLL_EDGE_TOLERANCE;
    const nextProgress = isAtTimelineEnd
        ? 1
        : Math.min(1, Math.max(0, (revealPoint - timelineStart) / drawableHeight));

    educationLineProgress = Math.max(educationLineProgress, nextProgress);
    educationTimeline.style.setProperty(
        "--education-line-progress",
        `${educationLineProgress * 100}%`
    );
    revealEducationItemsAtCurrentScroll();
};

const scheduleEducationTimelineUpdate = () => {
    if (educationTimelineFrame !== null) return;
    educationTimelineFrame = window.requestAnimationFrame(updateEducationTimeline);
};

const isEducationAtEnd = () => {
    if (!educationSection) return false;
    const scrollLimit = getPageScrollLimit(educationSection);
    return educationSection.scrollTop >= scrollLimit - PAGE_SCROLL_EDGE_TOLERANCE;
};

const isEducationAtStart = () => (
    Boolean(educationSection)
    && educationSection.scrollTop <= PAGE_SCROLL_EDGE_TOLERANCE
);

const isEducationAtExitEdge = (direction) => (
    direction < 0 ? isEducationAtStart() : direction > 0 && isEducationAtEnd()
);

const clearEducationExitGestureTimer = () => {
    if (educationExitGestureTimer === null) return;
    window.clearTimeout(educationExitGestureTimer);
    educationExitGestureTimer = null;
};

const scheduleEducationExitConfirmation = () => {
    clearEducationExitGestureTimer();
    educationExitGestureTimer = window.setTimeout(() => {
        educationExitGestureTimer = null;
        educationExitConfirmationGestureActive = false;
        educationExitConfirmationReady = educationExitArmed
            && document.body.dataset.page === "education"
            && isEducationAtExitEdge(educationExitDirection);
    }, EDUCATION_EXIT_GESTURE_PAUSE_MS);
};

const setEducationExitArmed = (direction = 0) => {
    const normalizedDirection = Math.sign(direction);
    if (normalizedDirection === 0) {
        clearEducationExitGestureTimer();
        educationExitArmed = false;
        educationExitDirection = 0;
        educationExitConfirmationReady = false;
        educationExitConfirmationGestureActive = false;
        educationExitCue?.classList.remove("is-visible");
        educationExitCue?.setAttribute("aria-hidden", "true");
        return;
    }

    if (educationExitArmed && educationExitDirection === normalizedDirection) return;
    clearEducationExitGestureTimer();
    educationExitArmed = true;
    educationExitDirection = normalizedDirection;
    educationExitConfirmationReady = false;
    educationExitConfirmationGestureActive = false;
    educationExitCue?.classList.toggle("is-up", normalizedDirection < 0);
    educationExitCue?.classList.add("is-visible");
    educationExitCue?.setAttribute("aria-hidden", "false");
    if (educationExitMessage) {
        educationExitMessage.textContent = normalizedDirection < 0
            ? "Scroll up again to return to About Me."
            : "Scroll down again to continue to Social Media Designs.";
    }
    scheduleEducationExitConfirmation();
};

const registerEducationExitWheel = (delta) => {
    if (!educationExitArmed) return;

    const direction = Math.sign(delta);
    if (direction === 0) return;
    if (direction !== educationExitDirection || !isEducationAtExitEdge(direction)) {
        setEducationExitArmed();
        return;
    }

    if (educationExitConfirmationReady) {
        educationExitConfirmationReady = false;
        educationExitConfirmationGestureActive = true;
    }
    scheduleEducationExitConfirmation();
};

const setEducationTimelineActive = (isActive) => {
    if (!educationTimeline) return;

    clearEducationRevealTimers();
    if (educationTimelineFrame !== null) {
        window.cancelAnimationFrame(educationTimelineFrame);
        educationTimelineFrame = null;
    }

    educationLineProgress = 0;
    educationTimeline.style.setProperty("--education-line-progress", "0%");
    educationTimelineItems.forEach((item) => {
        item.classList.remove("is-revealed", "is-reveal-pending");
    });

    if (!isActive) return;

    if (reducedMotion.matches) {
        updateEducationTimeline();
        return;
    }

    // Commit the empty state first so the vertical stroke visibly draws downward.
    void educationTimeline.offsetHeight;
    scheduleEducationTimelineUpdate();
};

const getFilteredSocialSlides = () => socialSlides.filter((slide) => {
    if (socialActiveCategory === "all") return true;
    return slide.dataset.socialCategory.split(" ").includes(socialActiveCategory);
});

const syncSocialSlideAspect = (slide) => {
    const image = slide.querySelector("img");
    if (!image?.naturalWidth || !image.naturalHeight) return;

    const aspectRatio = image.naturalWidth / image.naturalHeight;
    slide.style.setProperty("--social-aspect-ratio", `${image.naturalWidth} / ${image.naturalHeight}`);
    slide.classList.toggle("is-tall", aspectRatio < 0.68);
    slide.classList.toggle("is-square", aspectRatio >= 0.9 && aspectRatio <= 1.15);
    slide.classList.toggle("is-landscape", aspectRatio > 1.15);
};

const isSocialLightboxOpen = () => socialLightbox?.classList.contains("is-open");

const updateSocialLightbox = () => {
    const filteredSlides = getFilteredSocialSlides();
    const slideCount = filteredSlides.length;
    if (slideCount === 0) return;

    socialLightboxIndex = ((socialLightboxIndex % slideCount) + slideCount) % slideCount;
    const slide = filteredSlides[socialLightboxIndex];
    const image = slide.querySelector("img");

    socialLightboxImage.src = image.currentSrc || image.src;
    socialLightboxImage.alt = image.alt;
    socialLightboxImage.classList.remove("is-changing");
    void socialLightboxImage.offsetWidth;
    socialLightboxImage.classList.add("is-changing");
    socialLightboxCaption.textContent = image.alt;
    socialLightboxCurrent.textContent = String(socialLightboxIndex + 1).padStart(2, "0");
    socialLightboxTotal.textContent = String(slideCount).padStart(2, "0");
};

const openSocialLightbox = (slide) => {
    if (!socialLightbox) return;

    const filteredSlides = getFilteredSocialSlides();
    const selectedIndex = filteredSlides.indexOf(slide);
    if (selectedIndex < 0) return;

    socialLightboxIndex = selectedIndex;
    socialLightboxOpener = slide;
    updateSocialLightbox();
    socialLightbox.classList.add("is-open");
    socialLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("social-lightbox-open");
    window.requestAnimationFrame(() => socialLightboxClose.focus());
};

const closeSocialLightbox = () => {
    if (!socialLightbox || !isSocialLightboxOpen()) return;

    socialLightbox.classList.remove("is-open");
    socialLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("social-lightbox-open");

    if (socialLightboxOpener?.isConnected) socialLightboxOpener.focus();
    socialLightboxOpener = null;
};

const moveSocialLightbox = (step) => {
    const slideCount = getFilteredSocialSlides().length;
    if (slideCount < 2 || step === 0) return;

    socialLightboxIndex = (socialLightboxIndex + step + slideCount) % slideCount;
    updateSocialLightbox();
};

const updateSocialCarousel = () => {
    const filteredSlides = getFilteredSocialSlides();
    const slideCount = filteredSlides.length;

    socialSlides.forEach((slide) => {
        slide.dataset.position = "hidden";
        slide.setAttribute("aria-hidden", "true");
        slide.removeAttribute("aria-current");
        slide.tabIndex = -1;
    });

    socialCurrentNumber.textContent = slideCount === 0
        ? "00"
        : String(socialActiveIndex + 1).padStart(2, "0");
    socialTotalNumber.textContent = String(slideCount).padStart(2, "0");
    socialPreviousButton.disabled = slideCount < 2;
    socialNextButton.disabled = slideCount < 2;

    if (slideCount === 0) return;
    socialActiveIndex = ((socialActiveIndex % slideCount) + slideCount) % slideCount;
    socialCurrentNumber.textContent = String(socialActiveIndex + 1).padStart(2, "0");

    filteredSlides.forEach((slide, index) => {
        let offset = index - socialActiveIndex;
        if (offset > slideCount / 2) offset -= slideCount;
        if (offset < slideCount / -2) offset += slideCount;

        const position = {
            "-2": "previous-far",
            "-1": "previous",
            0: "active",
            1: "next",
            2: "next-far"
        }[offset] || "hidden";

        slide.dataset.position = position;
        const isShown = position !== "hidden";
        slide.setAttribute("aria-hidden", String(!isShown));
        slide.tabIndex = isShown ? 0 : -1;
        slide.setAttribute("aria-current", position === "active" ? "true" : "false");
    });

};

const moveSocialCarousel = (step) => {
    const slideCount = getFilteredSocialSlides().length;
    if (slideCount < 2 || step === 0) return;

    socialActiveIndex = (socialActiveIndex + step + slideCount) % slideCount;
    updateSocialCarousel();
};

const updateSocialCarouselDrag = (event) => {
    if (event.pointerId !== socialDragPointerId || !socialCarouselStage) return;

    const horizontalDistance = event.clientX - socialDragStartX;
    const verticalDistance = event.clientY - socialDragStartY;

    if (socialDragAxis === null) {
        const horizontalMagnitude = Math.abs(horizontalDistance);
        const verticalMagnitude = Math.abs(verticalDistance);
        if (Math.max(horizontalMagnitude, verticalMagnitude) < SOCIAL_DRAG_INTENT_THRESHOLD) return;

        socialDragAxis = horizontalMagnitude > verticalMagnitude ? "horizontal" : "vertical";
        if (socialDragAxis === "horizontal") {
            socialCarouselStage.classList.add("is-dragging");
            socialCarouselStage.setPointerCapture(event.pointerId);
        }
    }

    if (socialDragAxis !== "horizontal") return;

    event.preventDefault();
    const slideCount = getFilteredSocialSlides().length;
    const traversedSlides = Math.round(-horizontalDistance / socialDragStepDistance);
    const targetIndex = (
        (socialDragStartIndex + traversedSlides) % slideCount + slideCount
    ) % slideCount;
    const remainingOffset = horizontalDistance + traversedSlides * socialDragStepDistance;

    if (targetIndex !== socialActiveIndex) {
        socialActiveIndex = targetIndex;
        updateSocialCarousel();
    }
    socialCarouselStage.style.setProperty("--social-drag-offset", `${remainingOffset}px`);
};

const finishSocialCarouselDrag = (event) => {
    if (event.pointerId !== socialDragPointerId || !socialCarouselStage) return;

    const wasHorizontalDrag = socialDragAxis === "horizontal";
    if (socialCarouselStage.hasPointerCapture(event.pointerId)) {
        socialCarouselStage.releasePointerCapture(event.pointerId);
    }
    socialCarouselStage.classList.remove("is-dragging");
    socialCarouselStage.style.removeProperty("--social-drag-offset");
    socialDragPointerId = null;
    socialDragAxis = null;

    if (wasHorizontalDrag) {
        socialDragSuppressClick = true;
        window.setTimeout(() => {
            socialDragSuppressClick = false;
        }, 0);
    }
};

const setSocialGalleryActive = (isActive) => {
    if (!socialSection) return;

    if (socialRevealFrame !== null) {
        window.cancelAnimationFrame(socialRevealFrame);
        socialRevealFrame = null;
    }

    socialSection.classList.remove("is-gallery-ready");
    if (!isActive) {
        closeSocialLightbox();
        return;
    }

    updateSocialCarousel();
    if (reducedMotion.matches) {
        socialSection.classList.add("is-gallery-ready");
        return;
    }

    void socialSection.offsetWidth;
    socialRevealFrame = window.requestAnimationFrame(() => {
        socialSection.classList.add("is-gallery-ready");
        socialRevealFrame = null;
    });
};

const isPrintViewerOpen = () => printViewer?.classList.contains("is-open");

const getPrintDefaultRotation = (kind) => ({
    banner: { x: -5, y: -18 },
    card: { x: -13, y: -24 },
    notebook: { x: 0, y: 0 },
    pen: { x: -6, y: -14 },
    booth: { x: -7, y: -17 },
    flyer: { x: -12, y: -23 }
}[kind] || { x: -8, y: -18 });

const applyPrintViewerRotation = () => {
    if (!printViewerModel) return;

    printViewerModel.style.setProperty("--print-rotate-x", `${printRotationX}deg`);
    printViewerModel.style.setProperty("--print-rotate-y", `${printRotationY}deg`);

    if (printViewer?.classList.contains("is-webgl-model")) {
        printWebGLViewer?.setRotation(printRotationX, printRotationY);
    }
};

const resetPrintViewerRotation = () => {
    const defaults = getPrintDefaultRotation(printViewerModel?.dataset.kind);
    printRotationX = defaults.x;
    printRotationY = defaults.y;
    applyPrintViewerRotation();
};

const syncPrintViewerSize = () => {
    if (
        !printViewer ||
        !printViewerStage ||
        !printViewerFront?.naturalWidth ||
        !printViewerFront.naturalHeight
    ) return;

    const stageWidth = Math.max(180, printViewerStage.clientWidth);
    const stageHeight = Math.max(180, printViewerStage.clientHeight);
    const isCompact = mobileSidebar.matches;
    const kind = printViewerModel?.dataset.kind;
    const maximumWidth = stageWidth * (
        kind === "banner"
            ? (isCompact ? 0.86 : 0.56)
            : kind === "booth"
                ? (isCompact ? 1.12 : 0.82)
                : (isCompact ? 0.88 : 0.76)
    );
    const maximumHeight = stageHeight * (
        kind === "banner"
            ? (isCompact ? 0.76 : 0.84)
            : kind === "booth"
                ? (isCompact ? 0.72 : 0.75)
                : (isCompact ? 0.68 : 0.76)
    );
    const aspectRatio = kind === "banner"
        ? 0.72
        : kind === "booth"
            ? (isCompact ? 1.45 : 1.58)
            : printViewerFront.naturalWidth / printViewerFront.naturalHeight;
    const width = Math.min(maximumWidth, maximumHeight * aspectRatio);
    const height = width / aspectRatio;

    printViewer.style.setProperty("--print-viewer-width", `${Math.max(112, width)}px`);
    printViewer.style.setProperty("--print-viewer-height", `${Math.max(112, height)}px`);

    if (printViewer.classList.contains("is-webgl-model")) {
        printWebGLViewer?.resize(stageWidth, stageHeight);
    }
};

const openPrintViewer = (printObject) => {
    if (!printViewer || !printObject) return;

    const title = printObject.dataset.printTitle || "Print material";
    const frontSource = printObject.dataset.printImage;
    const backSource = printObject.dataset.printBack || frontSource;
    const textureSource = printObject.dataset.printTexture || frontSource;
    const kind = printObject.dataset.printKind || "card";

    closeSocialLightbox();
    printViewerOpener = printObject;
    printViewerTitle.textContent = title;
    printViewerFront.src = frontSource;
    printViewerFront.alt = `${title}, front view`;
    printViewerBack.src = backSource;
    printViewerBack.alt = `${title}, reverse view`;
    printViewerModel.dataset.kind = kind;
    const useWebGLModel = ["banner", "notebook", "pen", "booth"].includes(kind)
        && printWebGLViewer?.isReady;
    printViewer.classList.toggle("is-webgl-model", Boolean(useWebGLModel));
    if (useWebGLModel) printWebGLViewer.setModel(kind, textureSource, backSource);
    printViewerRotator.setAttribute(
        "aria-label",
        `Draggable 3D model of ${title}`
    );
    resetPrintViewerRotation();

    printViewer.classList.add("is-open");
    printViewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("print-viewer-open");
    syncPrintViewerSize();
    printViewerRotator.focus();
};

const closePrintViewer = () => {
    if (!printViewer || !isPrintViewerOpen()) return;

    printViewer.classList.remove("is-open");
    printViewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("print-viewer-open");
    printViewerRotator.classList.remove("is-dragging");
    printDragPointerId = null;

    if (printViewerOpener?.isConnected) printViewerOpener.focus();
    printViewerOpener = null;
};

const setPrintShowcaseActive = (isActive) => {
    if (!printSection) return;

    printSection.classList.remove("is-print-ready");
    if (!isActive) {
        closePrintViewer();
        return;
    }

    if (reducedMotion.matches) {
        printSection.classList.add("is-print-ready");
        return;
    }

    void printSection.offsetWidth;
    printSection.classList.add("is-print-ready");
};

const getAIFloatPlacementZones = () => {
    if (window.innerWidth <= 720) {
        return [
            { x: 17, y: 14 },
            { x: 80, y: 16 },
            { x: 15, y: 82 },
            { x: 78, y: 83 },
            { x: 48, y: 91 }
        ];
    }

    if (window.innerWidth <= 940) {
        return [
            { x: 12, y: 18 },
            { x: 34, y: 11 },
            { x: 70, y: 12 },
            { x: 91, y: 25 },
            { x: 12, y: 72 },
            { x: 35, y: 87 },
            { x: 72, y: 86 },
            { x: 91, y: 69 }
        ];
    }

    return [
        { x: 11, y: 19 },
        { x: 25, y: 10 },
        { x: 49, y: 9 },
        { x: 74, y: 11 },
        { x: 91, y: 24 },
        { x: 10, y: 65 },
        { x: 25, y: 84 },
        { x: 49, y: 90 },
        { x: 73, y: 85 },
        { x: 91, y: 69 }
    ];
};

const getAIFloatCardCount = () => {
    if (aiImages.length === 0) return 0;
    const desiredCount = window.innerWidth <= 720 ? 2 : window.innerWidth <= 940 ? 3 : 4;
    const uniqueRotationLimit = aiImages.length > 1 ? aiImages.length - 1 : 1;
    return Math.min(desiredCount, uniqueRotationLimit);
};

const shuffleAIFloatImages = (images) => {
    const shuffled = [...images];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
};

const takeNextAIFloatImage = (excludedSources = new Set(), previousSource = "") => {
    if (aiImages.length === 0) return null;
    if (aiFloatImageDeck.length === 0) aiFloatImageDeck = shuffleAIFloatImages(aiImages);

    const findCandidateIndex = (avoidPrevious) => aiFloatImageDeck.findIndex((image) => (
        !excludedSources.has(image.src)
        && (!avoidPrevious || image.src !== previousSource)
    ));

    let candidateIndex = findCandidateIndex(true);
    if (candidateIndex < 0) {
        aiFloatImageDeck.push(...shuffleAIFloatImages(aiImages));
        candidateIndex = findCandidateIndex(true);
    }
    if (candidateIndex < 0) candidateIndex = findCandidateIndex(false);
    if (candidateIndex < 0) return null;
    return aiFloatImageDeck.splice(candidateIndex, 1)[0];
};

const scheduleAIFloatTask = (callback, delay) => {
    const timer = window.setTimeout(() => {
        aiFloatSequenceTimers.delete(timer);
        callback();
    }, delay);
    aiFloatSequenceTimers.add(timer);
    return timer;
};

const clearAIFloatSequence = () => {
    aiFloatSequenceToken += 1;
    aiFloatSequenceTimers.forEach((timer) => window.clearTimeout(timer));
    aiFloatSequenceTimers.clear();
    aiFloatCardStates.forEach((state) => {
        if (state.timer !== null) window.clearTimeout(state.timer);
    });
    aiFloatCardStates.clear();
    aiFloatImageDeck = [];
    aiAmbient?.replaceChildren();
    aiAmbient?.classList.remove("has-focus");
};

const syncAIFloatFocus = () => {
    const hasFocusedCard = [...aiFloatCardStates.values()].some((state) => (
        state.pauseReasons.has("hover") || state.pauseReasons.has("focus")
    ));
    aiAmbient?.classList.toggle("has-focus", hasFocusedCard);
};

const scheduleAIFloatRetirement = (card) => {
    const state = aiFloatCardStates.get(card);
    if (!state || state.phase !== "visible" || state.pauseReasons.size > 0 || reducedMotion.matches) {
        return;
    }

    if (state.timer !== null) window.clearTimeout(state.timer);
    state.startedAt = performance.now();
    state.timer = window.setTimeout(() => {
        state.timer = null;
        retireAIFloatCard(card);
    }, Math.max(120, state.remaining));
};

const pauseAIFloatCard = (card, reason) => {
    const state = aiFloatCardStates.get(card);
    if (!state || state.pauseReasons.has(reason)) return;

    state.pauseReasons.add(reason);
    if (state.timer !== null) {
        window.clearTimeout(state.timer);
        state.timer = null;
        state.remaining = Math.max(120, state.remaining - (performance.now() - state.startedAt));
    }
    if (reason === "hover" || reason === "focus") card.classList.add("is-focused");
    syncAIFloatFocus();
};

const resumeAIFloatCard = (card, reason) => {
    const state = aiFloatCardStates.get(card);
    if (!state) return;

    state.pauseReasons.delete(reason);
    if (!state.pauseReasons.has("hover") && !state.pauseReasons.has("focus")) {
        card.classList.remove("is-focused");
    }
    syncAIFloatFocus();
    scheduleAIFloatRetirement(card);
};

const pauseAllAIFloatCards = (reason) => {
    aiFloatCardStates.forEach((state, card) => pauseAIFloatCard(card, reason));
};

const resumeAllAIFloatCards = (reason) => {
    aiFloatCardStates.forEach((state, card) => resumeAIFloatCard(card, reason));
};

const assignAIFloatPlacement = (card) => {
    const state = aiFloatCardStates.get(card);
    if (!state) return;

    const zones = getAIFloatPlacementZones();
    const occupiedZones = new Set(
        [...aiFloatCardStates.entries()]
            .filter(([otherCard]) => otherCard !== card)
            .map(([, otherState]) => otherState.zoneIndex)
    );
    const availableZoneIndexes = zones
        .map((zone, index) => index)
        .filter((index) => !occupiedZones.has(index));
    const zoneIndex = availableZoneIndexes.length > 0
        ? availableZoneIndexes[Math.floor(Math.random() * availableZoneIndexes.length)]
        : Math.floor(Math.random() * zones.length);
    const zone = zones[zoneIndex];
    const compact = window.innerWidth <= 720;
    const tablet = !compact && window.innerWidth <= 940;
    const baseWidth = compact
        ? 64 + Math.random() * 27
        : tablet
            ? 74 + Math.random() * 34
            : 88 + Math.random() * 48;
    const driftDistance = compact
        ? 1.4 + Math.random() * 0.9
        : tablet
            ? 2 + Math.random() * 1.3
            : 2.8 + Math.random() * 2;
    const driftDirection = Math.random() < 0.5 ? -1 : 1;

    state.zoneIndex = zoneIndex;
    state.baseWidth = baseWidth;
    card.style.setProperty("--ai-float-x", `${zone.x + (Math.random() * 4 - 2)}%`);
    card.style.setProperty("--ai-float-y", `${zone.y + (Math.random() * 4 - 2)}%`);
    card.style.setProperty("--ai-float-width", `${baseWidth}px`);
    card.style.setProperty("--ai-float-tilt", `${Math.random() * 10 - 5}deg`);
    card.style.setProperty("--ai-float-drift-start", `${driftDistance * driftDirection * -1}rem`);
    card.style.setProperty("--ai-float-drift-end", `${driftDistance * driftDirection}rem`);
};

const syncAIFloatAspect = (card) => {
    const state = aiFloatCardStates.get(card);
    const image = card.querySelector(".ai-float-card__image");
    if (!state || !image?.naturalWidth || !image.naturalHeight) return;

    const aspectRatio = image.naturalWidth / image.naturalHeight;
    const adjustedWidth = aspectRatio > 1.2
        ? state.baseWidth * 1.24
        : aspectRatio < 0.72
            ? state.baseWidth * 0.86
            : state.baseWidth;
    const maximumWidth = window.innerWidth <= 720 ? 102 : window.innerWidth <= 940 ? 138 : 178;

    card.style.setProperty("--ai-float-aspect", `${image.naturalWidth} / ${image.naturalHeight}`);
    card.style.setProperty("--ai-float-width", `${Math.min(maximumWidth, adjustedWidth)}px`);
};

const revealAIFloatCard = (card) => {
    const state = aiFloatCardStates.get(card);
    if (
        !state
        || state.token !== aiFloatSequenceToken
        || document.body.dataset.page !== "ai-generated-design"
    ) return;

    syncAIFloatAspect(card);
    state.phase = "visible";
    state.remaining = 6200 + Math.random() * 3900;
    card.style.setProperty(
        "--ai-float-drift-duration",
        `${(state.remaining + AI_FLOAT_FADE_MS) / 1000}s`
    );
    card.classList.remove("is-leaving");
    window.requestAnimationFrame(() => {
        if (!aiFloatCardStates.has(card)) return;
        card.classList.add("is-visible");
        scheduleAIFloatRetirement(card);
    });
};

const setAIFloatImage = (card, entry) => {
    const state = aiFloatCardStates.get(card);
    const image = card.querySelector(".ai-float-card__image");
    const caption = card.querySelector(".ai-float-card__caption");
    const drift = card.querySelector(".ai-float-card__drift");
    if (!state || !image || !caption || !drift || !entry) return;

    state.image = entry;
    state.phase = "loading";
    aiCardEntries.set(card, entry);
    card.setAttribute("aria-label", `View ${entry.alt}`);
    caption.textContent = entry.alt;
    assignAIFloatPlacement(card);
    drift.style.animationName = "none";
    void drift.offsetWidth;
    drift.style.removeProperty("animation-name");
    image.alt = entry.alt;
    image.src = entry.src;
    if (image.complete && image.naturalWidth > 0) {
        window.queueMicrotask(() => revealAIFloatCard(card));
    }
};

const recycleAIFloatCard = (card) => {
    const state = aiFloatCardStates.get(card);
    if (!state || state.token !== aiFloatSequenceToken) return;

    const previousSource = state.image?.src || "";
    const activeSources = new Set(
        [...aiFloatCardStates.entries()]
            .filter(([otherCard]) => otherCard !== card)
            .map(([, otherState]) => otherState.image?.src)
            .filter(Boolean)
    );
    const nextImage = takeNextAIFloatImage(activeSources, previousSource);
    if (!nextImage) {
        scheduleAIFloatTask(() => recycleAIFloatCard(card), 500);
        return;
    }

    card.classList.remove("is-visible", "is-leaving", "is-focused");
    state.pauseReasons.clear();
    setAIFloatImage(card, nextImage);
};

function retireAIFloatCard(card) {
    const state = aiFloatCardStates.get(card);
    if (!state || state.phase !== "visible") return;
    if (state.pauseReasons.size > 0) {
        scheduleAIFloatRetirement(card);
        return;
    }

    state.phase = "leaving";
    card.classList.remove("is-visible");
    card.classList.add("is-leaving");
    scheduleAIFloatTask(() => recycleAIFloatCard(card), AI_FLOAT_FADE_MS);
}

const createAIFloatCard = (entry, token) => {
    const card = document.createElement("button");
    card.className = "ai-float-card";
    card.type = "button";

    const drift = document.createElement("span");
    drift.className = "ai-float-card__drift";
    const media = document.createElement("span");
    media.className = "ai-float-card__media";
    const image = document.createElement("img");
    image.className = "ai-float-card__image";
    image.loading = "eager";
    image.decoding = "async";
    image.draggable = false;
    const caption = document.createElement("span");
    caption.className = "ai-float-card__caption";
    media.append(image);
    drift.append(media, caption);
    card.append(drift);

    aiFloatCardStates.set(card, {
        image: null,
        timer: null,
        remaining: 0,
        startedAt: 0,
        phase: "loading",
        pauseReasons: new Set(),
        zoneIndex: -1,
        baseWidth: 120,
        token
    });

    image.addEventListener("load", () => revealAIFloatCard(card));
    card.addEventListener("mouseenter", () => pauseAIFloatCard(card, "hover"));
    card.addEventListener("mouseleave", () => resumeAIFloatCard(card, "hover"));
    card.addEventListener("focus", () => pauseAIFloatCard(card, "focus"));
    card.addEventListener("blur", () => resumeAIFloatCard(card, "focus"));
    card.addEventListener("click", () => openAIViewer(card));

    aiAmbient.append(card);
    setAIFloatImage(card, entry);
};

const startAIFloatSequence = () => {
    if (!aiAmbient || aiImages.length === 0 || !aiSection?.classList.contains("is-active")) return;

    clearAIFloatSequence();
    const token = aiFloatSequenceToken;
    const cardCount = getAIFloatCardCount();
    for (let index = 0; index < cardCount; index += 1) {
        scheduleAIFloatTask(() => {
            if (token !== aiFloatSequenceToken) return;
            const activeSources = new Set(
                [...aiFloatCardStates.values()].map((state) => state.image?.src).filter(Boolean)
            );
            const entry = takeNextAIFloatImage(activeSources);
            if (entry) createAIFloatCard(entry, token);
        }, reducedMotion.matches ? 0 : 180 + index * 430);
    }
};

const getAIAspectRatio = (entry) => {
    const width = Number(entry?.width);
    const height = Number(entry?.height);
    return width > 0 && height > 0 ? width / height : 1;
};

const syncAIGalleryLayout = () => {
    if (!aiGallery) return;

    const galleryWidth = aiGallery.clientWidth;
    const targetRowHeight = galleryWidth >= 1180
        ? Math.min(390, Math.max(320, galleryWidth * 0.265))
        : galleryWidth >= 760
            ? Math.min(300, Math.max(245, galleryWidth * 0.28))
            : galleryWidth >= 540
                ? Math.min(245, Math.max(205, galleryWidth * 0.36))
                : galleryWidth;

    aiGallery.style.setProperty("--ai-row-height", `${Math.round(targetRowHeight)}px`);
    aiGallery.querySelectorAll(".ai-card").forEach((card) => {
        const aspectRatio = getAIAspectRatio(aiCardEntries.get(card));
        card.style.flexBasis = `${Math.round(aspectRatio * targetRowHeight)}px`;
        card.style.flexGrow = String(aspectRatio);
    });
};

const setAICardDimensions = (card, entry, width, height) => {
    if (!(width > 0 && height > 0)) return;
    entry.width = width;
    entry.height = height;
    card.dataset.orientation = width > height ? "landscape" : width < height ? "portrait" : "square";
    card.style.setProperty("--ai-card-aspect", `${width} / ${height}`);
};

const createAICard = (entry, index) => {
    const card = document.createElement("button");
    card.className = "ai-card";
    card.type = "button";
    card.setAttribute("aria-label", `View ${entry.alt}`);
    card.style.setProperty("--ai-card-delay", `${Math.min(index, 8) * 65}ms`);

    const media = document.createElement("span");
    media.className = "ai-card__media";
    const image = document.createElement("img");
    image.className = "ai-card__image";
    image.loading = index < 3 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;
    image.src = entry.src;
    image.alt = entry.alt;
    const caption = document.createElement("span");
    caption.className = "ai-card__caption";
    caption.textContent = entry.alt;
    media.append(image);
    card.append(media, caption);

    aiCardEntries.set(card, entry);
    if (entry.width > 0 && entry.height > 0) {
        image.width = entry.width;
        image.height = entry.height;
        setAICardDimensions(card, entry, entry.width, entry.height);
    }

    const revealCard = () => {
        setAICardDimensions(card, entry, image.naturalWidth, image.naturalHeight);
        syncAIGalleryLayout();
        window.requestAnimationFrame(() => card.classList.add("is-loaded"));
    };
    image.addEventListener("load", revealCard, { once: true });
    if (image.complete && image.naturalWidth > 0) window.queueMicrotask(revealCard);
    card.addEventListener("click", () => openAIViewer(card));

    return card;
};

const isAIViewerOpen = () => aiViewer?.classList.contains("is-open");

const animateAIViewerEntry = async (originBounds) => {
    try {
        await aiViewerImage.decode();
    } catch {
        // The load event still provides a measurable image when decode is unavailable.
    }
    if (
        !isAIViewerOpen()
        || aiViewer.classList.contains("is-closing")
        || aiViewer.classList.contains("is-returning")
    ) return;

    if (reducedMotion.matches || !originBounds) {
        aiViewerImage.style.opacity = "";
        return;
    }

    const targetBounds = aiViewerImage.getBoundingClientRect();
    if (targetBounds.width <= 0 || targetBounds.height <= 0) {
        aiViewerImage.style.opacity = "";
        return;
    }
    const translateX = originBounds.left + originBounds.width / 2
        - (targetBounds.left + targetBounds.width / 2);
    const translateY = originBounds.top + originBounds.height / 2
        - (targetBounds.top + targetBounds.height / 2);
    const scale = Math.max(
        0.06,
        Math.min(originBounds.width / targetBounds.width, originBounds.height / targetBounds.height)
    );

    aiViewerAnimation?.cancel();
    aiViewerOpener?.classList.add("is-viewer-source-hidden");
    aiViewerAnimation = aiViewerImage.animate([
        {
            opacity: 1,
            filter: "blur(0)",
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
        },
        {
            opacity: 1,
            filter: "blur(0)",
            transform: "translate3d(0, 0, 0) scale(1)"
        }
    ], {
        duration: 720,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both"
    });
    aiViewerImage.style.opacity = "";
};

const openAIViewer = (card) => {
    const entry = aiCardEntries.get(card);
    const cardImage = card.querySelector(".ai-card__image, .ai-float-card__image");
    if (!aiViewer || !entry || !cardImage) return;

    closeSocialLightbox();
    closePrintViewer();
    if (aiViewerCloseTimer !== null) {
        window.clearTimeout(aiViewerCloseTimer);
        aiViewerCloseTimer = null;
    }
    const originBounds = cardImage.getBoundingClientRect();
    aiViewerOpener = card;
    card.classList.remove("is-viewer-source-hidden");
    card.classList.add("is-viewer-origin");
    pauseAllAIFloatCards("viewer");
    aiViewerImage.style.opacity = "0";
    aiViewerImage.src = entry.src;
    aiViewerImage.alt = entry.alt;
    aiViewerCaption.textContent = entry.alt;
    aiViewer.classList.remove("is-closing", "is-returning");
    aiViewer.classList.add("is-open");
    aiViewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("ai-viewer-open");
    void animateAIViewerEntry(originBounds);
    window.requestAnimationFrame(() => aiViewerClose.focus());
};

const finalizeAIViewerClose = () => {
    if (!aiViewer || !isAIViewerOpen()) return;

    const closingAnimation = aiViewerAnimation;
    const opener = aiViewerOpener;
    if (aiViewerCloseTimer !== null) {
        window.clearTimeout(aiViewerCloseTimer);
        aiViewerCloseTimer = null;
    }
    // Hide the complete overlay before clearing the fill-mode animation. Otherwise
    // the enlarged image can paint for one frame and look like a close flicker.
    aiViewer.style.visibility = "hidden";
    aiViewer.style.opacity = "0";
    opener?.classList.remove("is-viewer-source-hidden");
    aiViewer.classList.remove("is-open", "is-closing", "is-returning");
    closingAnimation?.cancel();
    aiViewerAnimation = null;
    aiViewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ai-viewer-open");
    aiViewerImage.style.opacity = "";
    resumeAllAIFloatCards("viewer");
    opener?.classList.remove("is-viewer-origin");

    if (opener?.isConnected && document.body.dataset.page === "ai-generated-design") {
        opener.focus({ preventScroll: true });
    }
    aiViewerOpener = null;
    window.requestAnimationFrame(() => {
        aiViewer.style.removeProperty("visibility");
        aiViewer.style.removeProperty("opacity");
    });
};

const closeAIViewer = (immediate = false) => {
    if (!aiViewer || !isAIViewerOpen()) return;
    if (immediate || reducedMotion.matches || !aiViewerOpener?.isConnected) {
        finalizeAIViewerClose();
        return;
    }
    if (
        aiViewer.classList.contains("is-closing")
        || aiViewer.classList.contains("is-returning")
    ) return;

    if (aiViewerAnimation) {
        const returnAnimation = aiViewerAnimation;
        aiViewer.classList.add("is-returning");
        returnAnimation.reverse();
        returnAnimation.finished
            .then(() => {
                if (aiViewerAnimation === returnAnimation) finalizeAIViewerClose();
            })
            .catch(() => {});
        return;
    }

    // If the image was closed before it finished decoding, use the fade fallback.
    aiViewer.classList.add("is-closing");
    aiViewerCloseTimer = window.setTimeout(finalizeAIViewerClose, 200);
};

const showAIGalleryStatus = (message) => {
    if (!aiGallery || !aiGalleryStatus) return;
    aiGalleryStatus.textContent = message;
    aiGallery.replaceChildren(aiGalleryStatus);
};

const renderAIGallery = (manifest) => {
    const entries = Array.isArray(manifest?.images) ? manifest.images : [];
    const seenSources = new Set();
    aiImages = entries.filter((entry) => {
        if (
            typeof entry?.src !== "string"
            || typeof entry?.alt !== "string"
            || seenSources.has(entry.src)
        ) return false;
        seenSources.add(entry.src);
        return true;
    });
    aiGallery.setAttribute("aria-busy", "false");

    if (aiImages.length === 0) {
        showAIGalleryStatus("Add images to AI_generated_design to begin the gallery.");
        return;
    }

    const galleryFragment = document.createDocumentFragment();
    [...aiImages]
        .sort((left, right) => getAIAspectRatio(right) - getAIAspectRatio(left))
        .forEach((entry, index) => galleryFragment.append(createAICard(entry, index)));
    aiGallery.replaceChildren(galleryFragment);
    syncAIGalleryLayout();

    aiGalleryResizeObserver?.disconnect();
    if ("ResizeObserver" in window) {
        aiGalleryResizeObserver = new ResizeObserver(syncAIGalleryLayout);
        aiGalleryResizeObserver.observe(aiGallery);
    }
    if (document.body.dataset.page === "ai-generated-design") startAIFloatSequence();
};

const loadAIGallery = async () => {
    try {
        if (window.AI_GALLERY_MANIFEST) {
            renderAIGallery(window.AI_GALLERY_MANIFEST);
            return;
        }

        const response = await fetch(AI_GALLERY_MANIFEST_URL, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`AI gallery manifest request failed with status ${response.status}.`);
        }
        renderAIGallery(await response.json());
    } catch (error) {
        console.error("AI generated design gallery could not be loaded.", error);
        aiImages = [];
        aiGallery?.setAttribute("aria-busy", "false");
        showAIGalleryStatus("A.I. designs could not be loaded.");
    }
};

const setAIGalleryActive = (isActive) => {
    if (!aiSection) return;

    aiSection.classList.remove("is-ai-ready");
    if (!isActive) {
        closeAIViewer(true);
        clearAIFloatSequence();
        return;
    }

    void aiSection.offsetWidth;
    aiSection.classList.add("is-ai-ready");
    window.requestAnimationFrame(syncAIGalleryLayout);
    startAIFloatSequence();
};

const getActiveVideoCategory = () => videoCategories.find((category) => (
    category.id === videoActiveCategoryId
));

const isVideoExperienceOpen = () => videoMode !== "rail";

const clearVideoOrientation = (frame) => {
    if (!frame) return;
    frame.classList.remove("is-portrait", "is-landscape", "is-square");
    frame.style.removeProperty("--video-aspect-ratio");
};

const syncVideoOrientation = (video, frame) => {
    if (!video || !frame || !video.videoWidth || !video.videoHeight) return false;

    const { videoWidth, videoHeight } = video;
    const orientation = videoHeight > videoWidth
        ? "portrait"
        : videoWidth > videoHeight
            ? "landscape"
            : "square";

    clearVideoOrientation(frame);
    frame.classList.add(`is-${orientation}`);
    frame.style.setProperty("--video-aspect-ratio", `${videoWidth} / ${videoHeight}`);
    return true;
};

const pauseVideoPreview = (preview, reset = false) => {
    preview.pause();
    if (!reset || !Number.isFinite(preview.duration)) return;

    try {
        preview.currentTime = Math.min(0.12, preview.duration / 2);
    } catch {
        // A thumbnail seek can fail while a browser is still reading metadata.
    }
};

const setVideoWatchButtonState = (isPlaying) => {
    videoWatchButton?.classList.toggle("is-playing", isPlaying);
    const label = videoWatchButton?.querySelector("span:first-child");
    if (label) label.textContent = isPlaying ? "Pause" : "Watch";
};

const cleanUpVideoDetail = () => {
    videoDetailAnimation?.cancel();
    videoDetailAnimation = null;
    videoDetailVideo?.pause();
    if (videoDetailVideo) {
        videoDetailVideo.removeAttribute("src");
        videoDetailVideo.controls = false;
        videoDetailVideo.muted = true;
        videoDetailVideo.load();
    }
    clearVideoOrientation(videoDetail);
    setVideoWatchButtonState(false);
};

const showVideoGalleryStatus = (message) => {
    const status = document.createElement("p");
    status.className = "video-cinema__status";
    status.setAttribute("role", "status");
    status.dataset.videoGalleryStatus = "";
    status.textContent = message;
    videoGallery?.replaceChildren(status);
};

const setVideoMode = (mode) => {
    videoMode = mode;
    if (videoCinema) videoCinema.dataset.mode = mode;
    videoDetail?.setAttribute("aria-hidden", String(mode !== "detail"));
};

const playActiveVideoPreview = () => {
    videoPosterButtons.forEach((poster, index) => {
        const preview = poster.querySelector("video");
        if (!preview) return;

        if (
            index === videoActiveIndex &&
            videoMode === "rail" &&
            videoSection?.classList.contains("is-active") &&
            !reducedMotion.matches
        ) {
            void preview.play().catch(() => {
                // A still frame remains if the browser blocks muted autoplay.
            });
        } else {
            pauseVideoPreview(preview);
        }
    });
};

const updateVideoRail = ({ focus = false, scroll = true } = {}) => {
    const videoCount = getActiveVideoCategory()?.videos.length || 0;
    if (videoCount === 0) return;

    videoActiveIndex = ((videoActiveIndex % videoCount) + videoCount) % videoCount;
    videoPosterButtons.forEach((poster, index) => {
        const isActive = index === videoActiveIndex;
        poster.classList.toggle("is-active", isActive);
        poster.setAttribute("aria-current", isActive ? "true" : "false");
        poster.tabIndex = isActive ? 0 : -1;
    });
    if (videoCurrentNumber) {
        videoCurrentNumber.textContent = String(videoActiveIndex + 1).padStart(2, "0");
    }
    if (videoPreviousButton) videoPreviousButton.disabled = videoCount < 2;
    if (videoNextButton) videoNextButton.disabled = videoCount < 2;

    const activePoster = videoPosterButtons[videoActiveIndex];
    if (scroll && activePoster && window.innerWidth <= 720) {
        activePoster.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", inline: "center", block: "nearest" });
    }
    if (focus) activePoster?.focus({ preventScroll: true });
    playActiveVideoPreview();
};

const setVideoActiveIndex = (index, options = {}) => {
    const count = getActiveVideoCategory()?.videos.length || 0;
    if (count === 0) return;
    videoActiveIndex = (index + count) % count;
    updateVideoRail(options);
};

const animateVideoDetailFrom = (sourceBounds, reverse = false) => {
    if (!videoDetail || !sourceBounds || reducedMotion.matches) return null;

    const destination = videoDetail.getBoundingClientRect();
    if (!destination.width || !destination.height) return null;
    const startFrame = {
        transformOrigin: "top left",
        transform: `translate(${sourceBounds.left - destination.left}px, ${sourceBounds.top - destination.top}px) scale(${sourceBounds.width / destination.width}, ${sourceBounds.height / destination.height})`,
        borderRadius: "0.15rem",
        opacity: 0.76
    };
    const endFrame = {
        transformOrigin: "top left",
        transform: "translate(0, 0) scale(1, 1)",
        borderRadius: "0",
        opacity: 1
    };
    return videoDetail.animate(reverse ? [endFrame, startFrame] : [startFrame, endFrame], {
        duration: reverse ? 560 : 760,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both"
    });
};

const openVideoDetail = (index = videoActiveIndex, source = videoPosterButtons[index]) => {
    const category = getActiveVideoCategory();
    const entry = category?.videos[index];
    if (!entry || !videoDetail || !videoDetailVideo) return;

    setVideoActiveIndex(index, { scroll: false });
    const sourceBounds = source?.getBoundingClientRect();
    const sourcePreview = source?.querySelector("video");
    const sourceTime = Number.isFinite(sourcePreview?.currentTime) ? sourcePreview.currentTime : 0;
    videoDetailSource = source;
    videoDetailTitle.textContent = entry.title;
    videoDetailCategory.textContent = category.name;
    clearVideoOrientation(videoDetail);
    syncVideoOrientation(sourcePreview, videoDetail);
    videoDetailVideo.src = entry.src;
    videoDetailVideo.controls = true;
    videoDetailVideo.muted = false;
    videoDetailVideo.load();
    videoDetailVideo.addEventListener("loadedmetadata", () => {
        syncVideoOrientation(videoDetailVideo, videoDetail);
        if (Number.isFinite(videoDetailVideo.duration)) {
            videoDetailVideo.currentTime = Math.min(sourceTime, Math.max(0, videoDetailVideo.duration - 0.1));
        }
    }, { once: true });
    setVideoWatchButtonState(true);
    void videoDetailVideo.play().catch(() => {
        // Native controls and the Watch button remain available if playback is blocked.
        setVideoWatchButtonState(false);
    });

    videoGallery?.querySelectorAll("video").forEach((preview) => preview.pause());
    setVideoMode("detail");
    window.requestAnimationFrame(() => {
        videoDetailAnimation?.cancel();
        videoDetailAnimation = animateVideoDetailFrom(sourceBounds);
        videoDetailAnimation?.addEventListener("finish", () => {
            videoDetailAnimation = null;
            videoDetailCloseButton?.focus({ preventScroll: true });
        }, { once: true });
        if (!videoDetailAnimation) videoDetailCloseButton?.focus({ preventScroll: true });
    });
};

const closeVideoDetail = (immediate = false) => {
    if (videoMode !== "detail") return;
    const source = videoDetailSource;
    const finish = () => {
        setVideoMode("rail");
        cleanUpVideoDetail();
        playActiveVideoPreview();
        if (!immediate && source?.isConnected) source.focus({ preventScroll: true });
        videoDetailSource = null;
    };

    videoDetailAnimation?.cancel();
    const sourceBounds = !immediate && source?.isConnected ? source.getBoundingClientRect() : null;
    const animation = animateVideoDetailFrom(sourceBounds, true);
    if (!animation) {
        finish();
        return;
    }
    videoDetailAnimation = animation;
    animation.addEventListener("finish", finish, { once: true });
};

const toggleVideoWatch = () => {
    if (!videoDetailVideo || videoMode !== "detail") return;
    videoDetailVideo.controls = true;
    videoDetailVideo.muted = false;
    if (videoDetailVideo.paused) {
        void videoDetailVideo.play().catch(() => setVideoWatchButtonState(false));
        setVideoWatchButtonState(true);
    } else {
        videoDetailVideo.pause();
        setVideoWatchButtonState(false);
    }
};

const renderActiveVideoCategory = () => {
    const category = getActiveVideoCategory();
    if (!category || !videoGallery) return;

    if (videoMode === "detail") closeVideoDetail(true);
    setVideoMode("rail");
    cleanUpVideoDetail();
    videoCategoryName.textContent = category.name;
    videoCategoryCount.textContent = String(category.videos.length).padStart(2, "0");

    const cardFragment = document.createDocumentFragment();
    category.videos.forEach((entry, index) => {
        const button = document.createElement("button");
        button.className = "video-poster";
        button.type = "button";
        button.dataset.videoIndex = index;
        button.style.setProperty("--video-poster-index", index);
        button.setAttribute("aria-label", `Focus ${entry.title}`);

        const preview = document.createElement("video");
        preview.className = "video-poster__preview";
        preview.src = entry.src;
        preview.muted = true;
        preview.loop = true;
        preview.playsInline = true;
        preview.preload = "metadata";
        preview.setAttribute("aria-hidden", "true");
        preview.tabIndex = -1;

        const meta = document.createElement("span");
        meta.className = "video-poster__meta";

        const number = document.createElement("span");
        number.className = "video-poster__number";
        number.textContent = String(index + 1).padStart(2, "0");

        const title = document.createElement("span");
        title.className = "video-poster__title";
        title.textContent = entry.title;

        meta.append(number, title);
        button.append(preview, meta);
        cardFragment.append(button);

        button.addEventListener("pointerenter", () => setVideoActiveIndex(index, { scroll: false }));
        button.addEventListener("focus", () => setVideoActiveIndex(index, { scroll: false }));
        button.addEventListener("click", () => {
            if (videoActiveIndex !== index) {
                setVideoActiveIndex(index);
                return;
            }
            openVideoDetail(index, button);
        });
    });

    videoGallery.replaceChildren(cardFragment);
    videoGallery.setAttribute("aria-busy", "false");
    videoPosterButtons = [...videoGallery.querySelectorAll(".video-poster")];
    videoActiveIndex = Math.min(videoActiveIndex, Math.max(0, category.videos.length - 1));
    updateVideoRail({ scroll: false });
    videoCinema?.classList.remove("is-rail-entering");
    void videoCinema?.offsetWidth;
    videoCinema?.classList.add("is-rail-entering");
};

const selectVideoCategory = (categoryId) => {
    if (!videoCategories.some((category) => category.id === categoryId)) return;

    videoActiveCategoryId = categoryId;
    videoActiveIndex = 0;
    videoCategoryButtons.forEach((button) => {
        const isActive = button.dataset.videoCategory === categoryId;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
    });
    renderActiveVideoCategory();
};

const renderVideoGallery = (manifest) => {
    if (!Array.isArray(manifest?.categories)) {
        throw new Error("The video gallery manifest has no categories array.");
    }

    videoCategories = manifest.categories.filter((category) => (
        typeof category?.id === "string" &&
        typeof category?.name === "string" &&
        Array.isArray(category?.videos) &&
        category.videos.length > 0 &&
        category.videos.every((entry) => (
            typeof entry?.src === "string" &&
            typeof entry?.title === "string"
        ))
    ));
    if (videoCategories.length === 0) throw new Error("The video gallery has no videos.");

    const categoryFragment = document.createDocumentFragment();
    videoCategories.forEach((category, index) => {
        const button = document.createElement("button");
        button.className = "video-cinema__category";
        button.type = "button";
        button.dataset.videoCategory = category.id;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", "video-gallery-panel");

        const number = document.createElement("span");
        number.className = "video-cinema__category-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const name = document.createElement("span");
        name.className = "video-cinema__category-name";
        name.textContent = category.name;
        button.append(number, name);
        button.addEventListener("click", () => selectVideoCategory(category.id));
        button.addEventListener("keydown", (event) => {
            const direction = ["ArrowRight", "ArrowDown"].includes(event.key)
                ? 1
                : ["ArrowLeft", "ArrowUp"].includes(event.key)
                    ? -1
                    : 0;
            if (direction === 0) return;

            event.preventDefault();
            const targetIndex = (index + direction + videoCategories.length) % videoCategories.length;
            selectVideoCategory(videoCategories[targetIndex].id);
            videoCategoryButtons[targetIndex]?.focus();
        });
        categoryFragment.append(button);
    });

    videoCategoriesNav.replaceChildren(categoryFragment);
    videoCategoriesNav.setAttribute("role", "tablist");
    videoCategoriesNav.setAttribute("aria-busy", "false");
    videoGallery.id = "video-gallery-panel";
    videoGallery.setAttribute("role", "tabpanel");
    videoCategoryButtons = [...videoCategoriesNav.querySelectorAll("[data-video-category]")];
    const initialCategoryId = videoCategories.some((category) => (
        category.id === requestedVideoCategoryId
    ))
        ? requestedVideoCategoryId
        : videoCategories[0].id;
    selectVideoCategory(initialCategoryId);
};

const loadVideoGallery = async () => {
    try {
        if (window.VIDEO_GALLERY_MANIFEST) {
            renderVideoGallery(window.VIDEO_GALLERY_MANIFEST);
            return;
        }

        const response = await fetch(VIDEO_GALLERY_MANIFEST_URL, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Video manifest request failed with status ${response.status}.`);
        }
        renderVideoGallery(await response.json());
    } catch (error) {
        console.error("Video gallery could not be loaded.", error);
        videoCategories = [];
        videoCategoryButtons = [];
        videoCategoriesNav?.replaceChildren();
        videoCategoriesNav?.setAttribute("aria-busy", "false");
        videoGallery?.setAttribute("aria-busy", "false");
        showVideoGalleryStatus("Videos could not be loaded.");
    }
};

const setVideoGalleryActive = (isActive) => {
    if (!videoSection) return;

    if (!isActive) {
        if (videoMode === "detail") closeVideoDetail(true);
        setVideoMode("rail");
        cleanUpVideoDetail();
        videoGallery?.querySelectorAll("video").forEach((preview) => preview.pause());
        return;
    }

    if (videoCategories.length > 0) {
        renderActiveVideoCategory();
        playActiveVideoPreview();
    }
};

const showPage = (requestedPage, shouldScroll = true) => {
    const resolvedPageId = resolvePageId(requestedPage);
    const pageId = pageExists(resolvedPageId) ? resolvedPageId : "home";

    requestedVideoCategoryId = legacyVideoCategories[requestedPage] || "";
    if (
        pageId === "video-editing" &&
        requestedVideoCategoryId &&
        videoCategories.some((category) => category.id === requestedVideoCategoryId)
    ) {
        selectVideoCategory(requestedVideoCategoryId);
    }

    setEducationExitArmed();

    pageViews.forEach((view) => {
        const isActive = view.dataset.page === pageId;
        view.classList.toggle("is-active", isActive);
        view.inert = !isActive;
        view.setAttribute("aria-hidden", String(!isActive));
    });

    pageLinks.forEach((link) => {
        const linkedPageId = resolvePageId(link.getAttribute("href").slice(1));
        const isCurrent = linkedPageId === pageId;
        if (isCurrent) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    setAboutCopyVisible(pageId === "about-me");
    setEducationTimelineActive(pageId === "education");
    setSocialGalleryActive(pageId === "social-media-design");
    setPrintShowcaseActive(pageId === "print-marketing-materials");
    setAIGalleryActive(pageId === "ai-generated-design");
    setVideoGalleryActive(pageId === "video-editing");
    if (pageId === "reviews") requestPublishedReviews();

    document.body.dataset.page = pageId;
    document.title = pageTitles[pageId] || pageTitles.home;

    if (shouldScroll) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const getPageScrollLimit = (page) => {
    if (window.getComputedStyle(page).overflowY === "hidden") return 0;
    return Math.max(0, page.scrollHeight - page.clientHeight);
};

const positionPageAtEntry = (pageId, direction) => {
    const page = pageViews.find((view) => view.dataset.page === pageId);
    if (!page) return;

    page.scrollTop = direction < 0 ? getPageScrollLimit(page) : 0;
    if (pageId === "education") scheduleEducationTimelineUpdate();
};

const navigateToPage = (requestedPage, direction = 0) => {
    const pageId = resolvePageId(requestedPage);
    if (!pageExists(pageId)) return;

    if (document.body.dataset.page !== pageId) {
        window.history.pushState({ page: requestedPage }, "", cleanPageUrl);
    }

    showPage(requestedPage);
    positionPageAtEntry(pageId, direction);
};

const lockPageNavigation = () => {
    pageNavigationLocked = true;
    window.setTimeout(() => {
        pageNavigationLocked = false;
    }, PAGE_NAVIGATION_LOCK_MS);
};

const navigateByStep = (step) => {
    if (pageNavigationLocked || step === 0) return false;

    const currentIndex = pageNavigationOrder.indexOf(document.body.dataset.page);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const targetIndex = Math.min(
        pageNavigationOrder.length - 1,
        Math.max(0, safeCurrentIndex + step)
    );

    if (targetIndex === safeCurrentIndex) return false;

    navigateToPage(pageNavigationOrder[targetIndex], step);
    lockPageNavigation();
    return true;
};

const scrollActivePage = (delta) => {
    const activePage = pageViews.find((view) => view.classList.contains("is-active"));
    if (!activePage || delta === 0) return false;

    const scrollLimit = getPageScrollLimit(activePage);
    if (scrollLimit <= PAGE_SCROLL_EDGE_TOLERANCE) return false;

    const scrollingDown = delta > 0;
    const atStart = activePage.scrollTop <= PAGE_SCROLL_EDGE_TOLERANCE;
    const atEnd = activePage.scrollTop >= scrollLimit - PAGE_SCROLL_EDGE_TOLERANCE;

    if ((scrollingDown && atEnd) || (!scrollingDown && atStart)) return false;

    activePage.scrollTop = Math.min(
        scrollLimit,
        Math.max(0, activePage.scrollTop + delta)
    );
    return true;
};

navToggle.addEventListener("click", () => {
    setSidebarOpen(sidebar.dataset.open !== "true");
});

scrim.addEventListener("click", () => setSidebarOpen(false));

sidebar.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.deltaY === 0) return;

    event.preventDefault();
    event.stopPropagation();

    const deltaMultiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? sidebarNav.clientHeight
            : 1;
    sidebarNav.scrollTop += event.deltaY * deltaMultiplier;
}, { passive: false });

document.addEventListener("click", (event) => {
    if (
        sidebar.dataset.open === "true" &&
        !sidebar.contains(event.target) &&
        !navToggle.contains(event.target)
    ) {
        setSidebarOpen(false);
    }
});

pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const pageId = link.getAttribute("href").slice(1);
        navigateToPage(pageId);
        setSidebarOpen(false);
    });
});

pageJumpLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        navigateToPage(link.dataset.pageJump || link.getAttribute("href").slice(1));
    });
});

const siteToastTimers = new WeakMap();

const clearSiteToastTimer = (toast) => {
    const timer = siteToastTimers.get(toast);
    if (timer) window.clearTimeout(timer);
    siteToastTimers.delete(toast);
};

const dismissSiteToast = (toast, immediately = false) => {
    if (!toast?.isConnected) return;
    clearSiteToastTimer(toast);

    const removeToast = () => {
        siteToastTimers.delete(toast);
        toast.remove();
        if (contactStatusToast === toast) contactStatusToast = null;
    };

    if (immediately || reducedMotion.matches) {
        removeToast();
        return;
    }

    toast.classList.add("is-leaving");
    siteToastTimers.set(toast, window.setTimeout(removeToast, 240));
};

const showSiteToast = (message, type = "info", options = {}) => {
    if (!siteToastStack || !message) return null;

    const {
        duration = SITE_TOAST_DEFAULT_DURATION_MS,
        title = "Status",
        toast: reusableToast = null
    } = options;
    const toast = reusableToast?.isConnected
        ? reusableToast
        : document.createElement("article");

    if (!toast.isConnected) {
        toast.className = "site-toast";
        toast.innerHTML = `
            <span class="site-toast__icon" aria-hidden="true"></span>
            <span class="site-toast__copy">
                <strong class="site-toast__title"></strong>
                <span class="site-toast__message"></span>
            </span>
            <button class="site-toast__close" type="button" aria-label="Dismiss notification">\u00d7</button>
        `;
        toast.querySelector(".site-toast__close").addEventListener("click", () => dismissSiteToast(toast));
        siteToastStack.append(toast);
    } else {
        toast.classList.remove("is-leaving");
    }

    toast.dataset.type = type;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.querySelector(".site-toast__title").textContent = title;
    toast.querySelector(".site-toast__message").textContent = message;
    clearSiteToastTimer(toast);

    if (duration > 0) {
        siteToastTimers.set(toast, window.setTimeout(() => dismissSiteToast(toast), duration));
    }

    const visibleToasts = [...siteToastStack.querySelectorAll(".site-toast")];
    visibleToasts
        .slice(0, Math.max(0, visibleToasts.length - SITE_TOAST_MAX_COUNT))
        .forEach((oldestToast) => dismissSiteToast(oldestToast, true));

    return toast;
};

const showContactToast = (message, type, title, duration = SITE_TOAST_DEFAULT_DURATION_MS) => {
    contactStatusToast = showSiteToast(message, type, {
        duration,
        title,
        toast: contactStatusToast
    });
};

const showReviewToast = (message, type, title, duration = SITE_TOAST_DEFAULT_DURATION_MS) => {
    reviewStatusToast = showSiteToast(message, type, {
        duration,
        title,
        toast: reviewStatusToast
    });
};

const clearReviewFormTimeout = () => {
    window.clearTimeout(reviewFormTimeout);
    reviewFormTimeout = null;
};

const setReviewServiceReady = (isReady, message = "") => {
    reviewServiceReady = isReady;
    if (reviewFormSubmit && !["sending", "pending"].includes(reviewForm?.dataset.state)) {
        reviewFormSubmit.disabled = !isReady;
    }
    if (message && reviewFormStatus && reviewForm?.dataset.state !== "success") {
        reviewFormStatus.textContent = message;
    }
};

const createReviewStatusCard = (message, state = "") => {
    const card = document.createElement("article");
    card.className = "review-card review-card--status";
    if (state) card.dataset.state = state;
    const copy = document.createElement("p");
    copy.textContent = message;
    card.append(copy);
    return card;
};

const formatReviewDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Published review";
    return new Intl.DateTimeFormat("en-PH", {
        month: "short",
        year: "numeric"
    }).format(date);
};

const createHomeTestimonialCard = (review, hiddenDuplicate = false) => {
    const name = String(review?.name || "Portfolio client").trim() || "Portfolio client";
    const company = String(review?.company || "Independent client").trim() || "Independent client";
    const title = String(review?.title || "A creative collaboration").trim();
    const feedback = String(review?.feedback || "").trim();
    const rating = Math.min(5, Math.max(1, Number.parseInt(review?.rating, 10) || 1));

    const card = document.createElement("article");
    card.className = "home-testimonial-card";
    if (hiddenDuplicate) {
        card.setAttribute("aria-hidden", "true");
    } else {
        card.tabIndex = 0;
    }

    const orbit = document.createElement("span");
    orbit.className = "home-testimonial-card__orbit";
    orbit.setAttribute("aria-hidden", "true");

    const stars = document.createElement("p");
    stars.className = "home-testimonial-card__stars";
    stars.setAttribute("aria-label", `${rating} out of 5 stars`);
    stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

    const personName = document.createElement("p");
    personName.className = "home-testimonial-card__name";
    personName.textContent = name;

    const meta = document.createElement("p");
    meta.className = "home-testimonial-card__meta";
    meta.textContent = `${company} · ${formatReviewDate(review?.approvedAt)}`;

    const heading = document.createElement("h3");
    heading.className = "home-testimonial-card__title";
    heading.textContent = title;

    const reviewCopy = document.createElement("p");
    reviewCopy.className = "home-testimonial-card__feedback";
    reviewCopy.textContent = feedback;

    card.append(orbit, stars, personName, meta, heading, reviewCopy);
    return card;
};

const setHomeTestimonialsStatus = (message, state = "") => {
    if (!homeReviewTrack) return;
    const status = document.createElement("p");
    status.className = "home-testimonials__status";
    status.textContent = message;
    if (state) status.dataset.state = state;
    homeReviewTrack.classList.remove("is-ready");
    homeReviewTrack.style.removeProperty("--home-review-duration");
    homeReviewTrack.replaceChildren(status);
    homeReviewTrack.setAttribute("aria-busy", "false");
};

const renderHomeTestimonials = (reviews) => {
    if (!homeReviewTrack) return;
    const safeReviews = Array.isArray(reviews) ? reviews : [];
    if (safeReviews.length === 0) {
        setHomeTestimonialsStatus("Published client stories will appear here after Jerome approves them.");
        return;
    }

    const displayReviews = Array.from(
        { length: Math.max(4, safeReviews.length) },
        (_, index) => safeReviews[index % safeReviews.length]
    );
    const createGroup = (hiddenGroup = false) => {
        const group = document.createElement("div");
        group.className = "home-testimonials__group";
        if (hiddenGroup) group.setAttribute("aria-hidden", "true");
        displayReviews.forEach((review, index) => {
            group.append(createHomeTestimonialCard(
                review,
                hiddenGroup || index >= safeReviews.length
            ));
        });
        return group;
    };

    homeReviewTrack.replaceChildren(createGroup(), createGroup(true));
    homeReviewTrack.style.setProperty(
        "--home-review-duration",
        `${Math.max(48, displayReviews.length * 13)}s`
    );
    homeReviewTrack.classList.add("is-ready");
    homeReviewTrack.setAttribute("aria-busy", "false");
};

const renderPublishedReviews = (reviews) => {
    const safeReviews = Array.isArray(reviews) ? reviews : [];
    renderHomeTestimonials(safeReviews);
    if (!reviewList || !reviewCount) return;
    reviewList.replaceChildren();
    reviewList.onscroll = null;
    reviewList.setAttribute("aria-busy", "false");
    reviewCount.textContent = `${safeReviews.length} review${safeReviews.length === 1 ? "" : "s"}`;

    if (safeReviews.length === 0) {
        reviewList.append(createReviewStatusCard(
            "No published reviews yet. Be the first to share your experience."
        ));
        return;
    }

    const reviewCards = [];
    safeReviews.forEach((review, index) => {
        const name = String(review?.name || "Portfolio client").trim() || "Portfolio client";
        const company = String(review?.company || "Independent client").trim() || "Independent client";
        const title = String(review?.title || "A creative collaboration").trim();
        const feedback = String(review?.feedback || "").trim();
        const rating = Math.min(5, Math.max(1, Number.parseInt(review?.rating, 10) || 1));

        const card = document.createElement("article");
        card.className = "review-card";
        card.dataset.reviewCardIndex = String(index);
        card.tabIndex = 0;

        const person = document.createElement("div");
        person.className = "review-card__person";
        const identity = document.createElement("span");
        const personName = document.createElement("strong");
        personName.textContent = name;
        const personMeta = document.createElement("span");
        personMeta.textContent = `${company} · ${formatReviewDate(review?.approvedAt)}`;
        identity.append(personName, personMeta);
        person.append(identity);

        const stars = document.createElement("div");
        stars.className = "review-card__stars";
        stars.setAttribute("aria-label", `${rating} out of 5 stars`);
        stars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;

        const heading = document.createElement("h4");
        heading.className = "review-card__title";
        heading.textContent = title;
        const reviewCopy = document.createElement("p");
        reviewCopy.className = "review-card__feedback";
        reviewCopy.textContent = feedback;

        card.append(person, stars, heading, reviewCopy);
        reviewList.append(card);
        reviewCards.push(card);
    });

    let activeReviewIndex = safeReviews.length > 1 ? 1 : 0;
    let reviewScrollFrame = null;
    const setActiveReviewCard = (nextIndex, { scroll = false, focus = false } = {}) => {
        const boundedIndex = Math.min(reviewCards.length - 1, Math.max(0, nextIndex));
        activeReviewIndex = boundedIndex;
        reviewCards.forEach((card, index) => {
            const isActive = index === activeReviewIndex;
            card.classList.toggle("is-active", isActive);
            card.setAttribute("aria-current", isActive ? "true" : "false");
        });

        const activeCard = reviewCards[activeReviewIndex];
        if (scroll) {
            activeCard.scrollIntoView({
                behavior: reducedMotion.matches ? "auto" : "smooth",
                block: "nearest",
                inline: "center"
            });
        }
        if (focus) activeCard.focus({ preventScroll: true });
    };

    reviewCards.forEach((card, index) => {
        card.addEventListener("click", () => setActiveReviewCard(index, { scroll: true }));
        card.addEventListener("focus", () => setActiveReviewCard(index, { scroll: true }));
        card.addEventListener("keydown", (event) => {
            if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            setActiveReviewCard(activeReviewIndex + direction, { scroll: true, focus: true });
        });
    });

    reviewList.onscroll = () => {
        window.cancelAnimationFrame(reviewScrollFrame);
        reviewScrollFrame = window.requestAnimationFrame(() => {
            const listBounds = reviewList.getBoundingClientRect();
            const listCenter = listBounds.left + listBounds.width / 2;
            const closestIndex = reviewCards.reduce((bestIndex, card, index) => {
                const bounds = card.getBoundingClientRect();
                const distance = Math.abs(bounds.left + bounds.width / 2 - listCenter);
                const bestBounds = reviewCards[bestIndex].getBoundingClientRect();
                const bestDistance = Math.abs(bestBounds.left + bestBounds.width / 2 - listCenter);
                return distance < bestDistance ? index : bestIndex;
            }, 0);
            setActiveReviewCard(closestIndex);
        });
    };

    window.requestAnimationFrame(() => setActiveReviewCard(activeReviewIndex, { scroll: true }));
};

const requestPublishedReviews = () => {
    if (!reviewsDataFrame || !reviewList) return;
    if (window.location.origin !== CONTACT_SITE_ORIGIN) {
        setReviewServiceReady(false, "Review submission is enabled on the live Jerome portfolio website.");
        reviewList.replaceChildren(createReviewStatusCard(
            "Published reviews load on the live Jerome portfolio website."
        ));
        setHomeTestimonialsStatus("Published client stories load on the live Jerome portfolio website.");
        reviewList.setAttribute("aria-busy", "false");
        return;
    }
    reviewsDataFrame.src = `${contactForm.action}?mode=reviews&nonce=${Date.now()}`;
};

const clearContactMailerTimeout = () => {
    window.clearTimeout(contactMailerTimeout);
    contactMailerTimeout = null;
};

const clearContactAttachmentPayload = () => {
    if (contactAttachmentsJson) contactAttachmentsJson.value = "";
};

const setContactAttachmentStatus = (message, state = "") => {
    if (!contactAttachmentStatus) return;
    contactAttachmentStatus.textContent = message;
    if (state) {
        contactAttachmentStatus.dataset.state = state;
    } else {
        delete contactAttachmentStatus.dataset.state;
    }
};

const formatContactAttachmentSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getContactAttachmentKey = (file) => (
    `${file.name}\u0000${file.size}\u0000${file.lastModified}`
);

const getContactAttachmentsTotalBytes = (files = contactSelectedAttachments) => (
    files.reduce((total, file) => total + file.size, 0)
);

const hideContactUploadProgress = () => {
    if (contactUploadProgressResetTimer !== null) {
        window.clearTimeout(contactUploadProgressResetTimer);
        contactUploadProgressResetTimer = null;
    }
    if (!contactUploadProgress) return;
    contactUploadProgress.hidden = true;
    contactUploadProgress.classList.remove("is-indeterminate");
    delete contactUploadProgress.dataset.state;
};

const setContactUploadProgress = (progress, label, options = {}) => {
    if (
        !contactUploadProgress
        || !contactUploadProgressLabel
        || !contactUploadProgressPercent
        || !contactUploadProgressTrack
        || !contactUploadProgressBar
    ) return;

    const value = Math.min(100, Math.max(0, Math.round(progress)));
    contactUploadProgress.hidden = false;
    contactUploadProgress.classList.toggle("is-indeterminate", options.indeterminate === true);
    if (options.state) {
        contactUploadProgress.dataset.state = options.state;
    } else {
        delete contactUploadProgress.dataset.state;
    }
    contactUploadProgressLabel.textContent = label;
    contactUploadProgressPercent.textContent = options.indeterminate ? "" : `${value}%`;
    contactUploadProgressTrack.setAttribute("aria-valuenow", String(value));
    contactUploadProgressBar.style.setProperty("--contact-upload-progress", `${value}%`);
};

const setContactAttachmentsLocked = (locked) => {
    if (contactAttachmentInput) {
        contactAttachmentInput.disabled = locked || !contactDocumentAttachmentsEnabled;
    }
    if (contactAttachmentDropzone) {
        contactAttachmentDropzone.disabled = locked || !contactDocumentAttachmentsEnabled;
    }
    contactAttachmentList?.querySelectorAll(".contact-form__file-remove").forEach((button) => {
        button.disabled = locked;
    });
};

const renderContactAttachmentList = () => {
    if (!contactAttachmentList || !contactAttachmentDropzone) return;
    contactAttachmentList.replaceChildren();
    contactAttachmentList.hidden = contactSelectedAttachments.length === 0;
    contactAttachmentDropzone.dataset.hasFiles = String(contactSelectedAttachments.length > 0);

    contactSelectedAttachments.forEach((file) => {
        const extension = String(file.name).split(".").pop().slice(0, 5) || "file";
        const item = document.createElement("li");
        item.className = "contact-form__file-item";

        const extensionLabel = document.createElement("span");
        extensionLabel.className = "contact-form__file-extension";
        extensionLabel.textContent = extension;

        const details = document.createElement("span");
        details.className = "contact-form__file-details";
        const name = document.createElement("span");
        name.className = "contact-form__file-name";
        name.textContent = file.name;
        name.title = file.name;
        const size = document.createElement("span");
        size.className = "contact-form__file-size";
        size.textContent = formatContactAttachmentSize(file.size);
        details.append(name, size);

        const removeButton = document.createElement("button");
        removeButton.className = "contact-form__file-remove";
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", `Remove ${file.name}`);
        removeButton.textContent = "\u00d7";
        removeButton.addEventListener("click", () => {
            contactSelectedAttachments = contactSelectedAttachments.filter(
                (selectedFile) => getContactAttachmentKey(selectedFile) !== getContactAttachmentKey(file)
            );
            clearContactAttachmentPayload();
            renderContactAttachmentList();
            updateContactAttachmentSummary();
        });

        item.append(extensionLabel, details, removeButton);
        contactAttachmentList.append(item);
    });
};

const updateContactAttachmentSummary = () => {
    if (contactSelectedAttachments.length === 0) {
        setContactAttachmentStatus(CONTACT_ATTACHMENT_DEFAULT_MESSAGE);
        return;
    }
    const count = contactSelectedAttachments.length;
    const totalSize = formatContactAttachmentSize(getContactAttachmentsTotalBytes());
    setContactAttachmentStatus(
        `${count} document${count === 1 ? "" : "s"} selected · ${totalSize} of 20 MB`,
        "ready"
    );
};

const resetContactAttachmentStatus = () => {
    clearContactAttachmentPayload();
    contactSelectedAttachments = [];
    if (contactAttachmentInput) contactAttachmentInput.value = "";
    renderContactAttachmentList();
    setContactAttachmentStatus(CONTACT_ATTACHMENT_DEFAULT_MESSAGE);
    hideContactUploadProgress();
};

const validateContactAttachment = (file) => {
    const extension = String(file?.name || "").split(".").pop().toLowerCase();
    const documentType = Object.prototype.hasOwnProperty.call(CONTACT_DOCUMENT_TYPES, extension)
        ? CONTACT_DOCUMENT_TYPES[extension]
        : null;
    const browserMimeType = String(file?.type || "").toLowerCase();

    if (!documentType) {
        throw new Error("Only PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF, TXT, or CSV documents are allowed.");
    }
    if (file.size < 1) throw new Error("The selected document is empty.");
    if (file.size > CONTACT_ATTACHMENT_MAX_BYTES) {
        throw new Error("Please attach a document no larger than 5 MB.");
    }
    if (
        !documentType.accepted.includes(browserMimeType)
        && !CONTACT_GENERIC_DOCUMENT_MIME_TYPES.includes(browserMimeType)
    ) {
        throw new Error("The selected file does not match its document extension.");
    }

    return { extension, mimeType: documentType.mimeType };
};

const readContactAttachment = (file, onProgress = null) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("progress", (event) => {
        if (event.lengthComputable && typeof onProgress === "function") {
            onProgress(event.loaded, event.total);
        }
    });
    reader.addEventListener("load", () => {
        const result = String(reader.result || "");
        const separatorIndex = result.indexOf(",");
        if (separatorIndex < 0) {
            reject(new Error("The selected document could not be read."));
            return;
        }
        resolve(result.slice(separatorIndex + 1));
    }, { once: true });
    reader.addEventListener("error", () => {
        reject(new Error("The selected document could not be read."));
    }, { once: true });
    reader.addEventListener("abort", () => {
        reject(new Error("Document reading was cancelled."));
    }, { once: true });
    reader.readAsDataURL(file);
});

const addContactAttachments = (files) => {
    const incomingFiles = [...files];
    if (incomingFiles.length === 0) return;

    const nextFiles = [...contactSelectedAttachments];
    const selectedKeys = new Set(nextFiles.map(getContactAttachmentKey));
    let totalBytes = getContactAttachmentsTotalBytes(nextFiles);
    const errors = [];

    incomingFiles.forEach((file) => {
        const fileKey = getContactAttachmentKey(file);
        if (selectedKeys.has(fileKey)) {
            errors.push(`${file.name} is already selected.`);
            return;
        }
        if (nextFiles.length >= CONTACT_ATTACHMENT_MAX_COUNT) {
            errors.push("You can attach up to 10 documents.");
            return;
        }

        try {
            validateContactAttachment(file);
        } catch (error) {
            errors.push(`${file.name}: ${error.message}`);
            return;
        }

        if (totalBytes + file.size > CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES) {
            errors.push("The selected documents cannot exceed 20 MB in total.");
            return;
        }

        nextFiles.push(file);
        selectedKeys.add(fileKey);
        totalBytes += file.size;
    });

    contactSelectedAttachments = nextFiles;
    clearContactAttachmentPayload();
    renderContactAttachmentList();
    updateContactAttachmentSummary();

    if (errors.length > 0) {
        setContactAttachmentStatus(errors[0], "error");
        showContactToast(errors[0], "error", "Document not added", 8000);
    }
};

const isTrustedContactMailerOrigin = (origin) => (
    origin === "https://script.google.com"
    || /^https:\/\/[a-z0-9-]+\.googleusercontent\.com$/iu.test(origin)
);

window.addEventListener("message", (event) => {
    if (
        !isTrustedContactMailerOrigin(event.origin)
        || !event.data
        || event.data.source !== CONTACT_MAILER_SOURCE
        || !contactForm
    ) return;

    if (event.data.type === "reviews") {
        const isReviewServiceReady = event.data.reviewSubmissions === true;
        setReviewServiceReady(
            isReviewServiceReady,
            isReviewServiceReady
                ? "Reviews are checked by Jerome before they are published."
                : "Review submission is temporarily unavailable."
        );
        renderPublishedReviews(event.data.reviews);
        return;
    }

    if (event.data.type === "review-result" && reviewForm) {
        clearReviewFormTimeout();
        setReviewServiceReady(event.data.reviewSubmissions === true);
        reviewFormSubmit.disabled = !reviewServiceReady;

        if (event.data.success) {
            const successMessage = event.data.message
                || "Thank you! Your review was submitted for Jerome's approval.";
            reviewForm.reset();
            reviewForm.dataset.state = "success";
            reviewFormSubmitLabel.textContent = "Review submitted";
            reviewFormStatus.textContent = successMessage;
            showReviewToast(successMessage, "success", "Review received", 8000);
            requestPublishedReviews();
            return;
        }

        const reviewErrorMessage = event.data.message || "Your review could not be submitted.";
        reviewForm.dataset.state = "error";
        reviewFormSubmitLabel.textContent = "Try again";
        reviewFormStatus.textContent = reviewErrorMessage;
        showReviewToast(reviewErrorMessage, "error", "Review not submitted", 8000);
        return;
    }

    if (event.data.type === "capabilities") {
        contactMailerCapabilityProbePending = false;
        contactDocumentAttachmentsEnabled = event.data.documentAttachments === true
            && Number(event.data.maxAttachmentBytes) >= CONTACT_ATTACHMENT_MAX_BYTES
            && Number(event.data.maxAttachments) >= CONTACT_ATTACHMENT_MAX_COUNT
            && Number(event.data.maxTotalAttachmentBytes) >= CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES;
        setContactAttachmentsLocked(false);
        if (contactDocumentAttachmentsEnabled) {
            resetContactAttachmentStatus();
        } else {
            clearContactAttachmentPayload();
            setContactAttachmentStatus(
                "Document attachments will activate after the secure mail service update. Messages still work normally."
            );
        }
        return;
    }

    const isDeliveryResponse = event.data.type === "result"
        || (!event.data.type && contactForm.dataset.state === "sending");
    if (!isDeliveryResponse) return;

    clearContactMailerTimeout();
    contactFormSubmit.disabled = false;
    setContactAttachmentsLocked(false);

    if (event.data.success) {
        const successMessage = event.data.message || "Thank you! Your message was sent to Jerome.";
        const sentAttachmentCount = contactSelectedAttachments.length;
        contactForm.reset();
        clearContactAttachmentPayload();
        contactSelectedAttachments = [];
        if (contactAttachmentInput) contactAttachmentInput.value = "";
        renderContactAttachmentList();
        setContactAttachmentStatus(CONTACT_ATTACHMENT_DEFAULT_MESSAGE);
        if (sentAttachmentCount > 0) {
            setContactUploadProgress(
                100,
                `${sentAttachmentCount} document${sentAttachmentCount === 1 ? "" : "s"} uploaded`,
                { state: "success" }
            );
            contactUploadProgressResetTimer = window.setTimeout(hideContactUploadProgress, 1600);
        } else {
            hideContactUploadProgress();
        }
        contactForm.dataset.state = "success";
        contactFormSubmitLabel.textContent = "Message sent";
        contactFormStatus.textContent = successMessage;
        showContactToast(successMessage, "success", "Message sent");
        return;
    }

    const errorMessage = event.data.message || "The email service could not send your message.";
    contactForm.dataset.state = "error";
    contactFormSubmitLabel.textContent = "Try again";
    contactFormStatus.textContent = errorMessage;
    if (contactSelectedAttachments.length > 0) {
        setContactUploadProgress(100, "Upload failed. Your selected documents are still ready.", {
            state: "error"
        });
    }
    showContactToast(errorMessage, "error", "Message not sent", 8000);
});

if (contactAttachmentInput && contactAttachmentDropzone && contactMailerCapabilityFrame && contactForm) {
    contactMailerCapabilityProbePending = true;
    setContactAttachmentsLocked(true);
    contactMailerCapabilityFrame.src = `${contactForm.action}?capabilities=document-attachments-v1`;
    window.setTimeout(() => {
        if (!contactMailerCapabilityProbePending) return;
        contactMailerCapabilityProbePending = false;
        contactDocumentAttachmentsEnabled = false;
        setContactAttachmentsLocked(false);
        setContactAttachmentStatus(
            "Document attachments are temporarily unavailable. You can still send your message."
        );
    }, 10000);
}

contactAttachmentInput?.addEventListener("change", () => {
    addContactAttachments(contactAttachmentInput.files || []);
    contactAttachmentInput.value = "";
});

contactAttachmentDropzone?.addEventListener("click", () => {
    if (!contactAttachmentDropzone.disabled) contactAttachmentInput?.click();
});

contactAttachmentDropzone?.addEventListener("dragover", (event) => {
    if (contactAttachmentDropzone.disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    contactAttachmentDropzone.classList.add("is-dragging");
});

contactAttachmentDropzone?.addEventListener("dragleave", (event) => {
    if (!contactAttachmentDropzone.contains(event.relatedTarget)) {
        contactAttachmentDropzone.classList.remove("is-dragging");
    }
});

contactAttachmentDropzone?.addEventListener("drop", (event) => {
    if (contactAttachmentDropzone.disabled) return;
    event.preventDefault();
    contactAttachmentDropzone.classList.remove("is-dragging");
    addContactAttachments(event.dataTransfer.files || []);
});

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (["preparing", "sending"].includes(contactForm.dataset.state)) return;

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    if (!name || !email || !message) return;

    if (window.location.origin !== CONTACT_SITE_ORIGIN) {
        const hostedSiteMessage = "Email sending is enabled on the live Jerome portfolio website.";
        contactForm.dataset.state = "error";
        contactFormSubmitLabel.textContent = "Use hosted site";
        contactFormStatus.textContent = hostedSiteMessage;
        showContactToast(hostedSiteMessage, "warning", "Live website required", 8000);
        return;
    }

    const attachments = contactDocumentAttachmentsEnabled
        ? [...contactSelectedAttachments]
        : [];
    clearContactAttachmentPayload();
    if (attachments.length > 0) {
        contactForm.dataset.state = "preparing";
        contactFormSubmit.disabled = true;
        setContactAttachmentsLocked(true);
        contactFormSubmitLabel.textContent = "Preparing documents...";
        contactFormStatus.textContent = "Checking and securely preparing your documents...";
        setContactUploadProgress(0, `Preparing 1 of ${attachments.length} documents...`);
        showContactToast(
            `Checking and securely preparing ${attachments.length} document${attachments.length === 1 ? "" : "s"}...`,
            "info",
            "Preparing documents",
            0
        );

        try {
            if (attachments.length > CONTACT_ATTACHMENT_MAX_COUNT) {
                throw new Error("You can attach up to 10 documents.");
            }
            const totalBytes = getContactAttachmentsTotalBytes(attachments);
            if (totalBytes > CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES) {
                throw new Error("The selected documents cannot exceed 20 MB in total.");
            }

            const attachmentKeys = attachments.map(getContactAttachmentKey).join("\u0001");
            const encodedAttachments = [];
            let completedBytes = 0;

            for (let index = 0; index < attachments.length; index += 1) {
                const attachment = attachments[index];
                const documentType = validateContactAttachment(attachment);
                const encodedDocument = await readContactAttachment(attachment, (loadedBytes) => {
                    const progress = ((completedBytes + loadedBytes) / totalBytes) * 100;
                    setContactUploadProgress(
                        progress,
                        `Preparing ${index + 1} of ${attachments.length} documents...`
                    );
                });
                if (contactSelectedAttachments.map(getContactAttachmentKey).join("\u0001") !== attachmentKeys) {
                    throw new Error("The selected documents changed. Please submit again.");
                }
                encodedAttachments.push({
                    name: attachment.name,
                    type: documentType.mimeType,
                    size: attachment.size,
                    data: encodedDocument
                });
                completedBytes += attachment.size;
                setContactUploadProgress(
                    (completedBytes / totalBytes) * 100,
                    `Prepared ${index + 1} of ${attachments.length} documents`
                );
            }

            contactAttachmentsJson.value = JSON.stringify(encodedAttachments);
        } catch (error) {
            const attachmentErrorMessage = error.message || "The selected document could not be attached.";
            clearContactAttachmentPayload();
            contactForm.dataset.state = "error";
            contactFormSubmit.disabled = false;
            setContactAttachmentsLocked(false);
            contactFormSubmitLabel.textContent = "Try again";
            contactFormStatus.textContent = attachmentErrorMessage;
            setContactUploadProgress(100, attachmentErrorMessage, { state: "error" });
            showContactToast(attachmentErrorMessage, "error", "Document not attached", 8000);
            return;
        }
    } else {
        hideContactUploadProgress();
    }

    contactForm.dataset.state = "sending";
    contactFormSubmit.disabled = true;
    setContactAttachmentsLocked(true);
    contactFormSubmitLabel.textContent = "Sending...";
    contactFormStatus.textContent = attachments.length > 0
        ? `Uploading ${attachments.length} document${attachments.length === 1 ? "" : "s"} and sending your message securely...`
        : "Sending your message securely...";
    if (attachments.length > 0) {
        setContactUploadProgress(100, "Uploading documents securely...", { indeterminate: true });
    }
    showContactToast(contactFormStatus.textContent, "info", "Sending message", 0);

    clearContactMailerTimeout();
    contactMailerTimeout = window.setTimeout(() => {
        const delayedMessage = "Your message was submitted, but delivery confirmation is delayed. Please wait before sending it again.";
        contactForm.dataset.state = "pending";
        contactFormSubmit.disabled = false;
        setContactAttachmentsLocked(false);
        contactFormSubmitLabel.textContent = "Message submitted";
        contactFormStatus.textContent = delayedMessage;
        if (attachments.length > 0) {
            setContactUploadProgress(100, "Upload submitted; confirmation is delayed.", {
                state: "success"
            });
        }
        showContactToast(delayedMessage, "warning", "Message submitted", 9000);
        contactMailerTimeout = null;
    }, CONTACT_MAILER_TIMEOUT_MS);

    HTMLFormElement.prototype.submit.call(contactForm);
});

reviewForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (["sending", "pending"].includes(reviewForm.dataset.state)) return;

    if (window.location.origin !== CONTACT_SITE_ORIGIN) {
        const hostedReviewMessage = "Review submission is enabled on the live Jerome portfolio website.";
        reviewForm.dataset.state = "error";
        reviewFormSubmitLabel.textContent = "Use hosted site";
        reviewFormStatus.textContent = hostedReviewMessage;
        showReviewToast(hostedReviewMessage, "warning", "Live website required", 8000);
        return;
    }

    if (!reviewServiceReady) {
        const unavailableMessage = "The secure review service is still connecting. Please try again shortly.";
        reviewForm.dataset.state = "error";
        reviewFormStatus.textContent = unavailableMessage;
        showReviewToast(unavailableMessage, "warning", "Review service connecting", 7000);
        requestPublishedReviews();
        return;
    }

    reviewForm.dataset.state = "sending";
    reviewFormSubmit.disabled = true;
    reviewFormSubmitLabel.textContent = "Submitting...";
    reviewFormStatus.textContent = "Sending your review securely for Jerome's approval...";
    showReviewToast(reviewFormStatus.textContent, "info", "Submitting review", 0);

    clearReviewFormTimeout();
    reviewFormTimeout = window.setTimeout(() => {
        const delayedReviewMessage = "Your review was submitted, but confirmation is delayed. Please avoid submitting it again.";
        reviewForm.dataset.state = "pending";
        reviewFormSubmit.disabled = false;
        reviewFormSubmitLabel.textContent = "Review submitted";
        reviewFormStatus.textContent = delayedReviewMessage;
        showReviewToast(delayedReviewMessage, "warning", "Review submitted", 9000);
        reviewFormTimeout = null;
    }, REVIEW_FORM_TIMEOUT_MS);

    HTMLFormElement.prototype.submit.call(reviewForm);
});

if (reviewsDataFrame && reviewList && reviewForm) {
    requestPublishedReviews();
    window.setTimeout(() => {
        if (reviewServiceReady || window.location.origin !== CONTACT_SITE_ORIGIN) return;
        setReviewServiceReady(false, "The secure review service is temporarily unavailable.");
        reviewList.replaceChildren(createReviewStatusCard(
            "Published reviews could not be loaded. Please try again later.",
            "error"
        ));
        setHomeTestimonialsStatus("Client stories could not be loaded. Please try again later.", "error");
        reviewList.setAttribute("aria-busy", "false");
    }, 12000);
}

const bindSocialFilterButton = (button) => {
    button.addEventListener("click", () => {
        closeSocialLightbox();
        socialActiveCategory = button.dataset.socialFilter;
        socialActiveIndex = 0;

        socialFilterButtons.forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle("is-active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });

        updateSocialCarousel();
    });
};

const bindSocialSlide = (slide) => {
    const image = slide.querySelector("img");
    if (image.complete) {
        syncSocialSlideAspect(slide);
    } else {
        image.addEventListener("load", () => syncSocialSlideAspect(slide), { once: true });
    }

    slide.addEventListener("click", () => {
        const filteredSlides = getFilteredSocialSlides();
        const selectedIndex = filteredSlides.indexOf(slide);
        if (selectedIndex < 0) return;

        if (selectedIndex === socialActiveIndex) {
            openSocialLightbox(slide);
            return;
        }

        socialActiveIndex = selectedIndex;
        updateSocialCarousel();
    });
};

const showSocialGalleryStatus = (message) => {
    const status = document.createElement("p");
    status.className = "social-carousel__status";
    status.setAttribute("role", "status");
    status.dataset.socialGalleryStatus = "";
    status.textContent = message;
    socialCarouselStage.replaceChildren(status);
};

const renderSocialGallery = (manifest) => {
    if (!Array.isArray(manifest?.categories)) {
        throw new Error("The social gallery manifest has no categories array.");
    }

    const categories = manifest.categories.filter((category) => (
        typeof category?.id === "string" &&
        typeof category?.name === "string" &&
        Array.isArray(category?.images) &&
        category.images.length > 0
    ));
    if (categories.length === 0) throw new Error("The social gallery has no category images.");

    const filterFragment = document.createDocumentFragment();
    [{ id: "all", name: "All" }, ...categories].forEach((category, index) => {
        const button = document.createElement("button");
        button.className = "social-filters__button";
        button.classList.toggle("is-active", index === 0);
        button.type = "button";
        button.dataset.socialFilter = category.id;
        button.setAttribute("aria-pressed", String(index === 0));
        button.textContent = category.name;
        filterFragment.append(button);
    });
    socialFilters.replaceChildren(filterFragment);
    socialFilterButtons = [...socialFilters.querySelectorAll("[data-social-filter]")];
    socialFilterButtons.forEach(bindSocialFilterButton);

    const slideFragment = document.createDocumentFragment();
    categories.forEach((category) => {
        category.images.forEach((entry) => {
            if (typeof entry?.src !== "string") return;

            const label = typeof entry.alt === "string" && entry.alt.trim()
                ? entry.alt.trim()
                : "Social media design";
            const slide = document.createElement("button");
            slide.className = "social-carousel__slide";
            slide.type = "button";
            slide.dataset.socialCategory = category.id;
            slide.setAttribute("aria-label", `View ${label}`);

            const image = document.createElement("img");
            image.src = entry.src;
            image.alt = label;
            image.loading = "lazy";
            image.decoding = "async";
            image.draggable = false;
            slide.append(image);
            slideFragment.append(slide);
        });
    });

    socialCarouselStage.replaceChildren(slideFragment);
    socialSlides = [...socialCarouselStage.querySelectorAll(".social-carousel__slide")];
    socialSlides.forEach(bindSocialSlide);
    socialActiveCategory = "all";
    socialActiveIndex = 0;
    socialFilters.setAttribute("aria-busy", "false");
    socialCarouselStage.setAttribute("aria-busy", "false");
    updateSocialCarousel();

    if (document.body.dataset.page === "social-media-design") {
        setSocialGalleryActive(true);
    }
};

const loadSocialGallery = async () => {
    try {
        if (window.SOCIAL_GALLERY_MANIFEST) {
            renderSocialGallery(window.SOCIAL_GALLERY_MANIFEST);
            return;
        }

        const response = await fetch(SOCIAL_GALLERY_MANIFEST_URL, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Gallery manifest request failed with status ${response.status}.`);
        }
        renderSocialGallery(await response.json());
    } catch (error) {
        console.error("Social media gallery could not be loaded.", error);
        socialSlides = [];
        socialFilterButtons = [];
        socialFilters.replaceChildren();
        socialFilters.setAttribute("aria-busy", "false");
        socialCarouselStage.setAttribute("aria-busy", "false");
        showSocialGalleryStatus("Designs could not be loaded.");
        updateSocialCarousel();
    }
};

void loadSocialGallery();
void loadAIGallery();
void loadVideoGallery();

socialPreviousButton?.addEventListener("click", () => moveSocialCarousel(-1));
socialNextButton?.addEventListener("click", () => moveSocialCarousel(1));
socialCarouselStage?.addEventListener("pointerdown", (event) => {
    if (
        event.button !== 0 ||
        event.isPrimary === false ||
        socialDragPointerId !== null ||
        getFilteredSocialSlides().length < 2
    ) return;

    socialDragPointerId = event.pointerId;
    socialDragStartX = event.clientX;
    socialDragStartY = event.clientY;
    socialDragStartIndex = socialActiveIndex;
    const fallbackStepDistance = Math.min(
        160,
        Math.max(112, socialCarouselStage.clientWidth * 0.16)
    );
    const activeSlide = socialCarouselStage.querySelector('[data-position="active"]');
    const adjacentSlide = socialCarouselStage.querySelector('[data-position="next"]');
    if (activeSlide && adjacentSlide) {
        const activeBounds = activeSlide.getBoundingClientRect();
        const adjacentBounds = adjacentSlide.getBoundingClientRect();
        const activeCenter = activeBounds.left + activeBounds.width / 2;
        const adjacentCenter = adjacentBounds.left + adjacentBounds.width / 2;
        const measuredStepDistance = Math.abs(adjacentCenter - activeCenter);
        socialDragStepDistance = measuredStepDistance >= 72
            ? measuredStepDistance
            : fallbackStepDistance;
    } else {
        socialDragStepDistance = fallbackStepDistance;
    }
    socialDragAxis = null;
});
socialCarouselStage?.addEventListener("pointermove", updateSocialCarouselDrag);
socialCarouselStage?.addEventListener("click", (event) => {
    if (!socialDragSuppressClick) return;

    event.preventDefault();
    event.stopPropagation();
    socialDragSuppressClick = false;
}, true);
window.addEventListener("pointerup", (event) => finishSocialCarouselDrag(event));
window.addEventListener("pointercancel", finishSocialCarouselDrag);
socialLightboxClose?.addEventListener("click", closeSocialLightbox);
socialLightboxBackdrop?.addEventListener("click", closeSocialLightbox);
socialLightboxPrevious?.addEventListener("click", () => moveSocialLightbox(-1));
socialLightboxNext?.addEventListener("click", () => moveSocialLightbox(1));
aiViewerClose?.addEventListener("click", () => closeAIViewer());
aiViewer?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest(".ai-viewer__image, .ai-viewer__close")) return;
    closeAIViewer();
});
videoPreviousButton?.addEventListener("click", () => setVideoActiveIndex(videoActiveIndex - 1, { focus: true }));
videoNextButton?.addEventListener("click", () => setVideoActiveIndex(videoActiveIndex + 1, { focus: true }));
videoDetailCloseButton?.addEventListener("click", () => closeVideoDetail());
videoWatchButton?.addEventListener("click", toggleVideoWatch);
videoDetailVideo?.addEventListener("play", () => setVideoWatchButtonState(true));
videoDetailVideo?.addEventListener("pause", () => setVideoWatchButtonState(false));

printObjects.forEach((printObject) => {
    printObject.addEventListener("click", () => openPrintViewer(printObject));
});

printViewerClose?.addEventListener("click", closePrintViewer);
printViewerBackdrop?.addEventListener("click", closePrintViewer);
printViewerReset?.addEventListener("click", resetPrintViewerRotation);
printViewerFront?.addEventListener("load", syncPrintViewerSize);

printViewerRotator?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || printDragPointerId !== null) return;

    event.preventDefault();
    printDragPointerId = event.pointerId;
    printDragStartX = event.clientX;
    printDragStartY = event.clientY;
    printDragStartRotationX = printRotationX;
    printDragStartRotationY = printRotationY;
    printViewerRotator.classList.add("is-dragging");
    printViewerRotator.setPointerCapture(event.pointerId);
});

printViewerRotator?.addEventListener("pointermove", (event) => {
    if (event.pointerId !== printDragPointerId) return;

    const horizontalDistance = event.clientX - printDragStartX;
    const verticalDistance = event.clientY - printDragStartY;
    printRotationY = printDragStartRotationY + horizontalDistance * 0.34;
    printRotationX = Math.max(
        -78,
        Math.min(78, printDragStartRotationX - verticalDistance * 0.3)
    );
    applyPrintViewerRotation();
});

const stopPrintViewerDrag = (event) => {
    if (event.pointerId !== printDragPointerId) return;

    if (printViewerRotator.hasPointerCapture(event.pointerId)) {
        printViewerRotator.releasePointerCapture(event.pointerId);
    }
    printViewerRotator.classList.remove("is-dragging");
    printDragPointerId = null;
};

printViewerRotator?.addEventListener("pointerup", stopPrintViewerDrag);
printViewerRotator?.addEventListener("pointercancel", stopPrintViewerDrag);

document.addEventListener("wheel", (event) => {
    if (event.ctrlKey) return;
    if (isSocialLightboxOpen() || isPrintViewerOpen() || isAIViewerOpen() || isVideoExperienceOpen()) {
        event.preventDefault();
        return;
    }
    if (event.target instanceof Element && event.target.closest(".toc-sidebar")) return;

    event.preventDefault();
    if (pageNavigationLocked || event.deltaY === 0) return;

    const deltaMultiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
    const normalizedDelta = event.deltaY * deltaMultiplier;
    const isEducationPage = document.body.dataset.page === "education";

    if (isEducationPage) registerEducationExitWheel(normalizedDelta);

    if (scrollActivePage(normalizedDelta)) {
        wheelDelta = 0;
        window.clearTimeout(wheelResetTimer);
        const educationScrollDirection = Math.sign(normalizedDelta);
        if (isEducationPage && isEducationAtExitEdge(educationScrollDirection)) {
            setEducationExitArmed(educationScrollDirection);
        }
        return;
    }

    wheelDelta += normalizedDelta;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
        wheelDelta = 0;
    }, 180);

    if (Math.abs(wheelDelta) < WHEEL_NAVIGATION_THRESHOLD) return;

    const direction = Math.sign(wheelDelta);
    wheelDelta = 0;

    if (isEducationPage && isEducationAtExitEdge(direction)) {
        if (!educationExitArmed || educationExitDirection !== direction) {
            setEducationExitArmed(direction);
            return;
        }
        if (!educationExitConfirmationGestureActive) return;
        setEducationExitArmed();
    }

    navigateByStep(direction);
}, { passive: false });

window.addEventListener("popstate", (event) => {
    showPage(event.state?.page || "home");
});

document.addEventListener("keydown", (event) => {
    if (document.body.dataset.page === "video-editing") {
        if (event.key === "Escape") {
            if (videoMode === "detail") {
                event.preventDefault();
                closeVideoDetail();
                return;
            }
        }

        if (videoMode === "rail" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
            event.preventDefault();
            setVideoActiveIndex(videoActiveIndex + (event.key === "ArrowRight" ? 1 : -1), { focus: true });
            return;
        }

        if (videoMode === "rail" && event.key === "Enter" && document.activeElement?.classList.contains("video-poster")) {
            event.preventDefault();
            openVideoDetail(videoActiveIndex, videoPosterButtons[videoActiveIndex]);
            return;
        }

        if (videoMode !== "rail" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(event.key)) {
            event.preventDefault();
            return;
        }
    }

    if (isAIViewerOpen()) {
        if (event.key === "Tab") {
            event.preventDefault();
            aiViewerClose.focus();
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeAIViewer();
            return;
        }

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(event.key)) {
            event.preventDefault();
            return;
        }
    }

    if (isPrintViewerOpen()) {
        if (event.key === "Tab") {
            const viewerControls = [
                printViewerRotator,
                printViewerReset,
                printViewerClose
            ].filter((control) => control && !control.disabled);
            const currentControlIndex = viewerControls.indexOf(document.activeElement);
            const nextControlIndex = event.shiftKey
                ? (currentControlIndex <= 0 ? viewerControls.length - 1 : currentControlIndex - 1)
                : (currentControlIndex >= viewerControls.length - 1 ? 0 : currentControlIndex + 1);

            event.preventDefault();
            viewerControls[nextControlIndex].focus();
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closePrintViewer();
            return;
        }

        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            event.preventDefault();
            if (event.key === "ArrowLeft") printRotationY -= 8;
            if (event.key === "ArrowRight") printRotationY += 8;
            if (event.key === "ArrowUp") printRotationX = Math.min(78, printRotationX + 8);
            if (event.key === "ArrowDown") printRotationX = Math.max(-78, printRotationX - 8);
            applyPrintViewerRotation();
            return;
        }

        if (event.key === "Home") {
            event.preventDefault();
            resetPrintViewerRotation();
            return;
        }

        if (["PageUp", "PageDown"].includes(event.key)) {
            event.preventDefault();
            return;
        }
    }

    if (isSocialLightboxOpen()) {
        if (event.key === "Tab") {
            const lightboxControls = [
                socialLightboxClose,
                socialLightboxPrevious,
                socialLightboxNext
            ].filter((control) => control && !control.disabled);
            const currentControlIndex = lightboxControls.indexOf(document.activeElement);
            const nextControlIndex = event.shiftKey
                ? (currentControlIndex <= 0 ? lightboxControls.length - 1 : currentControlIndex - 1)
                : (currentControlIndex >= lightboxControls.length - 1 ? 0 : currentControlIndex + 1);

            event.preventDefault();
            lightboxControls[nextControlIndex].focus();
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeSocialLightbox();
            return;
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            moveSocialLightbox(event.key === "ArrowRight" ? 1 : -1);
            return;
        }

        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) {
            event.preventDefault();
            return;
        }
    }

    if (event.key === "Escape" && sidebar.dataset.open === "true") {
        setSidebarOpen(false);
        navToggle.focus();
        return;
    }

    if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (
            event.target instanceof Element &&
            event.target.matches("input, textarea, select, [contenteditable='true']")
        ) ||
        (
            sidebar.dataset.open === "true" &&
            event.target instanceof Element &&
            event.target.closest(".toc-sidebar")
        )
    ) return;

    if (
        document.body.dataset.page === "social-media-design" &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
        event.preventDefault();
        moveSocialCarousel(event.key === "ArrowRight" ? 1 : -1);
        return;
    }

    const keyNavigation = {
        ArrowDown: { direction: 1, distance: 72 },
        PageDown: { direction: 1, distance: window.innerHeight * 0.82 },
        ArrowUp: { direction: -1, distance: -72 },
        PageUp: { direction: -1, distance: window.innerHeight * -0.82 }
    }[event.key];

    if (!keyNavigation) return;

    event.preventDefault();
    if (scrollActivePage(keyNavigation.distance)) return;

    navigateByStep(keyNavigation.direction);
});

mobileSidebar.addEventListener("change", syncSidebarAvailability);
educationSection?.addEventListener("scroll", () => {
    scheduleEducationTimelineUpdate();
    if (educationExitArmed && !isEducationAtExitEdge(educationExitDirection)) {
        setEducationExitArmed();
    }
}, { passive: true });
window.addEventListener("resize", () => {
    if (isPrintViewerOpen()) syncPrintViewerSize();
    syncAIGalleryLayout();
    if (document.body.dataset.page === "ai-generated-design" && !isAIViewerOpen()) {
        window.clearTimeout(aiFloatResizeTimer);
        aiFloatResizeTimer = window.setTimeout(startAIFloatSequence, 180);
    }
});
reducedMotion.addEventListener("change", () => {
    setEducationTimelineActive(document.body.dataset.page === "education");
    setSocialGalleryActive(document.body.dataset.page === "social-media-design");
    setPrintShowcaseActive(document.body.dataset.page === "print-marketing-materials");
    setAIGalleryActive(document.body.dataset.page === "ai-generated-design");
    setVideoGalleryActive(document.body.dataset.page === "video-editing");
});
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseAllAIFloatCards("visibility");
    } else {
        resumeAllAIFloatCards("visibility");
    }
});
updateSocialCarousel();
const initialPageRequest = window.location.hash.slice(1) || "home";
const initialPageId = pageExists(initialPageRequest) ? resolvePageId(initialPageRequest) : "home";
window.history.replaceState({ page: initialPageRequest }, "", cleanPageUrl);
showPage(initialPageId === "home" ? "home" : initialPageRequest, false);
syncSidebarAvailability();
