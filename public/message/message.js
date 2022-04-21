

database.ref("sondages").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        database.ref("sondages/" + child.key + "/" + user).once('value').then(function(snapshot) {
            if(snapshot.val() != null){
                
            }
        })
    })
})












charged(true)