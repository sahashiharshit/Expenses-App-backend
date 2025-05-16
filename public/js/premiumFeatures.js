
const fetchLeaderBoard=async()=> {
    
    try {
    
        const {data} = await axios.get("http://localhost:3000/premium/showleaderboard");
        
        displayBoard(data);
    } catch (error) {
                
        
        const leaderboardDiv = document.getElementById('leaderboard');
        leaderboardDiv.innerHTML=`${error.data.message}`;
    }
}

const displayBoard=data=>{
   
    const leaderboardDiv = document.getElementById('leaderboard');
    
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
                    <td>${user.totalexpenses}</td>
                </tr>
            `
                )
                .join('')}
        </tbody>
    </table>`;
}



