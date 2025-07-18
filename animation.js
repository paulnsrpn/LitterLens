
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");

    setTimeout(() => {
      loader.classList.add("hide");

      setTimeout(() => {
        loader.style.display = "none";
        mainContent.style.display = "block";
      }, 1000); // matches the fade transition
    }, 3000); // Adjust loading time (ms)
  });

