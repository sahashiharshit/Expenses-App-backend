

//global expenses
let globalExpenses = [];
let categories = [];
//Function to hide all sections
const hideAllSections = () => {
  document.querySelectorAll(".app-section").forEach((section) => {
    section.classList.add("hidden");
  });
};

// Set up navigation button event listeners
const setupNavButtons = () => {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      hideAllSections();
      const targetSection = document.getElementById(targetId);

      targetSection?.classList.remove("hidden");
    });
  });
};
//populate categories in the dropdown

const populateCategories = async () => {
  try {
    const { data } = await axios.get(
      "https://expenses-app-ja1q.onrender.com/expense/getCategories"
    );
    categories = data;
    updateCategoryDropdown();
  } catch (error) {
    console.log("Error fetching categories:", error);
  }
};
const updateCategoryDropdown = (filter = "") => {
  const categoryList = document.getElementById("categoryList");
  const categoryInput = document.getElementById("categoryInput");
  const categorySelect = document.getElementById("category");
  const filtered = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(filter.toLowerCase())
  );
  categoryList.innerHTML = "";
  filtered.forEach(({ _id, categoryName }) => {
    const li = document.createElement("li");
    li.textContent = categoryName;
    li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
    li.addEventListener("click", () => {
      categoryInput.value = categoryName;
      categoryList.classList.add("hidden");
      categorySelect.innerHTML = `<option value="${_id}" selected>${categoryName}</option>`;
    });
    categoryList.appendChild(li);
  });
  categoryList.classList.toggle("hidden", filtered.length === 0);
};

//function to add expense to database
const expenseform = document.getElementById("expenseForm");
expenseform.addEventListener("submit", async (e) => {
  e.preventDefault();

  const money = document.querySelector("#money").value;
  const expenseName = document.querySelector("#expense").value;
  const categoryId = document.querySelector("#category").value;

  try {
    const token = localStorage.getItem("AuthToken");
    await axios.post(
      "https://expenses-app-ja1q.onrender.com/expense/add",
      {
        money,
        expenseName,
        categoryId,
      },
      { headers: { Authorization: token } }
    );
    expenseform.reset();
    hideAllSections();
    document.getElementById("expenseListSection").classList.remove("hidden");
    const userPreference = localStorage.getItem("expensesPerPage") || 5;
    loadBudgetData(userPreference);
  } catch (error) {
    console.log(error);
  }
});

// income form event listener
const incomeForm = document.getElementById("incomeForm");
incomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("AuthToken");
  const amount = document.querySelector("#amount").value;
  const incomeSource = document.querySelector("#sourceName").value;

  const { data } = await axios.post(
    "https://expenses-app-ja1q.onrender.com/expense/income/add",
    {
      incomeSource,
      amount,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );
  incomeForm.reset();
  hideAllSections();
  document.getElementById("expenseListSection").classList.remove("hidden");
  const userPreference = localStorage.getItem("expensesPerPage") || 5;
  loadBudgetData(userPreference);
});

const loadBudgetData = async (limit = 5, page = 1) => {
  try {
    let month = localStorage.getItem("month");
    if (!month) {
      const current = new Date();
      const year = current.getFullYear();
      const monthIndex = String(current.getMonth() + 1).padStart(2, "0");
      month = `${year}-${monthIndex}`;
      localStorage.setItem("month", month);
    }
    const { data } = await axios.get(
      `https://expenses-app-ja1q.onrender.com/expense/getBudget/${month}?page=${page}&limit=${limit}`,
      { headers: { Authorization: localStorage.getItem("AuthToken") } }
    );
    //console.log(data);
    //update income,remaining budget and month in the UI
    renderIncome(data);

    //fetch and display expenses
    globalExpenses = data.expenses;
    renderExpenses(data.expenses);
    renderPagination(data.currentPage, data.totalPages, limit);
  } catch (error) {
    console.error("Error loading budget data:", error);
  }
};
const renderIncome = (data) => {
  document.getElementById("currentMonth").innerText = new Date(
    data.month
  ).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
  document.getElementById(
    "percentage"
  ).innerText = `${data.percentUsed}% of 100%`;
  document.getElementById("totalIncome").innerText = `₹${data.income}`;

  document.getElementById("remainingBudget").innerText = `₹${data.remaining}`;
};

