const fetchLeaderBoard = async () => {
  try {
    const { data } = await axios.get(
      "http://localhost:3000/premium/showleaderboard"
    );
    
    displayBoard(data);
    document.getElementById("showleaderboard").classList.add("hidden");
  } catch (error) {
    const leaderboardDiv = document.getElementById("leaderboard");
    leaderboardDiv.innerHTML = `${error.data.message}`;
  }
};

const displayBoard = (data) => {
  const leaderboardDiv = document.getElementById("leaderboard");

  leaderboardDiv.innerHTML = `
    <h2 class="text-2xl font-bold text-center mb-4" >Leader Board</h2>
    <div class="overflow-x-auto">
    <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th scope="col" class="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th scope="col" class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Expenses</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
            ${data
              .map(
                (user, index) => `
                <tr class="hover:bg-gray-50 transition">
                    <td scope="row" class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">${
                      index + 1
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${
                      user.username
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">₹${
                      user.totalSpent
                    }</td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table></div>`;
};
