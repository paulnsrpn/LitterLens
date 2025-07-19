
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content") || document.body; // fallback if no #main-content

    setTimeout(() => {
      loader.classList.add("hide");

      setTimeout(() => {
        loader.style.display = "none";
        mainContent.style.display = "block";

        // ✅ Scroll to #home-page after loader finishes
        const homePage = document.getElementById("home-page");
        if (homePage) {
          homePage.scrollIntoView({ behavior: "smooth" });
        }

        // ✅ Set "Home" nav link as active
        const navLinks = document.querySelectorAll("nav a");
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#home-page") {
            link.classList.add("active");
          }
        });

        // ✅ Ensure URL hash is #home-page
        if (!location.hash || location.hash === "#") {
          history.replaceState(null, null, "#home-page");
        }

      }, 1000); // after fade
    }, 3000); // loading duration
  });
