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

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // === Decorative Page Border ===
    doc.setDrawColor(160, 160, 160);  // light gray border
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);  // margin-based border

    // === Header ===
    doc.setFillColor(34, 49, 63); // dark header
    doc.rect(10, 10, pageWidth - 20, 15, 'F');

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("LitterLens Detection Report", pageWidth / 2, 20, { align: "center" });

    // Reset font and color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 30;

    // === Info Section ===
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, y);
    y += 8;
    doc.text(`Location: Pasig River (Kalawaan Bridge)`, 20, y);
    y += 8;
    doc.text(`Average Confidence: ${result.accuracy || "N/A"}%`, 20, y);

    // === Classification Table Header ===
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Classification Summary", 20, y);
    y += 8;

    const startX = 20;
    const colWidths = [100, 30];

    // Table Headers
    doc.setDrawColor(0);
    doc.setFillColor(220, 220, 220);
    doc.rect(startX, y, colWidths[0], 10, "F");
    doc.rect(startX + colWidths[0], y, colWidths[1], 10, "F");

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("Litter Type", startX + 2, y + 7);
    doc.text("Count", startX + colWidths[0] + 2, y + 7);

    y += 10;

    // Table Rows
    doc.setFont("helvetica", "normal");
    for (const [label, count] of Object.entries(result.summary)) {
        doc.rect(startX, y, colWidths[0], 10);
        doc.rect(startX + colWidths[0], y, colWidths[1], 10);
        doc.text(label, startX + 2, y + 7);
        doc.text(String(count), startX + colWidths[0] + 2, y + 7);
        y += 10;
    }

    // === Result Image ===
    try {
        const toDataURL = url =>
            fetch(url)
                .then(response => response.blob())
                .then(blob => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(blob);
                }));

        const resultImageData = await toDataURL(`http://localhost:5000/uploads/${result.result_image}`);

        const imageY = y + 10;
        const imageHeight = 75;
        const imageWidth = 170;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Analyzed Image:", 20, imageY - 5);
        doc.addImage(resultImageData, "JPEG", 20, imageY, imageWidth, imageHeight);
    } catch (err) {
        console.error("Failed to load image for PDF:", err);
        alert("Unable to include images in the PDF. Please check your server or image paths.");
    }

    // === Footer ===
    const footerY = pageHeight - 25;
    doc.setFontSize(10);
    doc.setTextColor(100);

    doc.setFont("helvetica", "normal");
    doc.text("Pasig River Coordinating and Management Office - PRCMO", 20, footerY);

    doc.setFont("helvetica", "italic");
    doc.text("records.ncr@denr.gov.ph", 20, footerY + 5);

    doc.setFont("helvetica", "normal");
    doc.text("© LitterLens 2025. All rights reserved.", 20, footerY + 10);

    doc.save("litterlens_report.pdf");
});


