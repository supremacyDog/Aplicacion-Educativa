async function loadNavbar() {
  try {
    const response = await fetch("/components/navbar.html");
    const navbarHTML = await response.text();

    const navbarPlaceholder = document.getElementById("navbar-placeholder");
    if (navbarPlaceholder) {
      navbarPlaceholder.innerHTML = navbarHTML;
    }

    const userDataString = localStorage.getItem("user");

    if (userDataString) {
      const user = JSON.parse(userDataString);

      const profileImg = document.getElementById("navbarUserImg");
      if (profileImg) {
        profileImg.src = user.foto || "https://via.placeholder.com/40";
      }

      const profileName = document.getElementById("navbarUserName");
      if (profileName) {
        profileName.textContent = `${user.nombre} ${user.apellido}`;
      }

      const nameLeft = document.getElementById("navbarUserNameLeft");
      if (nameLeft) {
        nameLeft.textContent = user.nombre;
      }
    }

    const profileIcon = document.getElementById("userProfile");
    const profileMenu = document.getElementById("profileMenu");

    if (profileIcon && profileMenu) {
      profileIcon.addEventListener("click", () => {
        profileMenu.classList.toggle("show");
      });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/";
      });
    }

  } catch (error) {
    console.error("Error al cargar el navbar:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);