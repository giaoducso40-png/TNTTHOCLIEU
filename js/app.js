/* =========================================================
   HỌC LIỆU SỐ LV03 — LOGIC TƯƠNG TÁC
   ========================================================= */

"use strict";

const STORAGE_KEY = "lv03-hoclieu-v1";
const LESSON_COUNT = 5;

/* CẤU HÌNH VIDEO: điền URL embed vào src khi có video chính thức.
   Ví dụ: src: "https://www.youtube-nocookie.com/embed/VIDEO_ID?enablejsapi=1"
   Giữ chuỗi rỗng để hiển thị thumbnail placeholder. */
const VIDEO_CONFIG = {
  KB1: { src: "", stopTime: 16, continueTime: 22 },
  KB2: { src: "", stopTime: 16, continueTime: 22 },
  KB3: { src: "", stopTime: 16, continueTime: 22 },
  KB4: { src: "", stopTime: 16, continueTime: 22 },
  KB5: { src: "", stopTime: 16, continueTime: 22 }
};

const defaultState = {
  completed: [],
  lessonSteps: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 },
  theme: "light",
  fontSize: "normal",
  sound: false,
  celebrated: false
};

let state = loadState();
let activeLesson = 0;
let activeStep = 0;
let toastTimer = null;

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  setupLoadingScreen();
  setupImageFallbacks();
  setupRevealAnimations();
  setupSmoothNavigation();
  setupToolbar();
  setupLessons();
  setupCompetencyCards();
  setupWorksheet();
  setupProgressObserver();
  setupCelebration();
  applySavedPreferences();
  restoreProgress();
  mountConfiguredVideos();
  updateProgressUI();
}

/* ---------- Trạng thái và lưu tiến trình ---------- */
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return structuredClone(defaultState);
    return {
      ...structuredClone(defaultState),
      ...saved,
      completed: Array.isArray(saved.completed) ? saved.completed.filter(Number.isInteger) : [],
      lessonSteps: { ...defaultState.lessonSteps, ...(saved.lessonSteps || {}) }
    };
  } catch (_error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    showToast("Không thể lưu tiến trình trên trình duyệt này.");
  }
}

function restoreProgress() {
  document.querySelectorAll(".lesson-card").forEach((lesson) => {
    const lessonNumber = Number(lesson.dataset.lesson);
    const maxStep = state.completed.includes(lessonNumber) ? 4 : Number(state.lessonSteps[String(lessonNumber)] || 1);
    unlockThroughStep(lesson, maxStep, false);
    if (state.completed.includes(lessonNumber)) markLessonComplete(lessonNumber, false);
  });
}

function unlockThroughStep(lesson, maxStep, shouldOpen) {
  lesson.querySelectorAll(".step").forEach((step) => {
    const stepNumber = Number(step.dataset.step);
    if (stepNumber <= maxStep) step.classList.remove("locked");
    else step.classList.add("locked");
    if (shouldOpen && stepNumber === maxStep) step.open = true;
  });
}

/* ---------- Màn hình tải ---------- */
function setupLoadingScreen() {
  const screen = document.getElementById("loading-screen");
  const ring = screen?.querySelector(".loading-ring");
  if (!screen || !ring) return;
  const startedAt = performance.now();
  const duration = 680;

  function animateLoading(now) {
    const progress = Math.min(100, ((now - startedAt) / duration) * 100);
    ring.style.setProperty("--loading", `${progress}%`);
    if (progress < 100) requestAnimationFrame(animateLoading);
  }
  requestAnimationFrame(animateLoading);
  window.setTimeout(() => screen.classList.add("is-hidden"), duration);
  window.setTimeout(() => screen.remove(), duration + 280);
}

/* ---------- Ảnh dự phòng ---------- */
function setupImageFallbacks() {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.classList.add("image-fallback");
      image.style.background = "linear-gradient(135deg, #ffe3cb, #fff3bd)";
      image.style.borderRadius = "18px";
      image.style.minHeight = image.classList.contains("scene-image") ? "220px" : "72px";
    }, { once: true });
  });
}

/* ---------- Hiện dần khi cuộn ---------- */
function setupRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -45px" });
  elements.forEach((element) => observer.observe(element));
}

/* ---------- Điều hướng ---------- */
function setupSmoothNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: motionBehavior(), block: "start" });
      if (target.classList.contains("lesson-card")) {
        activeLesson = Number(target.dataset.lesson);
        activeStep = 1;
        updateProgressUI();
      }
    });
  });
}

