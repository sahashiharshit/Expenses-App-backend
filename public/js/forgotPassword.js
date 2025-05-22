document.getElementById('forgot-password-form').addEventListener('submit',async(event)=>{
  event.preventDefault();
  const email = document.querySelector("#email").value;
  try {
    const response = await axios.post(
      "https://expenses-app-ja1q.onrender.com/password/forgotpassword",
      {
        email: email,
      }
    );
    if (response.status === 201) {
      alert("Email Sent Successfully");
      document.querySelector("#email").value="";
    }
      } catch (error) {
  
    if (error.status === 404) {
      alert(error.response.data.message);
    } else {
      alert("error in sending email try again");
    }
  }


});
  
