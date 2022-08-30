function loopT(){
    registration.showNotification('10 sec');
    setTimeout(loopT,10000)
}

loopT()