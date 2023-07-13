export async function init(common){
    document.getElementById("user").innerHTML = common.first_name + " " + common.last_name

    document.getElementById("classe").innerHTML = common.classe

    let textScore = ""
    let score = await common.socketAsync("score",null)
    if (score <2) {
        textScore = score + " pt"
    }else{
        textScore = score + " pts"
    }
    document.getElementById("score").innerHTML = textScore
}