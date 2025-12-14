// Function to run the advanced calculation
function calculateAdvancedCost(event) {
    event.preventDefault();

    // --- 1. Get Values from HTML Inputs ---

    // DMC Inputs (Variable Costs)
    const mainFabricCost = +document.getElementById('mainFabricCost').value || 0;
    const mainFabricQty = +document.getElementById('mainFabricQty').value || 0;
    const liningFabricCost = +document.getElementById('liningFabricCost').value || 0;
    const liningFabricQty = +document.getElementById('liningFabricQty').value || 0;
    const trimsCost = +document.getElementById('trimsCost').value || 0;
    const diamondCost = +document.getElementById('diamondCost').value || 0;
    const packagingCost = +document.getElementById('packagingCost').value || 0;
    
    // DLC Inputs (Variable Costs)
    const cuttingCost = +document.getElementById('cuttingCost').value || 0;
    const stitchingCost = +document.getElementById('stitchingCost').value || 0;
    const diamondLaborCost = +document.getElementById('diamondLaborCost').value || 0;
    const specialStitchCost = +document.getElementById('specialStitchCost').value || 0;
    const finishingCost = +document.getElementById('finishingCost').value || 0;

    // MOH Inputs (Fixed & Volume)
    const monthlyRent = +document.getElementById('monthlyRent').value || 0; // FIXED
    const monthlyUtilities = +document.getElementById('monthlyUtilities').value || 0; // FIXED
    const monthlySupervisors = +document.getElementById('monthlySupervisors').value || 0; // FIXED
    const monthlyOutput = +document.getElementById('monthlyOutput').value || 1; 

    // SG&A and Profit Inputs
    const monthlyMarketing = +document.getElementById('monthlyMarketing').value || 0; // FIXED
    const miscExpensesRate = +document.getElementById('miscExpensesRate').value || 0; // %
    const salesCommissionRate = +document.getElementById('salesCommissionRate').value || 0; // %
    const profitMargin = +document.getElementById('profitMargin').value || 0; // %

    // --- 2. Perform Detailed Cost Calculations (Same as before) ---

    // A. Variable Costs (VC) per Unit
    const totalDMC = (mainFabricCost * mainFabricQty) + (liningFabricCost * liningFabricQty) + trimsCost + diamondCost + packagingCost;
    const totalDLC = cuttingCost + stitchingCost + diamondLaborCost + specialStitchCost + finishingCost;
    const totalVariableCostPerUnit = totalDMC + totalDLC;
    
    // B. Fixed Costs (FC) - Monthly
    // Note: The variable parts of MOH (like machine maintenance) are sometimes tricky; here we treat the main MOH and all SG&A as FIXED
    const totalFixedCost = monthlyRent + monthlyUtilities + monthlySupervisors + monthlyMarketing;

    // C. Manufacturing Overhead (MOH) and SG&A Per Unit (for reporting)
    const mohPerUnit = (monthlyRent + monthlyUtilities + monthlySupervisors) / monthlyOutput;
    const sgaPerUnit = monthlyMarketing / monthlyOutput;

    // D. Cost of Goods Manufactured (COGM)
    const cogmPerUnit = totalDMC + totalDLC + mohPerUnit;

    // E. Total Cost To Make and Sell (TCM)
    const totalCostToMakeAndSell = cogmPerUnit + sgaPerUnit;
    const finalTotalCost = totalCostToMakeAndSell * (1 + (miscExpensesRate / 100));

    // F. Suggested Selling Price (SSP)
    const priceBeforeCommission = finalTotalCost / (1 - (salesCommissionRate / 100));
    const sellingPrice = priceBeforeCommission * (1 + (profitMargin / 100));

    // --- 3. BREAK-EVEN POINT CALCULATION (NEW) ---

    // Contribution Margin (CM) Per Unit: The amount each sale contributes to covering fixed costs.
    // CM = Selling Price - Variable Cost (VC)
    // IMPORTANT: The VC must NOT include any allocated fixed costs (MOH/SG&A)
    const contributionMarginPerUnit = sellingPrice - totalVariableCostPerUnit;

    let breakEvenPoint = 0;
    if (contributionMarginPerUnit > 0) {
        // Break-Even Point (in units) = Total Fixed Costs / Contribution Margin Per Unit
        breakEvenPoint = totalFixedCost / contributionMarginPerUnit;
    }

    // --- 4. Display Results ---
    
    document.getElementById('displayDMC').textContent = totalDMC.toFixed(2);
    document.getElementById('displayDLC').textContent = totalDLC.toFixed(2);
    document.getElementById('displayMOH').textContent = mohPerUnit.toFixed(2);
    document.getElementById('displayCOGM').textContent = cogmPerUnit.toFixed(2);
    document.getElementById('displaySGA').textContent = sgaPerUnit.toFixed(2);
    document.getElementById('displayTotalCost').textContent = finalTotalCost.toFixed(2);
    document.getElementById('displaySellingPrice').textContent = sellingPrice.toFixed(2);
    
    // NEW: Display Break-Even Result
    document.getElementById('displayBreakEven').textContent = Math.ceil(breakEvenPoint); // Use Math.ceil to round up to the next whole number of suits
}

// 5. Attach the function to the form's submit event (assuming form ID is 'costCalculator')
document.getElementById('costCalculator').addEventListener('submit', calculateAdvancedCost);
