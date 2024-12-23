
async function fetchLeaderBoard() {
    
    try {
    console.log("geting til here")
        const response = await axios.get("https://hsexpensetracker.duckdns.org/premium/showleaderboard");
        console.log(response);
        displayBoard(response.data);
    } catch (error) {
                
        console.log('Error fetching leaderboard:');     
        const leaderboardDiv = document.getElementById('leaderboard');
        leaderboardDiv.innerHTML=`${error.response.data.message}`;
    }
}

function displayBoard(data){
    console.log("in display method")
    const leaderboardDiv = document.getElementById('leaderboard');
    console.log(leaderboardDiv)
    leaderboardDiv.innerHTML = `
    <h2 class="text-center" >Leader Board</h2>
    <table class="table table-hover">
        <thead>
            <tr>
                <th scope="col">Rank</th>
                <th scope="col">User</th>
                <th scope="col">Total Expenses</th>
            </tr>
        </thead>
        <tbody>
            ${data
                .map(
                    (user,index) => `
                <tr>
                    <th scope="row">${index+1}</th>
                    <td>${user.username}</td>
                    <td>${user.totalExpenses}</td>
                </tr>
            `
                )
                .join('')}
        </tbody>
    </table>`;
}



