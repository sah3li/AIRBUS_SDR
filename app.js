const sheetCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLl14OIm37fbnHC4vZy0PnXW7o-EmxnfJSAJuQLfg09JZ1Lv1X5VsQEBqN3dtaqoz7DK5vkQfIoDSX/pub?output=csv";

const container = document.getElementById('app-container');
const searchInput = document.getElementById('searchInput');
let appData = [];

Papa.parse(sheetCSV, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        appData = results.data.filter(row => row.AircraftMake || row.AircraftModel || row.PartName);
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

    data.forEach(row => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const makeModel = `${row.AircraftMake || ''} ${row.AircraftModel || ''}`.trim();
        const partName = row.PartName || 'Unknown Part';
        const partNum = row.PartNumber ? `(${row.PartNumber})` : '';
        const discrepancy = row.Discrepancy || 'No discrepancy logged.';
        const condition = row.PartCondition || 'N/A';
        const date = row.DifficultyDate || '--/--/----';

        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${makeModel}</h3>
                <span class="badge-date">${date}</span>
            </div>
            <div class="card-body">
                <p><strong>Part:</strong> ${partName} ${partNum}</p>
                <p><strong>Location:</strong> ${row.PartLocation || 'N/A'}</p>
                <p><strong>Discrepancy:</strong> ${discrepancy}</p>
                <span class="badge-condition">${condition}</span>
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