function motionBehavior() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/* ---------- Thanh công cụ ---------- */
function setupToolbar() {
  const themeButton = document.getElementById("theme-toggle");
  const soundButton = document.getElementById("sound-toggle");
  const fontDown = document.getElementById("font-down");
  const fontUp = document.getElementById("font-up");
  const shareButton = document.getElementById("share-btn");

  themeButton?.addEventListener("click", () => {
    state.theme = document.body.classList.toggle("dark") ? "dark" : "light";
    updateThemeButton();
    saveState();
  });

  soundButton?.addEventListener("click", () => {
    state.sound = !state.sound;
    updateSoundButton();
    saveState();
    if (state.sound) playDing();
    showToast(state.sound ? "Đã bật âm thanh nhẹ 🔔" : "Đã tắt âm thanh 🔇");
  });

  fontDown?.addEventListener("click", () => setFontSize(state.fontSize === "large" ? "normal" : "small"));
  fontUp?.addEventListener("click", () => setFontSize(state.fontSize === "small" ? "normal" : "large"));

  shareButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép link! 📋");
    } catch (_error) {
      const text = document.createElement("textarea");
      text.value = window.location.href;
      text.style.position = "fixed";
      text.style.opacity = "0";
      document.body.appendChild(text);
      text.select();
      const copied = document.execCommand("copy");
      text.remove();
      showToast(copied ? "Đã sao chép link! 📋" : "Hãy sao chép địa chỉ trên thanh trình duyệt.");
    }
  });
}

function applySavedPreferences() {
  document.body.classList.toggle("dark", state.theme === "dark");
  setFontSize(state.fontSize, false);
  updateThemeButton();
  updateSoundButton();
}

function updateThemeButton() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  const dark = document.body.classList.contains("dark");
  button.textContent = dark ? "☀️" : "🌙";
  button.setAttribute("aria-pressed", String(dark));
  button.setAttribute("aria-label", dark ? "Bật chế độ sáng" : "Bật chế độ tối");
}

function updateSoundButton() {
  const button = document.getElementById("sound-toggle");
  if (!button) return;
  button.textContent = state.sound ? "🔔" : "🔇";
  button.setAttribute("aria-pressed", String(state.sound));
  button.setAttribute("aria-label", state.sound ? "Tắt âm thanh" : "Bật âm thanh");
}

function setFontSize(size, persist = true) {
  const safeSize = ["small", "normal", "large"].includes(size) ? size : "normal";
  document.body.classList.toggle("font-small", safeSize === "small");
  document.body.classList.toggle("font-large", safeSize === "large");
  state.fontSize = safeSize;
  if (persist) {
    saveState();
    showToast(safeSize === "large" ? "Đã tăng cỡ chữ" : safeSize === "small" ? "Đã giảm cỡ chữ" : "Cỡ chữ mặc định");
  }
}

/* ---------- Logic 4 bước của bài học ---------- */
function setupLessons() {
  document.querySelectorAll(".lesson-card").forEach((lesson) => {
    const lessonNumber = Number(lesson.dataset.lesson);

    lesson.querySelectorAll(".step").forEach((step) => {
      step.addEventListener("toggle", () => {
        if (step.open && step.classList.contains("locked")) step.open = false;
        if (step.open) {
          activeLesson = lessonNumber;
          activeStep = Number(step.dataset.step);
          updateProgressUI();
        }
      });
      step.querySelector("summary")?.addEventListener("click", (event) => {
        if (step.classList.contains("locked")) {
          event.preventDefault();
          showToast("Em cần hoàn thành bước trước để mở bước này nhé!");
        }
      });
    });

    const thinkingCheck = lesson.querySelector(".thinking-check");
    const thinkingButton = lesson.querySelector(".confirm-thinking");
    thinkingCheck?.addEventListener("change", () => {
      if (thinkingButton) thinkingButton.disabled = !thinkingCheck.checked;
    });
    thinkingButton?.addEventListener("click", () => {
      const response = lesson.querySelector(".student-response");
      const feedback = thinkingButton.parentElement.querySelector(".inline-feedback");
      if (!thinkingCheck?.checked) return;
      if (response && !response.value.trim()) {
        feedback.textContent = "Em có thể ghi một ý ngắn để lưu lại suy nghĩ của mình.";
        response.focus();
        return;
      }
      feedback.textContent = "Đã ghi nhận suy nghĩ cá nhân. Bây giờ em có thể xem dữ kiện mới.";
      unlockLessonStep(lesson, 3);
      playDing();
    });

    lesson.querySelectorAll(".video-action").forEach((button) => {
      button.addEventListener("click", () => {
        const segment = button.dataset.videoAction;
        const video = button.closest(".step-content")?.querySelector(".video-placeholder");
        handleVideoAction(video, segment);
        if (segment === "start") {
          unlockLessonStep(lesson, 2);
        } else {
          unlockLessonStep(lesson, 4);
        }
      });
    });

    lesson.querySelectorAll(".decision-toggle button").forEach((button) => {
      button.addEventListener("click", () => selectDecision(lesson, button));
    });

    lesson.querySelector(".revision-response")?.addEventListener("input", () => validateCompletion(lesson));
    lesson.querySelector(".complete-lesson")?.addEventListener("click", () => completeLesson(lesson));
  });
}

