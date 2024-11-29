//function to add expense to database
async function addExpenses(event) {
  event.preventDefault();

  const money = document.querySelector("#money").value;
  const expenseName = document.querySelector("#expense").value;
  const category = document.querySelector("#category").value;

  try {
    const token = localStorage.getItem("AuthToken");
    const response = await axios.post(
      "http://43.204.219.193:3000/expense/add",
      {
        money: money,
        expenseName: expenseName,
        category: category,
      },
      { headers: { Authorization: token } }
    );

    fetchExpenses(1);
  } catch (error) {
    console.log(error);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const expensesPerPageDropdown = document.getElementById('expensesPerPage');
  let userPreference = localStorage.getItem('expensesPerPage') || 10;

  // Set the dropdown to reflect the stored preference
  expensesPerPageDropdown.value = userPreference;

  // Fetch and display expenses based on the preference
  fetchExpenses(1, userPreference);

  // Update the preference when the user selects a new value
  expensesPerPageDropdown.addEventListener('change', () => {
      userPreference = expensesPerPageDropdown.value;
      localStorage.setItem('expensesPerPage', userPreference);
      fetchExpenses(1, userPreference); // Reload expenses with new limit
  });
});






//Function to display expenses
async function fetchExpenses(page=1,limit=10) {
  try {
    const token = localStorage.getItem("AuthToken");
    const response = await axios.get(
      "http:///43.204.219.193:3000/expense/getExpenses",
      {params:
      { 
      page:page,
      limit:limit,
      },
      headers: { Authorization: token } }
    );
    const data = response.data;
    renderExpenses(data.expenses);
    renderPagination(data.currentPage,data.totalPages,limit);
  } catch (error) {
    console.log("Error Fetching expenses".error);
  }
  
  
}

//function to fetching expenses from backend
function renderExpenses(expenses) {
  const container = document.getElementById("expense-table");
  //container.innerHTML='';
  container.innerHTML = `
    <table id="expenses-content" class="table table-striped table-bordered">
      <thead>
        <tr >
          <th scope="col">#</th>
          <th scope="col">Expense Name</th>
          <th scope="col">Money Spend</th>
          <th scope="col">Category of Expense</th>
          <th scope="col">Delete</th>
        </tr>
      <tbody id="expense-body">
      </tbody>
      
  ${expenses.map((expense, index) => `
            <tr id="expense-${expense.id}">
                <td>${index + 1}</td>
                <td>${expense.expenseName}</td>
                <td>${expense.money}</td>
                <td>${expense.category}</td>
                <td>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteExpense(${
                  expense.id
                },${expense.money})">
                <i class="fa fa-trash-alt">
                </i>
                </button>
                </td>
            </tr>
        `
    ).join("")}
    </tbody>
    </table>`
    ;
  
    document.querySelector("#money").value = "";
    document.querySelector("#expense").value = "";
    document.querySelector("#category").value = "";
}

function renderPagination(currentPage, totalPages,limit) {
  const pagination = document.querySelector('#pagination');
  pagination.innerHTML='';

  for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML+= `<button class="${i === currentPage ? 'btn btn-primary' : 'btn btn-secondary'} " onclick="fetchExpenses(${i},${limit})">${i}</button>`;
  }

}


//function to buy premium membership

