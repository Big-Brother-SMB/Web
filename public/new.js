//https://developer.mozilla.org/fr/docs/Web/API/Notifications_API/Using_the_Notifications_API
//https://mailtrap.io/blog/javascript-send-email/

Notification.requestPermission().then(function(result) {
    console.log(result);
  });