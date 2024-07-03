const categoryPrices = [1, 2, 5, 10, 20, 30, 50];
let categoryCount = 0;

document.addEventListener('DOMContentLoaded', (event) => {
    loadFormData();
    if (!localStorage.getItem('lotteryClosingFormData')) {
        initializeCategories();
    }
});

function initializeCategories() {
    for (let i = 0; i < categoryPrices.length; i++) {
        addCategory();
    }
}

function addCategory() {
    const container = document.getElementById('lotteryCategories');
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');
    categoryDiv.id = `category-${categoryCount}`;
    
    let categoryContent = `<h3>${categoryPrices[categoryCount % categoryPrices.length]}$ Category</h3>`;
    for (let i = 0; i < 12; i++) {
        categoryContent += `<div class="ticketField"><input type="number" step="0.01" class="ticketCount" id="ticket-${categoryCount}-${i}" oninput="updateCategoryTotal(${categoryCount})" placeholder="Tickets left"><button type="button" class="delete-button" onclick="deleteTicketField(${categoryCount}, ${i})">x</button></div>`;
    }
    categoryContent += `<button type="button" class="material-ui-button" onclick="addTicketField(${categoryCount})"><span class="material-ui-icon">+</span>Add Ticket Field</button>`;
    categoryContent += `<div class="category-total">Total for ${categoryPrices[categoryCount % categoryPrices.length]}$ Category: $<span id="category-total-${categoryCount}">0.00</span></div>`;
    categoryContent += `<div class="category-tickets-left">Total No. of Tickets Left: <span id="category-tickets-left-${categoryCount}">0</span></div>`;
    
    categoryDiv.innerHTML = categoryContent;
    container.appendChild(categoryDiv);
    categoryCount++;
    saveFormData();
}

function addTicketField(categoryId) {
    const categoryDiv = document.getElementById(`category-${categoryId}`);
    const inputCount = categoryDiv.getElementsByClassName('ticketCount').length;
    const newDiv = document.createElement('div');
    newDiv.classList.add('ticketField');
    const newInput = document.createElement('input');
    newInput.type = 'number';
    newInput.step = "0.01";
    newInput.classList.add('ticketCount');
    newInput.id = `ticket-${categoryId}-${inputCount}`;
    newInput.placeholder = 'Tickets left';
    newInput.setAttribute('oninput', `updateCategoryTotal(${categoryId})`);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('delete-button');
    deleteButton.innerText = 'x';
    deleteButton.setAttribute('onclick', `deleteTicketField(${categoryId}, ${inputCount})`);

    newDiv.appendChild(newInput);
    newDiv.appendChild(deleteButton);
    const addButton = categoryDiv.querySelector('.material-ui-button');
    categoryDiv.insertBefore(newDiv, addButton);
    saveFormData();
}

function deleteTicketField(categoryId, fieldId) {
    const ticketField = document.getElementById(`ticket-${categoryId}-${fieldId}`).parentNode;
    ticketField.parentNode.removeChild(ticketField);
    updateCategoryTotal(categoryId);
    saveFormData();
}

function updateCategoryTotal(categoryId) {
    const price = categoryPrices[categoryId % categoryPrices.length];
    const categoryDiv = document.getElementById(`category-${categoryId}`);
    const ticketCounts = categoryDiv.getElementsByClassName('ticketCount');
    let categoryTotal = 0;
    let totalTicketsLeft = 0;
    
    for (let j = 0; j < ticketCounts.length; j++) {
        const count = ticketCounts[j].value ? parseFloat(ticketCounts[j].value) : 0;
        categoryTotal += count * price;
        totalTicketsLeft += count;
    }
    
    document.getElementById(`category-total-${categoryId}`).innerText = categoryTotal.toFixed(2);
    document.getElementById(`category-tickets-left-${categoryId}`).innerText = totalTicketsLeft;
    updateTotalWorth();
    saveFormData();
}

function updateTotalWorth() {
    let totalWorth = 0;
    
    for (let i = 0; i < categoryCount; i++) {
        const categoryTotalElement = document.getElementById(`category-total-${i}`);
        const categoryTotal = parseFloat(categoryTotalElement.innerText);
        totalWorth += categoryTotal;
    }
    
    document.getElementById('totalWorth').innerText = totalWorth.toFixed(2);
    updateFinalTotal();
}

