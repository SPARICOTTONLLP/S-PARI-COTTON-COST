// Global variable to hold all saved cost sheets
let savedCostSheets = [];
const STORAGE_KEY = 's_pari_cost_sheets';

javascript
// Function to run the advanced calculation
function calculateAdvancedCost(event) {
    event.preventDefault();

    // --- 1. Get Values from HTML Inputs ---

    // NEW: Get Design Name
    const designName = document.getElementById('designName').value || 'Unnamed Design';

    // DMC Inputs (Variable Costs)
// Function to run the advanced calculation
function calculateAdvancedCost(event) {
    if (event) event.preventDefault();

    // --- 1. Get Values from HTML Inputs ---
    const designName = document.getElementById('designName').value || 'Unnamed Design';

    // DMC Inputs
    const rawMaterialCost = parseFloat(document.getElementById('rawMaterialCost').value) || 0;
    const materialLossPercentage = parseFloat(document.getElementById('materialLossPercentage').value) / 100 || 0;
    
    // DLC Inputs
    const cuttingCost = parseFloat(document.getElementById('cuttingCost').value) || 0;
    const sewingCost = parseFloat(document.getElementById('sewingCost').value) || 0;
    const finishingCost = parseFloat(document.getElementById('finishingCost').value) || 0;
    const qcCost = parseFloat(document.getElementById('qcCost').value) || 0;

    // Fixed Cost Inputs (MOH + SG&A)
    const productionRent = parseFloat(document.getElementById('productionRent').value) || 0;
    const machineMaintenance = parseFloat(document.getElementById('machineMaintenance').value) || 0;
    const utilities = parseFloat(document.getElementById('utilities').value) || 0;
    const productionSupervisors = parseFloat(document.getElementById('productionSupervisors').value) || 0;
    const officeRent = parseFloat(document.getElementById('officeRent').value) || 0;
    const salesSalaries = parseFloat(document.getElementById('salesSalaries').value) || 0;
    const marketingBudget = parseFloat(document.getElementById('marketingBudget').value) || 0;
    const adminOther = parseFloat(document.getElementById('adminOther').value) || 0;

    // Volume & Profit Inputs
    const monthlyVolume = parseFloat(document.getElementById('monthlyVolume').value) || 1; 
    const targetProfitPercentage = parseFloat(document.getElementById('targetProfitPercentage').value) / 100 || 0.15; 

    // --- 2. Calculation Logic ---

    const totalDMC = rawMaterialCost / (1 - materialLossPercentage);
    const totalDLC = cuttingCost + sewingCost + finishingCost + qcCost;
    const totalVariableCostPerUnit = totalDMC + totalDLC;

    const totalMOH = productionRent + machineMaintenance + utilities + productionSupervisors;
    const totalSGNA = officeRent + salesSalaries + marketingBudget + adminOther;
    const totalMonthlyFixedCost = totalMOH + totalSGNA;

    const fixedCostPerUnit = totalMonthlyFixedCost / monthlyVolume;

    const cogmPerUnit = totalVariableCostPerUnit + (totalMOH / monthlyVolume);
    const totalCostPerUnit = totalVariableCostPerUnit + fixedCostPerUnit; 

    const targetSellingPrice = totalCostPerUnit / (1 - targetProfitPercentage);

    const unitMargin = targetSellingPrice - totalVariableCostPerUnit;
    const breakEvenUnits = unitMargin > 0 ? totalMonthlyFixedCost / unitMargin : 0;
    
    const totalRevenue = targetSellingPrice * monthlyVolume;
    const totalProfit = totalRevenue - (totalVariableCostPerUnit * monthlyVolume) - totalMonthlyFixedCost;

    // --- 3. Display Results in HTML ---
    document.getElementById('resultDesignName').textContent = designName;
    document.getElementById('resultDMC').textContent = '₹' + totalDMC.toFixed(2);
    document.getElementById('resultDLC').textContent = '₹' + totalDLC.toFixed(2);
    document.getElementById('resultCOGM').textContent = '₹' + cogmPerUnit.toFixed(2);
    document.getElementById('resultFixed').textContent = '₹' + fixedCostPerUnit.toFixed(2);
    document.getElementById('resultTCS').textContent = '₹' + totalCostPerUnit.toFixed(2);
    document.getElementById('resultTargetPrice').textContent = '₹' + targetSellingPrice.toFixed(2);
    document.getElementById('resultProfitMargin').textContent = (targetProfitPercentage * 100).toFixed(1) + '%';
    document.getElementById('resultTotalProfit').textContent = '₹' + totalProfit.toFixed(2);
    document.getElementById('resultBEPUnits').textContent = Math.ceil(breakEvenUnits).toLocaleString() + ' Units';
    document.getElementById('resultBEPMonths').textContent = (breakEvenUnits / monthlyVolume).toFixed(1) + ' Months';
    
    // Return the current calculation object for saving
    return {
        id: Date.now(), // Unique ID for deletion
        designName: designName,
        totalCost: totalCostPerUnit.toFixed(2),
        targetPrice: targetSellingPrice.toFixed(2),
        breakEvenUnits: Math.ceil(breakEvenUnits).toLocaleString(),
        // Store all input values for future recall
        inputs: Array.from(document.querySelectorAll('#costCalculator input')).reduce((acc, input) => {
            acc[input.id] = input.value;
            return acc;
        }, {})
    };
}

// Function to save the CURRENT calculation to the list
function saveCurrentSheet() {
    const form = document.getElementById('costCalculator');
    if (!form.checkValidity()) {
        form.reportValidity(); // Show native browser validation errors
        return;
    }

    const currentSheet = calculateAdvancedCost();
    
    // Add the new sheet to the array
    savedCostSheets.push(currentSheet);
    
    // Save the entire array to Local Storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCostSheets));
    
    // Update the display
    renderSavedSheets();
    
    alert(Design "${currentSheet.designName}" saved successfully!);
}

// Function to delete a sheet from the list
function deleteSheet(sheetId) {
    if (!confirm("Are you sure you want to delete this cost sheet?")) return;

    // Filter out the sheet with the matching ID
    savedCostSheets = savedCostSheets.filter(sheet => sheet.id !== sheetId);
    
    // Update Local Storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCostSheets));
    
    // Re-render the display
    renderSavedSheets();
}

// Function to load the inputs of a saved sheet back into the form
function loadSheetInputs(sheetId) {
    const sheetToLoad = savedCostSheets.find(sheet => sheet.id === sheetId);
    if (!sheetToLoad) return;

    // Populate all form inputs
    for (const id in sheetToLoad.inputs) {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.value = sheetToLoad.inputs[id];
        }
    }
    
    // Re-run the calculation to update the results display
    calculateAdvancedCost(); 
    alert(Design "${sheetToLoad.designName}" loaded into the calculator!);
}