function unlockLessonStep(lesson, stepNumber) {
  const lessonNumber = Number(lesson.dataset.lesson);
  const step = lesson.querySelector(`.step[data-step="${stepNumber}"]`);
  if (!step) return;
  step.classList.remove("locked");
  step.open = true;
  state.lessonSteps[String(lessonNumber)] = Math.max(Number(state.lessonSteps[String(lessonNumber)] || 1), stepNumber);
  saveState();
  activeLesson = lessonNumber;
  activeStep = stepNumber;
  updateProgressUI();
  window.setTimeout(() => step.scrollIntoView({ behavior: motionBehavior(), block: "center" }), 80);
}

function selectDecision(lesson, selectedButton) {
  lesson.querySelectorAll(".decision-toggle button").forEach((button) => button.classList.toggle("is-selected", button === selectedButton));
  const revisionBox = lesson.querySelector(".revision-box");
  const revise = selectedButton.dataset.decision === "revise";
  if (revisionBox) revisionBox.hidden = !revise;
  lesson.dataset.decision = selectedButton.dataset.decision;
  validateCompletion(lesson);
}

function validateCompletion(lesson) {
  const button = lesson.querySelector(".complete-lesson");
  const revision = lesson.querySelector(".revision-response");
  const hasDecision = Boolean(lesson.dataset.decision);
  const revisionReady = lesson.dataset.decision !== "revise" || Boolean(revision?.value.trim());
  if (button) button.disabled = !(hasDecision && revisionReady);
}

function completeLesson(lesson) {
  const lessonNumber = Number(lesson.dataset.lesson);
  const feedback = lesson.querySelector('[data-step="4"] .inline-feedback');
  if (!lesson.dataset.decision) return;
  if (lesson.dataset.decision === "revise" && !lesson.querySelector(".revision-response")?.value.trim()) return;
  if (!state.completed.includes(lessonNumber)) state.completed.push(lessonNumber);
  state.completed.sort((a, b) => a - b);
  state.lessonSteps[String(lessonNumber)] = 4;
  saveState();
  markLessonComplete(lessonNumber, true);
  if (feedback) feedback.textContent = "Giỏi quá! Em đã hoàn thành bài học này. 🎉";
  playDing();
  updateProgressUI();
  if (state.completed.length === LESSON_COUNT && !state.celebrated) {
    state.celebrated = true;
    saveState();
    window.setTimeout(openCelebration, 450);
  }
}

function markLessonComplete(lessonNumber, announce) {
  const station = document.querySelector(`.station[data-lesson="${lessonNumber}"]`);
  if (station) {
    station.classList.add("is-complete");
    const status = station.querySelector(".station-status");
    if (status) {
      status.textContent = "✓";
      status.setAttribute("aria-label", "Đã hoàn thành");
    }
  }
  const button = document.querySelector(`#lesson-${lessonNumber} .complete-lesson`);
  if (button) {
    button.textContent = "Đã hoàn thành ✓";
    button.disabled = true;
  }
  if (announce) showToast(`Đã hoàn thành bài ${lessonNumber}! ⭐`);
}

/* ---------- Video placeholder và cấu hình nguồn ---------- */
function mountConfiguredVideos() {
  document.querySelectorAll(".video-placeholder").forEach((placeholder) => {
    const id = placeholder.dataset.videoId;
    const config = VIDEO_CONFIG[id];
    if (!config?.src) return;
    const segment = placeholder.dataset.segment;
    const start = segment === "continue" ? config.continueTime : 0;
    const separator = config.src.includes("?") ? "&" : "?";
    const iframe = document.createElement("iframe");
    iframe.src = `${config.src}${separator}start=${start}&enablejsapi=1`;
    iframe.title = `Video tình huống ${id} — ${segment === "continue" ? "dữ kiện bổ sung" : "phần quan sát"}`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    placeholder.replaceChildren(iframe);
    placeholder.classList.add("has-video");
  });
}