function updateFinalTotal() {
    const yesterdaysTotal = parseFloat(document.getElementById('yesterdaysTotal').value) || 0;
    const netSales = parseFloat(document.getElementById('netSales').value) || 0;
    const todaysCashes = parseFloat(document.getElementById('todaysCashes').value) || 0;
    const electronicTicketsSold = parseFloat(document.getElementById('electronicTicketsSold').value) || 0;
    const previousShiftCashDrop = parseFloat(document.getElementById('previousShiftCashDrop').value) || 0;
    const totalWorth = parseFloat(document.getElementById('totalWorth').innerText);

    const totalCashDrop = yesterdaysTotal - totalWorth + netSales - todaysCashes - electronicTicketsSold - previousShiftCashDrop;
    
    document.getElementById('totalCashDrop').innerText = totalCashDrop.toFixed(2);
    saveFormData();
}

function sendPDF() {
    alert("Sending PDF via email is not implemented in this demo.");
}

function downloadScreenshot() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'screenshot.png';
        link.click();
    });
}

function downloadReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const cashierName = document.getElementById('cashierName').value;
    const date = document.getElementById('date').value;
    const shiftType = document.getElementById('shiftType').value;
    const finalCashDrop = document.getElementById('finalCashDrop').value;
    const additionalNotes = document.getElementById('additionalNotes').value;
    const totalWorth = document.getElementById('totalWorth').innerText;
    const totalCashDrop = document.getElementById('totalCashDrop').innerText;

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    let yPosition = 10;
    let xPosition = 10;

    doc.text('Lottery Closing Report', 10, yPosition);
    yPosition += 8;
    doc.text(`Date: ${date}`, 10, yPosition);
    yPosition += 8;
    doc.text(`Shift Type: ${shiftType}`, 10, yPosition);
    yPosition += 8;
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 10, yPosition);
    yPosition += 8;
    doc.text(`Cashier Name: ${cashierName}`, 10, yPosition);
    yPosition += 8;

    // Draw table for categories
    doc.autoTable({
        startY: yPosition,
        head: [['Category', 'Tickets Left', 'Total No. of Tickets', 'Total']],
        body: categoryPrices.map((price, i) => {
            const ticketCounts = document.getElementById(`category-${i}`).getElementsByClassName('ticketCount');
            const tickets = Array.from(ticketCounts)
                .map(input => parseFloat(input.value) || 0);
            const totalTicketsLeft = tickets.reduce((sum, ticket) => sum + ticket, 0);
            const total = document.getElementById(`category-total-${i}`).innerText;
            return [`${price}$`, tickets.join(', '), totalTicketsLeft, `$${total}`];
        }),
        styles: {
            font: 'courier',
            halign: 'left',
            cellWidth: 'wrap'
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
        }
    });

    yPosition = doc.lastAutoTable.finalY + 8;

    doc.text(`Today's Total: $${totalWorth}`, 10, yPosition);
    yPosition += 8;

    if (document.getElementById('yesterdaysTotal').value) {
        doc.text(`Yesterday's Total: $${document.getElementById('yesterdaysTotal').value}`, 10, yPosition);
        yPosition += 8;
    }

    if (document.getElementById('netSales').value) {
        doc.text(`Net Sales: $${document.getElementById('netSales').value}`, 10, yPosition);
        yPosition += 8;
    }

    if (document.getElementById('todaysCashes').value) {
        doc.text(`Cashes: $${document.getElementById('todaysCashes').value}`, 10, yPosition);
        yPosition += 8;
    }

    if (document.getElementById('electronicTicketsSold').value) {
        doc.text(`Tickets: $${document.getElementById('electronicTicketsSold').value}`, 10, yPosition);
        yPosition += 8;
    }

    if (document.getElementById('previousShiftCashDrop').value) {
        doc.text(`Morning Shift Cash Drop: $${document.getElementById('previousShiftCashDrop').value}`, 10, yPosition);
        yPosition += 8;
    }

    doc.text(`Total Cash Drop: $${totalCashDrop}`, 10, yPosition);
    yPosition += 8;

    doc.text(`Final Cash Drop: $${finalCashDrop}`, 10, yPosition);
    yPosition += 8;

    if (additionalNotes) {
        const splitNotes = doc.splitTextToSize(`Additional Notes: ${additionalNotes}`, 180);
        doc.text(splitNotes, 10, yPosition);
        yPosition += splitNotes.length * 8;
    }

    // Add images
    addImageToPDF(doc, 'finalCashDropPicture', yPosition, 'Final Cash Drop', () => {
        addImageToPDF(doc, 'instantReport34', yPosition, 'Instant Report 34', () => {
            addImageToPDF(doc, 'specialReport50', yPosition, 'Special Report 50', () => {
                doc.save('lottery_closing_report.pdf');
            });
        });
    });
}

