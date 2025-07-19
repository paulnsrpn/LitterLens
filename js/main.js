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


//   Guide Step Scroll Script 
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.querySelector(".stepsCard");
    const sections = card.querySelectorAll(".step");
    const navLinks = document.querySelectorAll(".navParts a");

    // Scroll listener to update active nav link
    card.addEventListener("scroll", () => {
      const scrollTop = card.scrollTop;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollTop >= top - height / 3 && scrollTop < top + height - height / 3) {
          const id = section.getAttribute("id");

          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    });

    // Click listener to center the section inside stepsCard
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1); // remove #
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const cardHeight = card.clientHeight;
          const sectionTop = targetSection.offsetTop;
          const sectionHeight = targetSection.offsetHeight;

          // Scroll so that section is centered
          const scrollTo = sectionTop - (cardHeight / 2) + (sectionHeight / 2);
          card.scrollTo({
            top: scrollTo,
            behavior: "smooth"
          });
        }
      });
    });
  });

    AOS.init({
        duration: 800,
        offset: 120,
        easing: 'ease-in-out',
        once: false,
        mirror: true
    });
    

  // DRAG AND DROP UPLOAD IMAGE
      const photoContainer = document.querySelector('.photo-container');
      const uploadPage = document.getElementById('upload-page');
      const fileInput = document.getElementById('file-upload');
      const previewImage = document.getElementById('preview-image');
      const previewBox = document.getElementById('preview-box');
      const fileName = document.getElementById('file-name');    


      function handleFile(file) {
          if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
          reader.onload = () => {
          const base64Data = reader.result;
          previewImage.src = base64Data;                 // ✅ assign to correct img
          fileName.textContent = file.name;              // show file name
          previewBox.style.display = 'flex';             // show container
          photoContainer.classList.add('image-loaded');  // for hiding drop-zone

          // Store image if needed elsewhere
          uploadPage.dataset.imageBase64 = base64Data;
      };

      reader.readAsDataURL(file);
      }
      // Highlight when dragging
      ['dragenter', 'dragover'].forEach(eventType => {
          uploadPage.addEventListener(eventType, e => {
          e.preventDefault();
          photoContainer.classList.add('dragging-highlight');
      });
    });

      ['dragleave', 'drop'].forEach(eventType => {
          uploadPage.addEventListener(eventType, e => {
          e.preventDefault();
          photoContainer.classList.remove('dragging-highlight');
          });
      });

    // Handle drop
      uploadPage.addEventListener('drop', e => {
          const files = e.dataTransfer.files;
          if (files.length > 0) {
          handleFile(files[0]);
          }
      });

      // Handle file select
      fileInput.addEventListener('change', () => {
          if (fileInput.files.length > 0) {
          handleFile(fileInput.files[0]);
          }
      });

      document.addEventListener("DOMContentLoaded", () => {
      const analyzeBtn = document.querySelector(".upload-photo-btn");

      analyzeBtn.addEventListener("click", () => {
        // Redirect to result.html
        window.location.href = "result.html";
      });
    });