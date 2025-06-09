import React, { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

function App() {
  // State to store expenses
  const [expenses, setExpenses] = useState([]);

  // Form fields state
  const [formData, setFormData] = useState({
    date: "",
    category: "Food",
    amount: "",
    notes: "",
  });

  // Chart refs to draw charts on canvas
  const categoryChartRef = useRef(null);
  const dailyChartRef = useRef(null);

  // Chart instances (to destroy old ones when re-rendering)
  const categoryChartInstance = useRef(null);
  const dailyChartInstance = useRef(null);

  // Load expenses from localStorage once on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("expenses") || "[]");
    setExpenses(stored);
  }, []);

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderCharts();
  }, [expenses]);

  // Update form state on input change
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle form submit
  function handleSubmit(e) {
    e.preventDefault();
    const { date, category, amount, notes } = formData;

    if (!date || !amount) {
      alert("Please fill in date and amount.");
      return;
    }

    // Add new expense
    setExpenses((prev) => [
      ...prev,
      { date, category, amount: parseFloat(amount), notes },
    ]);

    alert("Expense added!");

    // Reset form
    setFormData({
      date: "",
      category: "Food",
      amount: "",
      notes: "",
    });
  }

  // Calculate summary
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseCount = expenses.length;

  // Render charts
  function renderCharts() {
    const categoryTotals = {};
    const dailyTotals = {};

    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount;
    });

    // Destroy previous charts to prevent overlap
    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }
    if (dailyChartInstance.current) {
      dailyChartInstance.current.destroy();
    }

    // Category Pie Chart
    if (categoryChartRef.current) {
      categoryChartInstance.current = new Chart(categoryChartRef.current, {
        type: "pie",
        data: {
          labels: Object.keys(categoryTotals),
          datasets: [
            {
              label: "By Category",
              data: Object.values(categoryTotals),
              backgroundColor: ["#60A5FA", "#34D399", "#FBBF24", "#F87171"],
            },
          ],
        },
      });
    }

    // Daily Bar Chart
    if (dailyChartRef.current) {
      const sortedDates = Object.keys(dailyTotals).sort();
      dailyChartInstance.current = new Chart(dailyChartRef.current, {
        type: "bar",
        data: {
          labels: sortedDates,
          datasets: [
            {
              label: "₹ per Day",
              data: sortedDates.map((d) => dailyTotals[d]),
              backgroundColor: "#3B82F6",
            },
          ],
        },
      });
    }
  }

  // Render charts initially and when expenses change
  useEffect(() => {
    renderCharts();
  }, [expenses]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Expense Tracker</h1>

      {/* Summary */}
      <div className="flex gap-8 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Total Amount</h2>
          <p>₹{totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Expense Count</h2>
          <p>{expenseCount}</p>
        </div>
      </div>

      {/* Expense Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div>
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="border px-2 py-1 ml-2"
          >
            <option>Food</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Amount"
            required
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div>
          <label>Notes:</label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Notes"
            className="border px-2 py-1 ml-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Expense
        </button>
      </form>

      {/* Expense Table */}
      <table className="w-full border-collapse border border-gray-300 mb-8">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{exp.date}</td>
              <td className="px-4 py-2">{exp.category}</td>
              <td className="px-4 py-2">₹{exp.amount.toFixed(2)}</td>
              <td className="px-4 py-2">{exp.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Charts */}
      <div className="flex gap-8 flex-wrap">
        <div>
          <h3 className="font-semibold mb-2">Expenses by Category</h3>
          <canvas ref={categoryChartRef} width="400" height="400"></canvas>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Expenses by Day</h3>
          <canvas ref={dailyChartRef} width="400" height="400"></canvas>
        </div>
      </div>
    </div>
  );
}

export default App;
