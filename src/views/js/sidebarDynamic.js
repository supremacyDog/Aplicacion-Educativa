/* global refreshSidebar, loadLesson */
import { courseData } from "./courseData.js";
import { loadLesson } from "./lessonLoader.js";

document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebar-container");

  let html = `
    <aside class="sidebar">
      <ul class="menu">
  `;

  courseData.forEach((module) => {
    html += `
      <li class="module-title">${module.title}</li>
    `;

    module.lessons.forEach((lesson, index) => {
      const completed =
        localStorage.getItem(`${lesson.id}_completed`) === "true";
      const unlocked =
        completed ||
        lesson.unlocked ||
        localStorage.getItem(`${lesson.id}_unlocked`) === "true";

        let icon = "<i class=\"fa-solid fa-lock\"></i>"; //bloqueado

        if (unlocked) icon = "<i class=\"fa-solid fa-lock-open\"></i>"; 
        if (completed) icon = "<i class=\"fa-solid fa-circle-check\"></i>"; 
        if (lesson.id === "overview") icon = "";

      html += `
        <li>
          <a href="#" 
            class="lesson-link ${unlocked ? "unlocked" : "locked"}" 
            data-id="${lesson.id}" 
            data-index="${index}">
            ${icon} <span class="lesson-title">${lesson.title}</span>
          </a>
        </li>
      `;
    });
  });

  html += `
      </ul>
    </aside>
  `;

  sidebarContainer.innerHTML = html;

  //Navegar
  document.querySelectorAll(".lesson-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const id = link.dataset.id;
      const isLocked = link.classList.contains("locked");

      if (isLocked) {
        alert("Esta lección está bloqueada. Completa la anterior primero.");
        return;
      }

      document
        .querySelectorAll(".lesson-link")
        .forEach((l) => l.classList.remove("active"));

      link.classList.add("active");

      loadLesson(id);
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const overviewLink = document.querySelector(
    ".lesson-link[data-id=\"overview\"]"
  );
  if (overviewLink) {
    overviewLink.classList.add("active");
    loadLesson("overview");
  }
});

window.refreshSidebar = function () {
  const sidebarContainer = document.getElementById("sidebar-container");

  let html = `
        <aside class="sidebar">
            <ul class="menu">
    `;

  courseData.forEach((module) => {
    html += `<li class="module-title">${module.title}</li>`;

    module.lessons.forEach((lesson, index) => {
      const completed =
        localStorage.getItem(`${lesson.id}_completed`) === "true";
      const unlocked =
        completed ||
        lesson.unlocked ||
        localStorage.getItem(`${lesson.id}_unlocked`) === "true";

      let icon = "<i class=\"fa-solid fa-lock\"></i>";
      if (unlocked) icon = "<i class=\"fa-solid fa-lock-open\"></i>";
      if (completed) icon = "<i class=\"fa-solid fa-circle-check\"></i>";
      if (lesson.id === "overview") icon = "";

      html += `
                <li>
                    <a href="#" 
                        class="lesson-link ${unlocked ? "unlocked" : "locked"}"
                        data-id="${lesson.id}"
                        data-index="${index}">
                        ${icon} <span class="lesson-title">${lesson.title}</span>
                    </a>
                </li>
            `;
    });
  });

  html += `
            </ul>
        </aside>
    `;

  sidebarContainer.innerHTML = html;

  document.querySelectorAll(".lesson-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const id = link.dataset.id;
      const isLocked = link.classList.contains("locked");

      if (isLocked) {
        alert("Esta lección está bloqueada. Completa la anterior primero.");
        return;
      }

      document
        .querySelectorAll(".lesson-link")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      loadLesson(id);
    });
  });
};
