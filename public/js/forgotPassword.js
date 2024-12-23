async function forgotPassword(event) {
  event.preventDefault();
  const email = document.querySelector("#email").value;
  try {
    const response = await axios.post(
      "https://hsexpensetracker.duckdns.org/password/forgotpassword",
      {
        email: email,
      }
    );
   // console.log(response);
    alert("Mail Sent Successfully");
    document.querySelector("#email").value="";
  } catch (error) {
  
    if (error.status === 404) {
      alert(error.response.data.message);
    } else {
      alert("error in sending email try again");
    }
  }
}
