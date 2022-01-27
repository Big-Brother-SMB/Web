let inputSearch = document.getElementById('input');
let divResult = document.getElementById('suggestions');
let listForums = []
let mesForums = []

let divForums = document.getElementById('forums');

inputSearch.addEventListener('input', function(){
    let data = this.value;
    divResult.innerHTML = "";
    if (data.length) {
    let autoCompleteValues = autoComplete(data);
    autoCompleteValues.forEach(value => { addItem(value); });
    }
});

divResult.addEventListener('click', selectItem);

function autoComplete(inputValue) {
    return listForums.filter(
    (value) => value.toLowerCase().includes(inputValue.toLowerCase())
    );
}

function addItem(value) {
    divResult.innerHTML = divResult.innerHTML + `<p>${value}</p>`;
}

function selectItem({ target }) {
    if (target.tagName === 'P') {
        let forum = target.textContent;
        database.ref("users/" + user + "/forums/" + forum).set(0)
    
    }
}


database.ref("forums").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        listForums.push(child.key)
    });
});

database.ref("users/" + user + "/forums").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        mesForums.push(child.key)
        let bouton = document.createElement("button")
        bouton.innerHTML = child.key
        bouton.addEventListener('click', function(){
            sessionStorage.setItem("forum", child.key);
            window.location.href = "tchat.html";
        });
        divForums.appendChild(bouton);
    });
});