// Function to render the list of saved sheets into the HTML table
function renderSavedSheets() {
    const tbody = document.querySelector('#costSheetsTable tbody');
    const noDataMessage = document.getElementById('no-data-message');
    tbody.innerHTML = ''; // Clear previous rows

    if (savedCostSheets.length === 0) {
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';

    savedCostSheets.forEach(sheet => {
        const row = tbody.insertRow();
        row.insertCell().textContent = sheet.designName;
        row.insertCell().textContent = '₹' + sheet.totalCost;
        row.insertCell().textContent = '₹' + sheet.targetPrice;
        row.insertCell().textContent = sheet.breakEvenUnits;
        
        // Action Cell with buttons
        const actionCell = row.insertCell();
        
        // Load Button
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load';
        loadBtn.onclick = () => loadSheetInputs(sheet.id);
        actionCell.appendChild(loadBtn);

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteSheet(sheet.id);
        actionCell.appendChild(deleteBtn);
    });
}

// Function to load saved data from Local Storage on page load
function loadInitialData() {
    const storedSheets = localStorage.getItem(STORAGE_KEY);
    if (storedSheets) {
        // Parse the stored JSON string back into the array
        savedCostSheets = JSON.parse(storedSheets);
        renderSavedSheets(); // Display the loaded data
    }
}

// --- 3. Event Listener Setup ---

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('costCalculator');
    
    // Prevent the form from submitting/reloading, just run calculation
    form.addEventListener('submit', calculateAdvancedCost); 

    // Listen for clicks on the new dedicated "Save Design" button
    const saveButton = document.getElementById('saveSheetBtn');
    if (saveButton) {
        saveButton.addEventListener('click', saveCurrentSheet);
    }
    
    // Load existing data when the page is ready
    loadInitialData();
});

