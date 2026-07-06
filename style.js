(function(){
  "use strict";

  /* ============================================================
     Utility
  ============================================================ */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ============================================================
     Sticky header + scroll progress + back-to-top
  ============================================================ */
  const header = $("#siteHeader");
  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");

  function onScroll(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    progress.style.width = pct + "%";

    header.classList.toggle("scrolled", scrollTop > 12);
    backToTop.classList.toggle("visible", scrollTop > 480);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ============================================================
     Mobile nav toggle
  ============================================================ */
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-link").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

  /* ============================================================
     Fade-up reveal on scroll
  ============================================================ */
  const revealTargets = $$(".fade-up");
  if ("IntersectionObserver" in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("in-view"));
  }

  /* ============================================================
     Hero "server building" animation (signature element)
  ============================================================ */
  const serverStructure = [
    { type: "category", label: "WELCOME" },
    { type: "channel", label: "rules", active:false },
    { type: "channel", label: "welcome", active:false },
    { type: "category", label: "COMMUNITY" },
    { type: "channel", label: "general", active:true },
    { type: "channel", label: "introductions", active:false },
    { type: "category", label: "STAFF" },
    { type: "channel", label: "mod-logs", active:false },
    { type: "channel", label: "tickets", active:false },
  ];

  const mockBody = $("#serverMockBody");
  if (mockBody){
    serverStructure.forEach(item => {
      const el = document.createElement("div");
      if (item.type === "category"){
        el.className = "mock-category";
        el.textContent = item.label;
      } else {
        el.className = "mock-channel" + (item.active ? " active" : "");
        el.innerHTML = `<span class="hash">#</span>${item.label}` + (item.active ? '<span class="status"></span>' : "");
      }
      mockBody.appendChild(el);
    });

    const revealItems = $$(".mock-category, .mock-channel", mockBody);
    let started = false;
    const startBuild = () => {
      if (started) return;
      started = true;
      revealItems.forEach((el, i) => {
        setTimeout(() => el.classList.add("shown"), i * 140);
      });
    };
    if ("IntersectionObserver" in window){
      const heroIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting){ startBuild(); heroIo.disconnect(); } });
      }, { threshold: 0.3 });
      heroIo.observe(mockBody);
    } else {
      startBuild();
    }
  }

  // About card progress fill
  const aboutBar = $(".about-card-progress-bar");
  if (aboutBar && "IntersectionObserver" in window){
    const barIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting){ aboutBar.classList.add("filled"); barIo.disconnect(); } });
    }, { threshold: 0.4 });
    barIo.observe(aboutBar);
  }

  /* ============================================================
     Order Now buttons on pricing cards -> scroll to contact + prefill intent
  ============================================================ */
  $$(".order-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tier = btn.getAttribute("data-tier");
      sessionStorage.setItem("hexa_selected_tier", tier || "");
    });
  });

  /* ============================================================
     FAQ Accordion
  ============================================================ */
  $$(".accordion-item").forEach(item => {
    const trigger = $(".accordion-trigger", item);
    if (!trigger) return;
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      $$(".accordion-item").forEach(other => {
        if (other !== item){
          other.classList.remove("open");
          const t = $(".accordion-trigger", other);
          if (t) t.setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ============================================================
     REVIEW SYSTEM — localStorage backed
  ============================================================ */
  const REVIEWS_KEY = "hexa_reviews_v1";
  const CLIENT_KEY = "hexa_client_id_v1";
  const PAGE_SIZE = 3;

  const PROFANITY = ["fuck","shit","bitch","asshole","cunt","nigger","faggot","slut","whore","retard"];

  function getClientId(){
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id){
      id = "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  }
  const clientId = getClientId();

  const seedReviews = [
    { id: "seed1", name: "Maren K.", title: "Exactly the structure we needed", rating: 5, text: "Our community server was a mess before this. Now every channel makes sense and staff finally have a real permission system.", date: "2026-05-02T10:00:00Z", isSeed: true },
    { id: "seed2", name: "DJ Okafor", title: "Fast, clean, professional", rating: 5, text: "Delivered ahead of schedule with a ticket system and verification that just works. Would order again for the next server.", date: "2026-05-18T10:00:00Z", isSeed: true },
    { id: "seed3", name: "Priya S.", title: "Redesign exceeded expectations", rating: 4, text: "Took our cluttered gaming server and turned it into something that actually looks like a product. A couple small tweaks needed after, but handled quickly.", date: "2026-06-01T10:00:00Z", isSeed: true },
  ];

  function loadUserReviews(){
    try {
      const raw = localStorage.getItem(REVIEWS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
  }
  function saveUserReviews(list){
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
  }

  let visibleCount = PAGE_SIZE;
  let currentSort = "newest";
  let currentSearch = "";

  function containsProfanity(text){
    const lower = text.toLowerCase();
    return PROFANITY.some(word => lower.includes(word));
  }
  function censor(text){
    let out = text;
    PROFANITY.forEach(word => {
      const re = new RegExp(word, "gi");
      out = out.replace(re, "*".repeat(word.length));
    });
    return out;
  }

  function getAllReviews(){
    return [...seedReviews, ...loadUserReviews()];
  }

  function initials(name){
    return name.trim().split(/\s+/).slice(0,2).map(n => n[0] ? n[0].toUpperCase() : "").join("");
  }

  function formatDate(iso){
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function renderStars(rating){
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function updateSummary(){
    const all = getAllReviews();
    const total = all.length;
    const avg = total ? (all.reduce((s,r) => s + r.rating, 0) / total) : 0;
    $("#avgRatingNum").textContent = total ? avg.toFixed(1) : "—";
    $("#avgRatingStars").textContent = total ? renderStars(Math.round(avg)) : "";
    $("#totalReviewsLabel").textContent = total + (total === 1 ? " review" : " reviews");
    const statRating = $("#statRating");
    if (statRating && total) statRating.textContent = avg.toFixed(1) + "/5";
  }

  function getFilteredSorted(){
    let list = getAllReviews();

    if (currentSearch.trim()){
      const q = currentSearch.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q)
      );
    }

    list = [...list];
    if (currentSort === "newest"){
      list.sort((a,b) => new Date(b.date) - new Date(a.date));
    } else if (currentSort === "highest"){
      list.sort((a,b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));
    } else if (currentSort === "lowest"){
      list.sort((a,b) => a.rating - b.rating || new Date(b.date) - new Date(a.date));
    }
    return list;
  }

  function renderReviews(){
    const grid = $("#reviewGrid");
    const list = getFilteredSorted();
    const slice = list.slice(0, visibleCount);

    grid.innerHTML = "";

    if (!slice.length){
      grid.innerHTML = `<div class="reviews-empty">No reviews match your search yet.</div>`;
    }

    slice.forEach(r => {
      const card = document.createElement("article");
      card.className = "review-card";
      const isOwner = r.authorId === clientId && !r.isSeed;
      card.innerHTML = `
        <div class="review-top">
          <div class="review-avatar">${initials(r.name)}</div>
          <div>
            <div class="review-name">${escapeHtml(r.name)}</div>
            <div class="review-date">${formatDate(r.date)}${r.isSeed ? ' · <span class="review-badge-seed">featured</span>' : ""}</div>
          </div>
        </div>
        <div class="review-stars" aria-label="${r.rating} out of 5 stars">${renderStars(r.rating)}</div>
        <h4 class="review-title">${escapeHtml(r.title)}</h4>
        <p class="review-text">${escapeHtml(r.text)}</p>
        ${isOwner ? `
        <div class="review-actions">
          <button type="button" data-action="edit" data-id="${r.id}">Edit</button>
          <button type="button" data-action="delete" data-id="${r.id}">Delete</button>
        </div>` : ""}
      `;
      grid.appendChild(card);
    });

    const loadMoreBtn = $("#loadMoreBtn");
    loadMoreBtn.classList.toggle("hidden", visibleCount >= list.length);

    updateSummary();
  }

  function escapeHtml(str){
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  $("#loadMoreBtn").addEventListener("click", () => {
    visibleCount += PAGE_SIZE;
    renderReviews();
  });

  $("#reviewSearch").addEventListener("input", (e) => {
    currentSearch = e.target.value;
    visibleCount = PAGE_SIZE;
    renderReviews();
  });

  $("#reviewSort").addEventListener("change", (e) => {
    currentSort = e.target.value;
    visibleCount = PAGE_SIZE;
    renderReviews();
  });

  $("#reviewGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    const userReviews = loadUserReviews();
    const review = userReviews.find(r => r.id === id);
    if (!review) return;

    if (action === "delete"){
      if (confirm("Delete this review?")){
        saveUserReviews(userReviews.filter(r => r.id !== id));
        renderReviews();
      }
    } else if (action === "edit"){
      openReviewModal(review);
    }
  });

  /* ---- Modal / Form ---- */
  const modalBackdrop = $("#reviewModalBackdrop");
  const reviewForm = $("#reviewForm");
  const starPicker = $("#starPicker");
  const ratingInput = $("#reviewRating");
  const formError = $("#reviewFormError");

  function openReviewModal(existing){
    formError.textContent = "";
    if (existing){
      $("#editingId").value = existing.id;
      $("#reviewName").value = existing.name;
      $("#reviewTitle").value = existing.title;
      $("#reviewText").value = existing.text;
      setStars(existing.rating);
      $("#reviewModalTitle").textContent = "Edit your review";
      $("#reviewSubmitBtn").textContent = "Save changes";
    } else {
      $("#editingId").value = "";
      reviewForm.reset();
      setStars(0);
      $("#reviewModalTitle").textContent = "Leave a review";
      $("#reviewSubmitBtn").textContent = "Post review";
    }
    modalBackdrop.classList.add("open");
    $("#reviewName").focus();
  }
  function closeReviewModal(){
    modalBackdrop.classList.remove("open");
  }

  function setStars(value){
    ratingInput.value = value;
    $$(".star-btn", starPicker).forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.value) <= value);
    });
  }

  starPicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".star-btn");
    if (!btn) return;
    setStars(Number(btn.dataset.value));
  });

  $("#openReviewFormBtn").addEventListener("click", () => openReviewModal(null));
  $("#closeReviewModal").addEventListener("click", closeReviewModal);
  modalBackdrop.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeReviewModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modalBackdrop.classList.contains("open")) closeReviewModal(); });

  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formError.textContent = "";

    const editingId = $("#editingId").value;
    const name = $("#reviewName").value.trim();
    const title = $("#reviewTitle").value.trim();
    const text = $("#reviewText").value.trim();
    const rating = Number(ratingInput.value);

    if (!name || !title || !text){
      formError.textContent = "Please fill in every field.";
      return;
    }
    if (rating < 1 || rating > 5){
      formError.textContent = "Please choose a star rating.";
      return;
    }

    const userReviews = loadUserReviews();

    if (editingId){
      const idx = userReviews.findIndex(r => r.id === editingId);
      if (idx === -1){ formError.textContent = "This review no longer exists."; return; }
      if (containsProfanity(name) || containsProfanity(title) || containsProfanity(text)){
        userReviews[idx] = { ...userReviews[idx], name: censor(name), title: censor(title), text: censor(text), rating, date: new Date().toISOString() };
      } else {
        userReviews[idx] = { ...userReviews[idx], name, title, text, rating, date: new Date().toISOString() };
      }
      saveUserReviews(userReviews);
      closeReviewModal();
      visibleCount = Math.max(visibleCount, PAGE_SIZE);
      renderReviews();
      return;
    }

    // Duplicate prevention: same client already has a review with same title+text, OR identical name+title combo exists
    const isDuplicate = getAllReviews().some(r =>
      r.name.trim().toLowerCase() === name.toLowerCase() &&
      r.title.trim().toLowerCase() === title.toLowerCase()
    );
    if (isDuplicate){
      formError.textContent = "A review with this name and title already exists.";
      return;
    }

    const hasProfanity = containsProfanity(name) || containsProfanity(title) || containsProfanity(text);

    const newReview = {
      id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      authorId: clientId,
      name: hasProfanity ? censor(name) : name,
      title: hasProfanity ? censor(title) : title,
      text: hasProfanity ? censor(text) : text,
      rating,
      date: new Date().toISOString(),
      isSeed: false
    };

    userReviews.push(newReview);
    saveUserReviews(userReviews);
    closeReviewModal();
    currentSort = "newest";
    $("#reviewSort").value = "newest";
    visibleCount = PAGE_SIZE;
    renderReviews();
  });

  // Initial render
  renderReviews();

})();
    
