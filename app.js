const sheetCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLl14OIm37fbnHC4vZy0PnXW7o-EmxnfJSAJuQLfg09JZ1Lv1X5VsQEBqN3dtaqoz7DK5vkQfIoDSX/pub?output=csv";

const container = document.getElementById('app-container');
const searchInput = document.getElementById('searchInput');
let appData = [];

Papa.parse(sheetCSV, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        // إضافة رقم السطر الأصلي لكل صف (السطر 1 عناوين، البيانات تبدأ من 2)
        appData = results.data.map((row, index) => {
            row.originalRowNumber = index + 2;
            return row;
        }).filter(row => row.AircraftMake || row.AircraftModel || row.PartName);
        
        renderCards(appData);
    },
    error: function(err) {
        container.innerHTML = '<div class="loader">Error loading data.</div>';
    }
});

function renderCards(data) {
    container.innerHTML = '';
    if(data.length === 0) {
        container.innerHTML = '<div class="loader">No records found.</div>';
        return;
    }

    // جلب البيانات المحفوظة للبطاقات المقروءة
    const readCards = JSON.parse(localStorage.getItem('readCards')) || [];

    data.forEach(row => {
        const card = document.createElement('div');
        const rowNum = row.originalRowNumber;
        const isRead = readCards.includes(rowNum);
        
        card.className = `card ${isRead ? 'read' : ''}`;
        card.id = `card-${rowNum}`;
        
        const makeModel = `${row.AircraftMake || ''} ${row.AircraftModel || ''}`.trim();
        const partName = row.PartName || 'Unknown Part';
        const partNum = row.PartNumber ? `(${row.PartNumber})` : '';
        const discrepancy = row.Discrepancy || 'No discrepancy logged.';
        const condition = row.PartCondition || 'N/A';
        const date = row.DifficultyDate || '--/--/----';

        card.innerHTML = `
            <div class="card-header-top">
                <span class="row-number">Row #${rowNum}</span>
                <span class="badge-date">${date}</span>
            </div>
            <div class="card-header">
                <h3 class="card-title">${makeModel}</h3>
            </div>
            <div class="card-body">
                <p><strong>Part:</strong> ${partName} ${partNum}</p>
                <p><strong>Location:</strong> ${row.PartLocation || 'N/A'}</p>
                <p><strong>Discrepancy:</strong> ${discrepancy}</p>
                <span class="badge-condition">${condition}</span>
            </div>
            <div class="card-actions">
                <button class="btn-read ${isRead ? 'active' : ''}" onclick="toggleRead(${rowNum}, this)">
                    ${isRead ? '✔ Read' : 'Mark as Read'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = appData.filter(row => {
        return Object.values(row).some(val => 
            String(val).toLowerCase().includes(term)
        );
    });
    renderCards(filtered);
});

// دالة تغيير حالة القراءة وحفظها
window.toggleRead = function(rowNum, btn) {
    let readCards = JSON.parse(localStorage.getItem('readCards')) || [];
    const card = document.getElementById(`card-${rowNum}`);
    
    if (readCards.includes(rowNum)) {
        readCards = readCards.filter(id => id !== rowNum);
        btn.className = 'btn-read';
        btn.innerText = 'Mark as Read';
        card.classList.remove('read');
    } else {
        readCards.push(rowNum);
        btn.className = 'btn-read active';
        btn.innerText = '✔ Read';
        card.classList.add('read');
    }
    localStorage.setItem('readCards', JSON.stringify(readCards));
};
