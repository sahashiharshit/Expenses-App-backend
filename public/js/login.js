
document.getElementById('loginForm').addEventListener('submit',async(event)=>{
   
    event.preventDefault();
    const password = document.querySelector("#loginpassword").value;
    const email = document.querySelector("#loginemail").value;
    const errormsg = document.querySelector("#error");
    try {
      const response = await axios.post("http://localhost:3000/expense/login", {
        email: email,
        password: password,
      });
      console.log(response);
      if (response.status == 200) {
     
        localStorage.setItem('AuthToken',response.data.token);
        window.location.assign('expense.html');
      }
    } catch (error) {
   
      if (error.status == 401 || error.status == 404) {
        //console.log("Error during login:", error.response.data.message);
        errormsg.innerHTML = `<p style="font-size:20px ;color:red">Login failed, ${error.response.data.message}</p> `;
      } else {
        
        errormsg.innerHTML = `<p style="font-size:16px ;color:red">Login failed, ${error.response.data.message}</p> `;
      }
    }
  });
  
  
  
  