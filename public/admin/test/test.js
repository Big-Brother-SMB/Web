/*function sendEmail() {
Email.send({
    Host : "smtp.mailtrap.io",
    Username : "b367ca08f2d1e5",
    Password : "8cee83bf79647c",
    To : 'matthias.hayart@gmail.com',
    From : "sender@example.com",
    Subject : "Test email",
    Body : "<html><h2>Header</h2><strong>Bold text</strong><br></br><em>Italic</em></html>"
}).then(
  message => alert(message)
);
}*/

function sendEmail() {
  for(let i = 0; i < 10; i++){
    Email.send({
      Host: "smtp.gmail.com",
      Username: "foyer.beaucamps@gmail.com",
      Password: "beaucamps",
      To: 'matthias.hayart@gmail.com',
      From: "foyer.beaucamps@gmail.com",
      Subject: "msg" + i,
      Body: "Well that was easy!!",
    })
      .then(function (message) {
        alert("mail sent successfully" + i)
      });

    }
  }
    