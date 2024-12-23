console.log("Javascript Loaded")
document.getElementById('signupForm').addEventListener('submit',async(event)=>{
  event.preventDefault();
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#userpassword").value;
  const email = document.querySelector("#useremail").value;
  const errormsg = document.querySelector("#error");
  try {
    const response = await axios.post("https://hsexpensetracker.duckdns.org/expense/signup", {
      username: username,
      email: email,
      password: password,
    });
    if (response.status == 200) {
      document.getElementById("username").value = "";
      document.getElementById("userpassword").value = "";
      document.getElementById("useremail").value = "";
      // console.log("Signup successfull",response);
      window.location.assign('login.html');
    } else {
      //console.log("Signup failed", response.statusText);
      error.innerHTML = `"Signup failed",${response.status} `;
    }
  } catch (error) {
   // console.log("Error during signup:", error.response.data.message);
   console.log(error)
    errormsg.innerHTML = `<p style="font-size:20px ;color:red">Signup failed, ${error.response.data.message}</p> `;
  }
});



document.getElementById('loginForm').addEventListener('submit',async(event)=>{
  alert('hello');
  event.preventDefault();
  const password = document.querySelector("#loginpassword").value;
  const email = document.querySelector("#loginemail").value;
  const errormsg = document.querySelector("#error");
  try {
    const response = await axios.post("https://hsexpensetracker.duckdns.org/expense/login", {
      email: email,
      password: password,
    });
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