function addImageToPDF(doc, inputId, yPosition, label, callback) {
    const input = document.getElementById(inputId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const imgWidth = 180; // Set desired width
                const imgHeight = (img.height * imgWidth) / img.width; // Maintain aspect ratio
                doc.addPage();
                doc.text(label, 10, 10);
                doc.addImage(img, 'JPEG', 10, 20, imgWidth, imgHeight);
                if (callback) callback();
            };
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        if (callback) callback();
    }
}

function saveFormData() {
    const formData = {
        categories: [],
        yesterdaysTotal: document.getElementById('yesterdaysTotal').value,
        netSales: document.getElementById('netSales').value,
        todaysCashes: document.getElementById('todaysCashes').value,
        electronicTicketsSold: document.getElementById('electronicTicketsSold').value,
        previousShiftCashDrop: document.getElementById('previousShiftCashDrop').value,
        additionalNotes: document.getElementById('additionalNotes').value,
        cashierName: document.getElementById('cashierName').value,
        date: document.getElementById('date').value,
        shiftType: document.getElementById('shiftType').value,
        finalCashDrop: document.getElementById('finalCashDrop').value,
    };

    for (let i = 0; i < categoryCount; i++) {
        const category = {
            total: document.getElementById(`category-total-${i}`).innerText,
            tickets: []
        };
        const ticketCounts = document.getElementById(`category-${i}`).getElementsByClassName('ticketCount');
        for (let j = 0; j < ticketCounts.length; j++) {
            category.tickets.push(ticketCounts[j].value);
        }
        formData.categories.push(category);
    }

    localStorage.setItem('lotteryClosingFormData', JSON.stringify(formData));
}

function loadFormData() {
    const formData = JSON.parse(localStorage.getItem('lotteryClosingFormData'));
    if (!formData) return;

    categoryCount = formData.categories.length;
    const container = document.getElementById('lotteryCategories');
    container.innerHTML = '';

    for (let i = 0; i < categoryCount; i++) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.id = `category-${i}`;
        
        let categoryContent = `<h3>${categoryPrices[i % categoryPrices.length]}$ Category</h3>`;
        const category = formData.categories[i];
        
        for (let j = 0; j < category.tickets.length; j++) {
            categoryContent += `<div class="ticketField"><input type="number" step="0.01" class="ticketCount" id="ticket-${i}-${j}" oninput="updateCategoryTotal(${i})" value="${category.tickets[j]}" placeholder="Tickets left"><button type="button" class="delete-button" onclick="deleteTicketField(${i}, ${j})">x</button></div>`;
        }
        categoryContent += `<button type="button" class="material-ui-button" onclick="addTicketField(${i})"><span class="material-ui-icon">+</span>Add Ticket Field</button>`;
        categoryContent += `<div class="category-total">Total for ${categoryPrices[i % categoryPrices.length]}$ Category: $<span id="category-total-${i}">${category.total}</span></div>`;
        categoryContent += `<div class="category-tickets-left">Total No. of Tickets Left: <span id="category-tickets-left-${i}">${category.tickets.reduce((sum, ticket) => sum + (parseFloat(ticket) || 0), 0)}</span></div>`;
        
        categoryDiv.innerHTML = categoryContent;
        container.appendChild(categoryDiv);
    }

    document.getElementById('yesterdaysTotal').value = formData.yesterdaysTotal;
    document.getElementById('netSales').value = formData.netSales;
    document.getElementById('todaysCashes').value = formData.todaysCashes;
    document.getElementById('electronicTicketsSold').value = formData.electronicTicketsSold;
    document.getElementById('previousShiftCashDrop').value = formData.previousShiftCashDrop;
    document.getElementById('additionalNotes').value = formData.additionalNotes;
    document.getElementById('cashierName').value = formData.cashierName;
    document.getElementById('date').value = formData.date;
    document.getElementById('shiftType').value = formData.shiftType;
    document.getElementById('finalCashDrop').value = formData.finalCashDrop;

    updateTotalWorth();
}

function refreshPage() {
    localStorage.removeItem('lotteryClosingFormData');
    location.reload();
}

function showUploadedImage(event, imageId = 'uploadedImage') {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(imageId);
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}


