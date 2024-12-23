const token = new URLSearchParams(window.location.search).get('token');


async function verify(token) {
    try {
        const response = await axios.get(`https://hsexpensetracker.duckdns.org/password/verify-token/${token}`);
        
                
        
    } catch (error) {
    
        if (error.status===404){
            document.getElementById('resetPasswordForm').style.display='none';
            document.getElementById('expiredLink').innerHTML=`Link Expired!! 
            <a href="https://hsexpensetracker.duckdns.org/views/login.html">click here to go to login page</a> `;
            }
       
    }
    
}
verify(token);
    
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
try {
 
    const response = await axios.post('https://hsexpensetracker.duckdns.org/password/reset-password', {
        token:token,
        password:newPassword 
        });
    

    const data = response.data;
    alert(data.message);
       window.location.assign('views/login.html');
} catch (error) {
    alert(error);
}
});
