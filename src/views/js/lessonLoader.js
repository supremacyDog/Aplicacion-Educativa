/* global refreshSidebar */
import { courseData } from "./courseData.js";

/* -------------------------------------------------------
   Buscar lección por ID
-------------------------------------------------------- */
function findLesson(id) {
  for (let module of courseData) {
    const lesson = module.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return null;
}

/* -------------------------------------------------------
   Cargar lección
-------------------------------------------------------- */
export function loadLesson(lessonId) {
  const container = document.getElementById("lesson-content");
  const lesson = findLesson(lessonId);

  if (!lesson) {
    container.innerHTML = "<p>Error: Lección no encontrada.</p>";
    return;
  }

  // Ocultar TODAS las lecciones
  document.querySelectorAll(".lesson-block").forEach((block) => {
    block.style.display = "none";
  });

  // Mostrar la lección correcta
  const target = document.getElementById(`lesson-${lessonId}`);
  if (target) {
    target.style.display = "block";
  } else {
    container.innerHTML = "<p>Contenido no disponible.</p>";
  }
}

/* -------------------------------------------------------
   EVALUACIÓN: Checkpoint 1
-------------------------------------------------------- */
window.gradeCheckpoint1 = function () {
  const q1 = document.querySelector("input[name='cq1']:checked")?.value;
  const q2 = document.querySelector("input[name='cq2']:checked")?.value;
  const q3 = document.getElementById("cq3").value.trim();

  if (!q1 || !q2 || q3 === "") {
    alert("Completa todas las respuestas.");
    return;
  }

  let score = 0;
  if (q1 === "b") score++;
  if (q2 === "v") score++;
  if (q3.includes("=")) score++;

  if (score < 2) {
    alert("Necesitas repasar antes de avanzar.");
    return;
  }

  localStorage.setItem("quiz1_completed", "true");

  unlockNextLesson("quiz1");
  refreshSidebar();

  alert("¡Checkpoint aprobado!");
};

/* EVALUACIÓN: Examen Final */
window.gradeFinalExam = function () {
  const q1 = document.querySelector("input[name='fe1']:checked")?.value;
  const q2 = document.querySelector("input[name='fe2']:checked")?.value;
  const q3 = document.querySelector("input[name='fe3']:checked")?.value;
  const q4 = document.querySelector("input[name='fe4']:checked")?.value;
  const q5 = document.querySelector("input[name='fe5']:checked")?.value;

  if (!q1 || !q2 || !q3 || !4 || !q5 ) {
    alert("Completa todas las respuestas.");
    return;
  }

  let score = 0;
  if (q1 === "b") score++;
  if (q2 === "b") score++;
  if (q3 === "v") score++;
  if (q4 === "a") score++;
  if (q5 === "a") score++;

  if (score < 4) {
    alert("Puntaje insuficiente. Intenta nuevamente.");
    return;
  }

  localStorage.setItem("final-exam_completed", "true");

  refreshSidebar();
  alert("¡Módulo completado exitosamente!");
};

/* Desbloquear la siguiente lección */
function unlockNextLesson(currentId) {
  const lessons = courseData[0].lessons;
  const index = lessons.findIndex((l) => l.id === currentId);
  const next = lessons[index + 1];

  if (!next) return;

  localStorage.setItem(`${next.id}_unlocked`, "true");

  refreshSidebar();

  const nextLink = document.querySelector(`.lesson-link[data-id="${next.id}"]`);
  nextLink?.classList.add("active");

  loadLesson(next.id);
}

function completeLesson(id) {
  localStorage.setItem(`${id}_completed`, "true");
  unlockNextLesson(id);
  refreshSidebar();
}

window.completeLesson = completeLesson;

window.loadLesson = loadLesson;
window.unlockNextLesson = unlockNextLesson;
