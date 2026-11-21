// Hostel Budget Manager - short version

const categories = ["Food", "Travel", "Books", "Shopping", "Bills", "Fun", "Other"];
let budget = 0;
let expenses = [];
let category = "";

function get(id) {
  return document.getElementById(id);
}

function money(n) {
  return "₹" + parseFloat(n.toFixed(2));
}

// mera hissa kitna hai
function myShare(e) {
  return e.split === "Just me" ? e.amount : e.amount / e.people;
}

function save() {
  localStorage.setItem("hostel", JSON.stringify({ budget: budget, expenses: expenses }));
  show();
}

function show() {
  // ----- summary -----
  const spent = expenses.reduce((total, e) => total + myShare(e), 0);
  const left = budget - spent;
  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  const d = new Date();
  const daysLeft = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1;

  get("budgetText").textContent = money(budget);
  get("spentText").textContent = money(spent);
  get("leftText").textContent = money(left);
  get("dailyLimitText").textContent = money(left > 0 ? left / daysLeft : 0);
  get("barFill").style.width = Math.min(percent, 100) + "%";
  get("barFill").style.background = percent < 70 ? "#22b573" : percent < 100 ? "#f5b82e" : "#ef4565";
  get("message").textContent = budget === 0 ? "Save a budget to get started."
    : percent < 70 ? "Great! You are inside your budget. 👍"
    : percent < 100 ? "Careful! " + Math.round(percent) + "% of budget used."
    : "Over budget by " + money(spent - budget) + "! 🚨";

  // ----- who owes whom -----
  let theyOweMe = 0;
  let iOweThem = 0;
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    if (e.split === "Just me" || e.settled) {
      continue;
    }
    if (e.paidBy === "me") {
      theyOweMe += e.amount - myShare(e);
    } else {
      iOweThem += myShare(e);
    }
  }
  get("owedToMe").textContent = money(theyOweMe);
  get("iOwe").textContent = money(iOweThem);

  // ----- category chips -----
  let chips = "";
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    chips += `<button class="chip ${c === category ? "selected" : ""}" style="${c === category ? "background:#3b6cf6" : ""}" onclick="pickCategory('${c}')">${c}</button>`;
  }
  get("categoryChips").innerHTML = chips;

  // ----- expense list (naya sabse upar) -----
  let list = "";
  for (let i = expenses.length - 1; i >= 0; i--) {
    const e = expenses[i];
    const shared = e.split !== "Just me";
    list += `<li class="${e.settled ? "settled" : ""}">
      <div class="item-info"><strong>${e.title}</strong>
        <small>${e.category} • ${e.date} • ${e.split}${shared ? (e.paidBy === "me" ? " • You paid" : " • Other paid") : ""}</small></div>
      <div class="item-right"><span class="item-amount">${money(myShare(e))}</span><br>
        ${shared && !e.settled ? `<button class="mini-btn settle-btn" onclick="settle(${e.id})">Settle</button>` : ""}
        <button class="mini-btn delete-btn" onclick="remove(${e.id})">Delete</button></div>
    </li>`;
  }
  get("expenseList").innerHTML = list === "" ? '<li class="empty">No expenses yet.</li>' : list;
}

function pickCategory(name) {
  category = name;
  show();
}

function addExpense() {
  const title = get("titleInput").value.trim();
  const amount = Number(get("amountInput").value);
  const date = get("dateInput").value;
  const split = get("splitInput").value;
  const people = Number(get("peopleInput").value);

  if (title === "" || amount <= 0 || category === "" || date === "") {
    get("error").textContent = "Please fill title, amount, category and date.";
    return;
  }
  if (split !== "Just me" && people < 2) {
    get("error").textContent = "People must be at least 2.";
    return;
  }
  get("error").textContent = "";

  expenses.push({
    id: Date.now(),
    title: title,
    amount: amount,
    category: category,
    date: date,
    split: split,
    people: people,
    paidBy: split === "Just me" ? "me" : get("paidByInput").value,
    settled: false
  });

  get("titleInput").value = "";
  get("amountInput").value = "";
  category = "";
  save();
}

function remove(id) {
  expenses = expenses.filter((e) => e.id !== id);
  save();
}

function settle(id) {
  for (let i = 0; i < expenses.length; i++) {
    if (expenses[i].id === id) {
      expenses[i].settled = true;
    }
  }
  save();
}

// ----- buttons -----
get("saveBudgetBtn").addEventListener("click", function () {
  budget = Number(get("budgetInput").value);
  save();
});
get("addBtn").addEventListener("click", addExpense);
get("clearBtn").addEventListener("click", function () {
  if (confirm("Delete all expenses?")) {
    expenses = [];
    save();
  }
});
get("splitInput").addEventListener("change", function () {
  get("splitDetails").classList.toggle("hidden", get("splitInput").value === "Just me");
});

// ----- page khulte hi -----
const saved = localStorage.getItem("hostel");
if (saved) {
  budget = JSON.parse(saved).budget;
  expenses = JSON.parse(saved).expenses;
  get("budgetInput").value = budget;
}
get("dateInput").value = new Date().toISOString().slice(0, 10);
show();
