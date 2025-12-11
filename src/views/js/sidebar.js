fetch("/components/sidebar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("sidebar-container").innerHTML = html;

    const menuLinks = document.querySelectorAll(".menu a");
    const sections = document.querySelectorAll(".section");

    menuLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        menuLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        sections.forEach(section => section.classList.add("hidden"));

        const id = link.textContent.trim().toLowerCase();
        const target = document.getElementById(id);
        if (target) target.classList.remove("hidden");
      });
    });
  })
  .catch(err => console.error("Error al cargar el sidebar:", err));