async function buyPremium(e) {
  const token = localStorage.getItem("AuthToken");
  const response = await axios.get(
    "http://43.204.219.193:3000/purchase/premiummembership",
    { headers: { Authorization: token } }
  );

  const options = {
    key: response.data.key_id,
    order_id: response.data.order.id,
    handler: async function (response) {
      await axios.post(
        "http://43.204.219.193:3000/purchase/updatetransactionstatus",
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );
      const premiumdiv = document.querySelector("#buyPremium");
      const premiumButton = document.querySelector("#buyPremiumButton");
      premiumdiv.removeChild(premiumButton);
      premiumdiv.innerHTML = `<p>You are a Premium User.</p>
            <button class="btn btn-outline-info ml-2" id="leaderBoard" onclick="fetchLeaderBoard()">Show Leaderboard</button>
           
        `;
      const downloadBtn = document.getElementById("fileDownload");
      downloadBtn.disabled = false;
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();
  rzp1.on("payment.failed", async function (res) {
    await axios.post(
      "http://43.204.219.193:3000/purchase/updatefailedtransactionstatus",
      {
        order_id: res.error.metadata.order_id,
        payment_id: res.error.metadata.payment_id,
      },
      { headers: { Authorization: token } }
    );

    alert("Payment Failed!!!");
  });
}
//functions to check Premium Membership

async function checkPremium() {
  const token = localStorage.getItem("AuthToken");
  const ispremiumuser = await checkPremiumMembership(token);
  if (ispremiumuser) {
    const premiumdiv = document.querySelector("#buyPremium");
    const premiumButton = document.querySelector("#buyPremiumButton");
    premiumdiv.removeChild(premiumButton);
    premiumdiv.innerHTML = `<p>You are a Premium User.</p>
            <button class="btn btn-outline-info ml-2" id="leaderBoard" onclick="fetchLeaderBoard()">Show Leaderboard</button>
           
        `;
    const downloadBtn = document.getElementById("fileDownload");

    downloadBtn.disabled = false;
  }
}

async function checkPremiumMembership(token) {
  const status = await axios.get(
    "http://43.204.219.193:3000/purchase/checkpremium",
    { headers: { Authorization: token } }
  );
  return status.data.ispremiumuser;
}

//function to delete Expense

async function deleteExpense(expenseId, money) {
  try {
    const token = localStorage.getItem("AuthToken");

    const response = await axios.delete(
      `http://43.204.219.193:3000/expense/deleteExpense/${expenseId}`,

      {
        headers: { Authorization: token },
        params: { money: money },
      }
    );
    if (response.status == 200) {
      // Remove the expense from the frontend
      document.getElementById(`expense-${expenseId}`).remove();
    } else {
      const error = await response.json();
    }
  } catch (error) {
    console.error("Error deleting expense:");
   }
}

async function downloadfile() {
  const token = localStorage.getItem("AuthToken");
  try {
    const response = await axios.get("http://43.204.219.193:3000/premium/download", {
      headers: { Authorization: token },
    });
    window.open(response.data, "_blank");
  } catch (error) {
    console.log("Something went wrong");
  }
}

async function showOldReports() {
  const token = localStorage.getItem("AuthToken");
  try {
    const response = await axios.get(
      "http://43.204.219.193:3000/premium/oldReports",
      {
        headers: { Authorization: token },
      }
    );
    
    const data = response.data;
    const container = document.getElementById("reports-body");
    container.innerHTML = `${data
      .map(
        (urls, index) => `
                <tr>
                <td>${index + 1}</td>
                <td>${trimUrl(urls.fileUrl, 40)}</td>
                <td>${formatDateTime(urls.createdAt)}</td>
                <td>
                <button class="btn btn-outline-success btn-sm" onclick="downloadOldFiles('${
                  urls.fileUrl
                }')">
                <i class="fa fa-download">
                </i>
                </button>
                </td>
            </tr>
        `
      )
      .join("")}
        
        `;
  } catch (error) {
    console.log("Not able to find old reports");
    //alert("Not able to find old reports");
  }
}

function downloadOldFiles(fileUrl) {
  window.open(fileUrl, "_blank");
}

function trimUrl(url, maxLength) {
  if (url.length <= maxLength) {
    return url; // No trimming needed
  }
  const urlObject = new URL(url);
  const domain = urlObject.hostname; // Get the domain
  const path = urlObject.pathname; // Get the path part of the URL
  const trimmedPath =
    path.length > maxLength - domain.length - 3
      ? path.substring(0, maxLength - domain.length - 3) + "..."
      : path;
  return `${domain}${trimmedPath}`;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString(); // Localized date (e.g., "11/20/2024")
  const formattedTime = date.toLocaleTimeString(); // Localized time (e.g., "5:11:45 PM")
  return `${formattedDate} ${formattedTime}`;
}
//window.onload = checkPremium();
window.onload = fetchExpenses().then(checkPremium).then(showOldReports);