window.addEventListener("DOMContentLoaded", () => {
  setupNavButtons();
  populateCategories();
  checkPremium();
  showOldReports();
  document.getElementById("expenseForm").reset();

  const expensesPerPageDropdown = document.getElementById("expensesPerPage");
  let userPreference = localStorage.getItem("expensesPerPage") || 5;

  // Set the dropdown to reflect the stored preference
  expensesPerPageDropdown.value = userPreference;
  const monthpicker = document.getElementById("monthpicker");
  monthpicker.addEventListener("change", async (e) => {
    const value = e.target.value;
    const [year, month] = value.split("-");
    const monthString = `${year}-${month}`;
    localStorage.setItem("month", monthString);
    loadBudgetData(userPreference);
  });
  const month = new Date().toLocaleDateString("en-GB", {
    month: "2-digit",
    year: "numeric",
  });

  const [monthIndex, year] = month.split("/").map(Number);
  const monthString = `${year}-${monthIndex}`;
  localStorage.setItem("month", monthString);
  loadBudgetData(userPreference);

  // Update the preference when the user selects a new value
  expensesPerPageDropdown.addEventListener("change", () => {
    userPreference = expensesPerPageDropdown.value;
    localStorage.setItem("expensesPerPage", userPreference);
    loadBudgetData(userPreference); // Reload expenses with new limit
  });

  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    const answer = confirm("Are you sure you want to logout?");
    if (answer) {
      localStorage.removeItem("AuthToken");
      localStorage.removeItem("expensesPerPage");
      window.location.href = "/views/login.html";
    }
  });
  
  document.getElementById("categoryInput").addEventListener("input", (e) => {
    updateCategoryDropdown(e.target.value);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".relative")) {
      document.getElementById("categoryList").classList.add("hidden");
    }
  });
});

//Function to display expenses

//function to fetching expenses from backend
const renderExpenses = (expenses) => {
  const container = document.getElementById("expense-body");
  if (!expenses.length) {
    container.innerHTML = `<p class="text-gray-500 text-center">No expenses found.</p>`;
    return;
  }
  container.innerHTML = expenses
    .map(
      (expense, index) => `
            <tr id="expense-${
              expense._id
            }" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 ">${index + 1}</td>
                <td class="px-6 py-4">${expense.expenseName}</td>
                <td class="px-6 py-4 ">${expense.money}</td>
                <td class="px-6 py-4 ">${expense.categoryId.categoryName}</td>
                <td class="px-6 py-4 ">${new Date(
                  expense.date
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}</td>
                <td class="px-6 py-4 text-center">
                <button class="text-red-600 hover:text-red-800 font-medium" onclick="deleteExpense('${
                  expense._id
                }','${expense.money}')">Delete</button>
                </td>
            </tr>`
    )
    .join("");

  ["#money", "#expense", "#category"].forEach(
    (id) => (document.querySelector(id).value = "")
  );
};

