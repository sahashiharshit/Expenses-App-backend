console.log("Javascript Loaded")
document.getElementById('signupForm').addEventListener('submit',async(event)=>{
  event.preventDefault();
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#userpassword").value;
  const email = document.querySelector("#useremail").value;
  const errormsg = document.querySelector("#error");
  try {
    const response = await axios.post("http://localhost:3000/expense/signup", {
      username: username,
      email: email,
      password: password,
    });
    console.log(response);
    if (response.status == 200) {
      document.getElementById("username").value = "";
      document.getElementById("userpassword").value = "";
      document.getElementById("useremail").value = "";
      // console.log("Signup successfull",response);
      window.location.href = "/views/login.html";
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


