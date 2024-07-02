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
    
    let categoryContent = `<h3>Category $${categoryPrices[categoryCount % categoryPrices.length]}</h3>`;
    for (let i = 0; i < 12; i++) {
        categoryContent += `<input type="number" step="0.01" class="ticketCount" id="ticket-${categoryCount}-${i}" oninput="updateCategoryTotal(${categoryCount})" placeholder="Tickets left">`;
    }
    categoryContent += `<button type="button" onclick="addTicketField(${categoryCount})">Add Ticket Field</button>`;
    categoryContent += `<div class="category-total">Total for this category: $<span id="category-total-${categoryCount}">0.00</span></div>`;
    
    categoryDiv.innerHTML = categoryContent;
    container.appendChild(categoryDiv);
    categoryCount++;
    saveFormData();
}

function addTicketField(categoryId) {
    const categoryDiv = document.getElementById(`category-${categoryId}`);
    const inputCount = categoryDiv.getElementsByClassName('ticketCount').length;
    const newInput = document.createElement('input');
    newInput.type = 'number';
    newInput.step = "0.01";
    newInput.classList.add('ticketCount');
    newInput.id = `ticket-${categoryId}-${inputCount}`;
    newInput.placeholder = 'Tickets left';
    newInput.setAttribute('oninput', `updateCategoryTotal(${categoryId})`);
    categoryDiv.insertBefore(newInput, categoryDiv.lastChild.previousSibling);
    saveFormData();
}

function updateCategoryTotal(categoryId) {
    const price = categoryPrices[categoryId % categoryPrices.length];
    const categoryDiv = document.getElementById(`category-${categoryId}`);
    const ticketCounts = categoryDiv.getElementsByClassName('ticketCount');
    let categoryTotal = 0;
    
    for (let j = 0; j < ticketCounts.length; j++) {
        const count = ticketCounts[j].value ? parseFloat(ticketCounts[j].value) : 0;
        categoryTotal += count;
    }
    
    document.getElementById(`category-total-${categoryId}`).innerText = (categoryTotal * price).toFixed(2);
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

function downloadPDF() {
    const container = document.querySelector('.container');
    html2canvas(container).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF.jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save("lottery_closing_calculator.pdf");
    });
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
        
        let categoryContent = `<h3>Category $${categoryPrices[i % categoryPrices.length]}</h3>`;
        const category = formData.categories[i];
        
        for (let j = 0; j < category.tickets.length; j++) {
            categoryContent += `<input type="number" step="0.01" class="ticketCount" id="ticket-${i}-${j}" oninput="updateCategoryTotal(${i})" value="${category.tickets[j]}" placeholder="Tickets left">`;
        }
        categoryContent += `<button type="button" onclick="addTicketField(${i})">Add Ticket Field</button>`;
        categoryContent += `<div class="category-total">Total for this category: $<span id="category-total-${i}">${category.total}</span></div>`;
        
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