const renderPagination = (currentPage, totalPages, limit) => {
  const pagination = document.querySelector("#pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.className = `px-4 py-2 rounded-md border text-sm transition font-medium ${
      i === currentPage
        ? "bg-indigo-600 text-white border-indigo-600"
        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
    }`;
    button.textContent = i;
    button.addEventListener("click", () => loadBudgetData(limit, i));
    pagination.appendChild(button);
  }
};

//function to buy premium membership
const buyPremiumButton = document.getElementById("buyPremiumButton");
buyPremiumButton?.addEventListener("click", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("AuthToken");
  const { data } = await axios.get(
    "https://expenses-app-ja1q.onrender.com/purchase/premiummembership",
    { headers: { Authorization: token } }
  );

  const options = {
    key: data.key_id,
    order_id: data.order.id,
    handler: async (response) => {
      await axios.post(
        "https://expenses-app-ja1q.onrender.com/purchase/updatetransactionstatus",
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );
      const premiumdiv = document.querySelector("#premiumDiv");
      premiumdiv.innerHTML = `<h3 class="text-2xl font-semibold text-gray-800 mb-4">Premium Features</h3>
    <p class="text-green-700 font-medium mb-4">🎉 You are a Premium User.</p>
   <div class="flex flex-col gap-4">
    <button 
      class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition" 
      id="leaderBoard" 
      onclick="fetchLeaderBoard()">
      Show Leaderboard
    </button>
    
  </div>`;
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();

  rzp1.on("payment.failed", async (res) => {
    await axios.post(
      "https://expenses-app-ja1q.onrender.com/purchase/updatefailedtransactionstatus",
      {
        order_id: res.error.metadata.order_id,
        payment_id: res.error.metadata.payment_id,
      },
      { headers: { Authorization: token } }
    );

    alert("Payment Failed!!!");
  });
});

//functions to check Premium Membership

const checkPremium = async () => {
  const token = localStorage.getItem("AuthToken");
  const ispremiumuser = await checkPremiumMembership(token);
  if (ispremiumuser) {
    const premiumdiv = document.querySelector("#premiumDiv");

    premiumdiv.innerHTML = `
    <h3 class="text-2xl font-semibold text-gray-800 mb-4">Premium Features</h3>
    <p class="text-green-700 font-medium mb-4">🎉 You are a Premium User.</p>
   <div class="flex flex-col gap-4" id="leaderboard">
    <button 
      class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition" 
      id="showleaderBoard" 
      onclick="fetchLeaderBoard()">
      Show Leaderboard
    </button>
    
  </div>`;
    document.getElementById("fileDownload").disabled = false;
  }
};

const checkPremiumMembership = async (token) => {
  const { data } = await axios.get(
    "https://expenses-app-ja1q.onrender.com/purchase/checkpremium",
    { headers: { Authorization: token } }
  );
  return data.ispremiumuser;
};

//function to delete Expense

const deleteExpense = async (expenseId, money) => {
  try {
    const userPreference = localStorage.getItem("expensesPerPage") || 5;
    const token = localStorage.getItem("AuthToken");

    const response = await axios.post(
      `https://expenses-app-ja1q.onrender.com/expense/deleteExpense/${expenseId}`,
      { money },

      {
        headers: { Authorization: token },
      }
    );
    if (response.status == 200) {
      // Remove the expense from the frontend
      document.getElementById(`expense-${expenseId}`)?.remove();
      fetchExpenses(1, userPreference);
    }
  } catch (error) {
    console.error("Error deleting expense:");
  }
};

const downloadfile = async () => {
  const token = localStorage.getItem("AuthToken");

  try {
    const { data } = await axios.get("https://expenses-app-ja1q.onrender.com/premium/download", {
      headers: { Authorization: token },
    });
    window.open(data, "_blank");
    showOldReports();
  } catch (error) {
    console.log("Something went wrong");
  }
};

const showOldReports = async () => {
  const token = localStorage.getItem("AuthToken");
  try {
    const { data } = await axios.get(
      "https://expenses-app-ja1q.onrender.com/premium/oldReports",
      {
        headers: { Authorization: token },
      }
    );

    const container = document.getElementById("reports-body");
    container.innerHTML = data
      .map(
        (file, index) => `
                <tr>
                <td>${index + 1}</td>
                <td>${trimUrl(file.key, 40)}</td>
                <td>${formatDateTime(file.createdAt)}</td>
                <td>
                <button class="text-center" onclick="downloadOldFiles('${file.key}')">
                <i class="fa fa-download"> Download
                </i>
                </button>
                </td>
            </tr>`
      )
      .join("");
  } catch (error) {}
};

const downloadOldFiles = async(key) => {
  const token = localStorage.getItem("AuthToken");
  try {
    const response = await axios.get(
      `https://expenses-app-ja1q.onrender.com/premium/downloadold/${encodeURIComponent(key)}`,
      {
        headers: { Authorization: token },
      });
       window.open(response.datafileUrl, "_blank");
  } catch (error) {
     alert("Download failed!");
    console.error(err);
  }

 
};

const trimUrl = (url, maxLength) => {
  if (url.length <= maxLength) {
    return url; // No trimming needed
  }
  const urlObject = new URL(url);
  const domain = urlObject.hostname; // Get the domain
  const path = urlObject.pathname; // Get the path part of the URL
  const trimmedPath =
    path.length > maxLength - domain.length - 3
      ? `${path.substring(0, maxLength - domain.length - 3)}...`
      : path;
  return `${domain}${trimmedPath}`;
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
