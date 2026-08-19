(() => {
    "use strict";

    const moderationWebAppUrl = "https://script.google.com/macros/s/AKfycbyc81epxNpehBmO-qObFjn76f3UxAPtw1w3_FOHyP6Z67LlSlL0w95nL3pJSbI360-4Vw/exec";
    const page = document.querySelector("main");
    const heading = document.querySelector("h1");
    const message = document.querySelector("[data-message]");
    const parameters = new URLSearchParams(window.location.hash.slice(1));
    const action = parameters.get("reviewAction") || "";
    const reviewId = parameters.get("reviewId") || "";
    const reviewToken = parameters.get("reviewToken") || "";
    const validAction = action === "approve" || action === "reject";

    if (!validAction || !/^[a-f0-9]{32}$/iu.test(reviewId) || !/^[a-f0-9]{64}$/iu.test(reviewToken)) {
        page.dataset.state = "error";
        heading.textContent = "Invalid moderation link";
        message.textContent = "This link is incomplete or invalid. Please use the newest moderation email.";
        return;
    }

    const destination = new URL(moderationWebAppUrl);
    destination.searchParams.set("reviewAction", action);
    destination.searchParams.set("reviewId", reviewId);
    destination.searchParams.set("reviewToken", reviewToken);
    heading.textContent = action === "approve"
        ? "Accepting and posting review..."
        : "Declining and deleting review...";
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    fetch(destination.toString(), {
        method: "GET",
        mode: "no-cors",
        credentials: "omit",
        cache: "no-store",
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(() => {
        page.dataset.state = "complete";
        heading.textContent = action === "approve"
            ? "Review accepted and posted"
            : "Review declined and deleted";
        message.textContent = action === "approve"
            ? "The review action was sent securely. Open the reviews page to see the published review."
            : "The review action was sent securely and the pending review was removed.";
    }).catch(() => {
        page.dataset.state = "error";
        heading.textContent = "Could not reach the review service";
        message.textContent = "Please retry from the newest email. If the service is temporarily unavailable, try again in a moment.";
    });
})();