function handleVideoAction(videoContainer, segment) {
  if (!videoContainer) return;
  const iframe = videoContainer.querySelector("iframe");
  const id = videoContainer.dataset.videoId;
  const config = VIDEO_CONFIG[id];
  if (!iframe || !config?.src) {
    showToast(segment === "start" ? "Vị trí video đã sẵn sàng để cập nhật. Em chuyển sang điểm dừng nhé!" : "Vị trí dữ kiện bổ sung đã sẵn sàng để cập nhật.");
    return;
  }
  const seekTo = segment === "continue" ? config.continueTime : 0;
  postVideoCommand(iframe, "seekTo", [seekTo, true]);
  postVideoCommand(iframe, "playVideo", []);
  if (segment === "start") {
    window.setTimeout(() => postVideoCommand(iframe, "pauseVideo", []), config.stopTime * 1000);
  }
}

function postVideoCommand(iframe, func, args) {
  iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
}

/* ---------- Theo dõi bài và bước hiện tại ---------- */
function setupProgressObserver() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    activeLesson = Number(visible.target.dataset.lesson);
    const openStep = visible.target.querySelector(".step[open]");
    activeStep = Number(openStep?.dataset.step || state.lessonSteps[String(activeLesson)] || 1);
    updateProgressUI();
  }, { threshold: [0.15, 0.35, 0.55] });
  document.querySelectorAll(".lesson-card").forEach((lesson) => observer.observe(lesson));
}

function updateProgressUI() {
  const label = document.getElementById("tracker-label");
  const fill = document.getElementById("tracker-fill");
  const completed = state.completed.length;
  let percent = (completed / LESSON_COUNT) * 100;
  if (activeLesson) percent = Math.max(percent, (((activeLesson - 1) * 4 + Math.max(activeStep, 1)) / (LESSON_COUNT * 4)) * 100);
  if (fill) fill.style.width = `${Math.min(100, percent)}%`;
  if (label) label.textContent = activeLesson ? `Bài ${activeLesson}/5 — Bước ${Math.max(activeStep, 1)}/4 • Đã xong ${completed}/5` : completed ? `Đã hoàn thành ${completed}/5 bài` : "Hành trình chưa bắt đầu";
  document.querySelectorAll(".station").forEach((station) => station.classList.toggle("is-current", Number(station.dataset.lesson) === activeLesson));
}

/* ---------- Thẻ năng lực lật 3D ---------- */
function setupCompetencyCards() {
  document.querySelectorAll(".competency-card").forEach((card) => {
    card.addEventListener("click", () => {
      const flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-expanded", String(flipped));
    });
  });
}

/* ---------- Phiếu học tập ---------- */
function setupWorksheet() {
  const form = document.getElementById("worksheet-form");
  document.getElementById("print-worksheet")?.addEventListener("click", () => window.print());
  document.getElementById("clear-worksheet")?.addEventListener("click", () => {
    if (!form) return;
    const hasContent = Array.from(form.querySelectorAll("input, textarea")).some((field) => field.value.trim());
    if (hasContent && !window.confirm("Xóa toàn bộ nội dung đã nhập trong phiếu?")) return;
    form.reset();
    showToast("Đã xóa trắng phiếu học tập.");
  });
  document.getElementById("reset-progress")?.addEventListener("click", resetAllProgress);
}

function resetAllProgress() {
  if (!window.confirm("Đặt lại toàn bộ tiến trình 5 bài học? Nội dung đang nhập trên trang sẽ không được lưu.")) return;
  const preferences = { theme: state.theme, fontSize: state.fontSize, sound: state.sound };
  state = { ...structuredClone(defaultState), ...preferences };
  saveState();
  window.location.reload();
}

/* ---------- Ăn mừng ---------- */
function setupCelebration() {
  const modal = document.getElementById("celebration");
  modal?.querySelector(".celebration-close")?.addEventListener("click", closeCelebration);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeCelebration();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) closeCelebration();
  });
}

function openCelebration() {
  const modal = document.getElementById("celebration");
  const layer = document.getElementById("confetti-layer");
  if (!modal || !layer) return;
  layer.replaceChildren();
  const colors = ["#FF6B35", "#FFC233", "#4ECB71", "#9B5DE5", "#F15BB5"];
  for (let index = 0; index < 32; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * .7}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * .8}s`;
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    layer.appendChild(piece);
  }
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector(".celebration-close")?.focus();
}

function closeCelebration() {
  const modal = document.getElementById("celebration");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

/* ---------- Âm thanh nhẹ bằng Web Audio, mặc định tắt ---------- */
function playDing() {
  if (!state.sound) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + .15);
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.08, context.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .36);
    oscillator.addEventListener("ended", () => context.close());
  } catch (_error) {
    state.sound = false;
    updateSoundButton();
  }
}

/* ---------- Toast ---------- */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}
