// Resets analysis data and redirects to upload section
function resetAnalysis() {
    localStorage.removeItem("analyze_result");
    window.location.href = "homePage.html#upload-page";
}

document.addEventListener("DOMContentLoaded", () => {
    const result = JSON.parse(localStorage.getItem("analyze_result"));

    if (!result) {
        alert("No result found. Please analyze an image first.");
        window.location.href = "homePage.html";
        return;
    }

    // 1. Display result image
    const resultImg = document.querySelector(".detected-image");
    resultImg.src = `http://localhost:5000/uploads/${result.result_image}`;
    resultImg.alt = "Detected result";

    // 2. Remove default placeholder item
    const placeholder = document.querySelector(".results-item");
    if (placeholder) placeholder.remove();

    // 3. Populate classification summary
    const receipt = document.querySelector(".results-receipt");
    let totalCount = 0;

    for (const [label, count] of Object.entries(result.summary)) {
        const item = document.createElement("div");
        item.classList.add("results-item");

        const name = document.createElement("p");
        name.className = "item-name";
        name.textContent = label;

        const countEl = document.createElement("p");
        countEl.className = "item-count";
        countEl.textContent = count;

        item.appendChild(name);
        item.appendChild(countEl);

        receipt.insertBefore(item, document.querySelector(".other-infos"));
        totalCount += count;
    }

    // 4. Update total item count
    document.getElementById("item-count").textContent = totalCount;

    // 5. Display detection accuracy
    if (result.accuracy !== undefined) {
        const accuracyEl = document.getElementById("accuracy-value");
        if (accuracyEl) {
            accuracyEl.textContent = `${result.accuracy}%`;
        }
    }
});

// 6. PDF generation on button click
document.querySelector('.download-btn').addEventListener('click', async () => {
    const result = JSON.parse(localStorage.getItem("analyze_result"));

    if (!result) {
        alert("No data to export.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(18);
    doc.text("LitterLens Detection Report", 20, 20);

    // Accuracy
    doc.setFontSize(12);
    doc.text(`Detection Accuracy: ${result.accuracy || "N/A"}%`, 20, 30);

    // Classification Summary
    doc.setFontSize(14);
    doc.text("Classification Summary:", 20, 45);
    let y = 55;
    for (const [label, count] of Object.entries(result.summary)) {
        doc.text(`${label}: ${count}`, 25, y);
        y += 10;
    }

    // Location
    doc.text("Location: Pasig River (Kalawaan Bridge)", 20, y + 10);

    // Convert result image to Base64
    const toDataURL = url =>
        fetch(url)
            .then(response => response.blob())
            .then(blob => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(blob);
            }));

    try {
        const resultImageData = await toDataURL(`http://localhost:5000/uploads/${result.result_image}`);

        doc.addPage();
        doc.setFontSize(14);
        doc.text("Analyzed Image:", 20, 20);
        doc.addImage(resultImageData, "JPEG", 20, 30, 160, 100);

        doc.save("litterlens_report.pdf");
    } catch (err) {
        console.error("Failed to load image for PDF:", err);
        alert("Unable to include images in the PDF. Please check your server or image paths.");
    }
});
