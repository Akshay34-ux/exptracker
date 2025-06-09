function getExpenses() {
  return JSON.parse(localStorage.getItem("expenses") || "[]");
}

function saveExpense(expense) {
  const expenses = getExpenses();
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderSummary() {
  const expenses = getExpenses();
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const count = expenses.length;

  if (document.getElementById("totalAmount"))
    document.getElementById("totalAmount").textContent = "₹" + total.toFixed(2);

  if (document.getElementById("expenseCount"))
    document.getElementById("expenseCount").textContent = count;
}

function renderTable() {
  const expenses = getExpenses();
  const table = document.getElementById("expenseTable");
  if (!table) return;

  table.innerHTML = "";
  expenses.forEach(exp => {
    const row = document.createElement("tr");
    row.className = "border-t";
    row.innerHTML = `
      <td class="px-4 py-2">${exp.date}</td>
      <td class="px-4 py-2">${exp.category}</td>
      <td class="px-4 py-2">₹${parseFloat(exp.amount).toFixed(2)}</td>
      <td class="px-4 py-2">${exp.notes}</td>
    `;
    table.appendChild(row);
  });
}

function setupForm() {
  const form = document.getElementById("expenseForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = form.date.value;
    const category = form.category.value;
    const amount = form.amount.value;
    const notes = form.notes.value;

    if (!date || !amount) {
      alert("Please fill in date and amount.");
      return;
    }

    saveExpense({ date, category, amount, notes });
    alert("Expense added!");

    form.reset();
    renderSummary();
    renderCharts();
  });
}

function renderCharts() {
  const expenses = getExpenses();
  const categoryTotals = {};
  const dailyTotals = {};

  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
    dailyTotals[e.date] = (dailyTotals[e.date] || 0) + parseFloat(e.amount);
  });

  const categoryChart = document.getElementById("categoryChart");
  const dailyChart = document.getElementById("dailyChart");

  if (categoryChart) {
    new Chart(categoryChart, {
      type: "pie",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          label: "By Category",
          data: Object.values(categoryTotals),
          backgroundColor: ["#60A5FA", "#34D399", "#FBBF24", "#F87171"]
        }]
      }
    });
  }

  if (dailyChart) {
    const sortedDates = Object.keys(dailyTotals).sort();
    new Chart(dailyChart, {
      type: "bar",
      data: {
        labels: sortedDates,
        datasets: [{
          label: "₹ per Day",
          data: sortedDates.map(d => dailyTotals[d]),
          backgroundColor: "#3B82F6"
        }]
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderSummary();
  renderTable();
  setupForm();
  renderCharts();
});