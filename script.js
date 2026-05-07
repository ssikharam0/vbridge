const header = document.querySelector("#siteHeader");
const menuToggle = document.querySelector(".menu-toggle");
const navShell = document.querySelector("#siteNav");
const dropdownItems = document.querySelectorAll(".has-dropdown");
const tabButtons = document.querySelectorAll(".tab-button");
const consultationModal = document.querySelector("#consultationModal");
const consultationForm = document.querySelector("#consultationForm");
const consultationTriggers = document.querySelectorAll(".js-open-consultation");
const closeConsultationButtons = document.querySelectorAll("[data-close-consultation]");
const formStatus = document.querySelector("#formStatus");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastFocusedElement = null;
const fallbackContactHtml = 'We could not send the form right now. Please <a href="tel:+919573899699">call +91 95738 99699</a> or <a href="https://wa.me/919573899699" target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.';

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

document.querySelector("#currentYear").textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  navShell.classList.toggle("is-open", !isOpen);
});

const closeMobileMenu = () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  navShell.classList.remove("is-open");
};

document.querySelectorAll("#siteNav a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

dropdownItems.forEach((item) => {
  const button = item.querySelector("button");
  const links = item.querySelectorAll(".dropdown a");

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = item.classList.contains("is-open");

    dropdownItems.forEach((otherItem) => {
      otherItem.classList.remove("is-open");
      otherItem.querySelector("button").setAttribute("aria-expanded", "false");
    });

    item.classList.toggle("is-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      item.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
});

document.addEventListener("click", () => {
  dropdownItems.forEach((item) => {
    item.classList.remove("is-open");
    item.querySelector("button").setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && consultationModal.classList.contains("is-open")) {
    closeConsultationModal();
    return;
  }

  if (event.key === "Tab" && consultationModal.classList.contains("is-open")) {
    trapModalFocus(event);
    return;
  }

  if (event.key !== "Escape") return;

  closeMobileMenu();
  dropdownItems.forEach((item) => {
    item.classList.remove("is-open");
    item.querySelector("button").setAttribute("aria-expanded", "false");
  });
});

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("aria-controls");

    tabButtons.forEach((tab) => {
      tab.classList.toggle("active", tab === button);
      tab.setAttribute("aria-selected", String(tab === button));
    });

    document.querySelectorAll(".testimonial-panel").forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  });
});

const getFocusableModalElements = () =>
  Array.from(
    consultationModal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));

function trapModalFocus(event) {
  const focusableElements = getFocusableModalElements();
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!firstElement || !lastElement) return;

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function openConsultationModal() {
  lastFocusedElement = document.activeElement;
  consultationModal.classList.add("is-open");
  consultationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  formStatus.textContent = "";
  formStatus.className = "form-status";

  window.setTimeout(() => {
    const firstInput = consultationForm.querySelector('input[name="Full Name"]');
    firstInput.focus();
  }, 80);
}

function closeConsultationModal() {
  consultationModal.classList.remove("is-open");
  consultationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

consultationTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    closeMobileMenu();
    openConsultationModal();
  });
});

closeConsultationButtons.forEach((button) => {
  button.addEventListener("click", closeConsultationModal);
});

consultationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!consultationForm.reportValidity()) return;

  const submitButton = consultationForm.querySelector(".form-submit");
  const formData = new FormData(consultationForm);

  submitButton.disabled = true;
  submitButton.textContent = "Sending request...";
  formStatus.className = "form-status";
  formStatus.textContent = "Sending your consultation request securely.";

  try {
    const response = await fetch("https://formsubmit.co/ajax/visas@visistavisas.com", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    const responseBody = await response.json();
    if (responseBody.success === false) {
      throw new Error("Form submission rejected");
    }

    consultationForm.reset();
    formStatus.className = "form-status is-success";
    formStatus.textContent = "Thank you. Your request has been sent. The V BRIDGE team will contact you soon.";
    submitButton.textContent = "Request Sent";

    window.setTimeout(() => {
      submitButton.textContent = "Send Consultation Request";
      closeConsultationModal();
    }, 2600);
  } catch (error) {
    formStatus.className = "form-status is-error";
    formStatus.innerHTML = fallbackContactHtml;
    submitButton.textContent = "Send Consultation Request";
  } finally {
    submitButton.disabled = false;
  }
});

const canvas = document.querySelector("#neuralCanvas");
const context = canvas.getContext("2d");
let particles = [];
let width = 0;
let height = 0;
let animationFrame = null;

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const resizeCanvas = () => {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const particleCount = Math.min(92, Math.max(36, Math.floor(width / 18)));
  particles = Array.from({ length: particleCount }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx: randomBetween(-0.18, 0.18),
    vy: randomBetween(-0.16, 0.16),
    radius: randomBetween(1.1, 2.4),
    pulse: randomBetween(0, Math.PI * 2)
  }));
};

const drawNetwork = () => {
  context.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.pulse += 0.012;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
      const other = particles[otherIndex];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 132) {
        const alpha = (1 - distance / 132) * 0.18;
        context.strokeStyle = `rgba(31, 168, 154, ${alpha})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }

    const glow = 0.55 + Math.sin(particle.pulse) * 0.25;
    context.fillStyle = `rgba(176, 227, 91, ${glow})`;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  });

  animationFrame = requestAnimationFrame(drawNetwork);
};

if (!reduceMotion && canvas && context) {
  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    drawNetwork();
  });
}
