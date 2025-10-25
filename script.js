// EMI Calculator JavaScript
let tenureInMonths = true; // Track if tenure is in months or years
let emiChart = null;

// Get DOM elements
const loanAmount = document.getElementById('loanAmount');
const loanAmountSlider = document.getElementById('loanAmountSlider');
const interestRate = document.getElementById('interestRate');
const interestRateSlider = document.getElementById('interestRateSlider');
const loanTenure = document.getElementById('loanTenure');
const loanTenureSlider = document.getElementById('loanTenureSlider');
const monthsBtn = document.getElementById('monthsBtn');
const yearsBtn = document.getElementById('yearsBtn');
const calculateBtn = document.getElementById('calculateBtn');
const toggleTableBtn = document.getElementById('toggleTableBtn');
const tableWrapper = document.getElementById('tableWrapper');

// Sync input fields with sliders
loanAmount.addEventListener('input', (e) => {
    loanAmountSlider.value = e.target.value;
});

loanAmountSlider.addEventListener('input', (e) => {
    loanAmount.value = e.target.value;
});

interestRate.addEventListener('input', (e) => {
    interestRateSlider.value = e.target.value;
});

interestRateSlider.addEventListener('input', (e) => {
    interestRate.value = e.target.value;
});

loanTenure.addEventListener('input', (e) => {
    loanTenureSlider.value = e.target.value;
});

loanTenureSlider.addEventListener('input', (e) => {
    loanTenure.value = e.target.value;
});

// Toggle between months and years
monthsBtn.addEventListener('click', () => {
    tenureInMonths = true;
    monthsBtn.classList.add('active');
    yearsBtn.classList.remove('active');
    loanTenureSlider.max = 360;
    loanTenure.max = 360;
    document.getElementById('minTenure').textContent = '1 Month';
    document.getElementById('maxTenure').textContent = '30 Years';
});

yearsBtn.addEventListener('click', () => {
    tenureInMonths = false;
    yearsBtn.classList.add('active');
    monthsBtn.classList.remove('active');
    loanTenureSlider.max = 30;
    loanTenure.max = 30;
    document.getElementById('minTenure').textContent = '1 Year';
    document.getElementById('maxTenure').textContent = '30 Years';
});

// Toggle amortization table
toggleTableBtn.addEventListener('click', () => {
    if (tableWrapper.style.display === 'none') {
        tableWrapper.style.display = 'block';
        toggleTableBtn.textContent = 'Hide Full Schedule';
    } else {
        tableWrapper.style.display = 'none';
        toggleTableBtn.textContent = 'Show Full Schedule';
    }
});

// Calculate EMI
calculateBtn.addEventListener('click', calculateEMI);

function calculateEMI() {
    // Get input values
    const principal = parseFloat(loanAmount.value);
    const annualRate = parseFloat(interestRate.value);
    let tenure = parseFloat(loanTenure.value);

    // Validation
    if (!principal || principal <= 0) {
        alert('Please enter a valid loan amount');
        return;
    }
    if (!annualRate || annualRate <= 0) {
        alert('Please enter a valid interest rate');
        return;
    }
    if (!tenure || tenure <= 0) {
        alert('Please enter a valid loan tenure');
        return;
    }

    // Convert tenure to months if in years
    const tenureMonths = tenureInMonths ? tenure : tenure * 12;

    // Calculate monthly interest rate
    const monthlyRate = annualRate / 12 / 100;

    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalAmount = emi * tenureMonths;
    const totalInterest = totalAmount - principal;

    // Display results
    document.getElementById('emiValue').textContent = formatCurrency(emi);
    document.getElementById('principalValue').textContent = formatCurrency(principal);
    document.getElementById('interestValue').textContent = formatCurrency(totalInterest);
    document.getElementById('totalValue').textContent = formatCurrency(totalAmount);

    // Show result section with animation
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Update chart
    updateChart(principal, totalInterest);

    // Generate amortization table
    generateAmortizationTable(principal, emi, monthlyRate, tenureMonths);
}

// Format number as currency
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    });
}

// Update pie chart
function updateChart(principal, interest) {
    const ctx = document.getElementById('emiChart').getContext('2d');

    if (emiChart) {
        emiChart.destroy();
    }

    emiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal Amount', 'Total Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: [
                    '#667eea',
                    '#f093fb'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrency(context.parsed);
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Generate amortization table
function generateAmortizationTable(principal, emi, monthlyRate, tenureMonths) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    let balance = principal;

    for (let month = 1; month <= tenureMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = emi - interestPayment;
        balance = balance - principalPayment;

        // Avoid negative balance due to rounding
        if (balance < 0) balance = 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}</td>
            <td>${formatCurrency(emi)}</td>
            <td>${formatCurrency(principalPayment)}</td>
            <td>${formatCurrency(interestPayment)}</td>
            <td>${formatCurrency(balance)}</td>
        `;
        tableBody.appendChild(row);
    }
}

// Calculate on page load with default values
window.addEventListener('load', calculateEMI);