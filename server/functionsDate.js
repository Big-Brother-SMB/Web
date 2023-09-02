Date.prototype.getWeek = function() {
  let now = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  let firstSept = new Date(now.getFullYear(), 8, 4);

  if(now.getTime()+7*86400000<firstSept.getTime()){
    firstSept = new Date(now.getFullYear()-1, 8, 4);
  }

  let diff = now - firstSept
  //diff en ms, prenant compte du décalage de jour de la semaine
  diff = diff + firstSept.getDay() * 86400000 - now.getDay() *86400000
  //diff en jour
  diff = diff/86400000
  //diff en semaine
  diff = diff/7
  if(now.getDay()==0) diff-=1
  return parseInt(diff+1)
}

module.exports = class funcDate{
  static get actualWeek(){
    return new Date().getWeek();
  }

  static today(){
    let date = new Date()
    let today = date.getTime()
                -date.getHours()*3600000
                -date.getMinutes()*60000
                -date.getSeconds()*1000
    return new Date(today);
  }
  
  static generedDate(week,jour,h,min,s){
    let nowDate = new Date()
    let jourActuel = nowDate.getDay();
    if (jourActuel==0) jourActuel=7
    if (jour==0) jour=7
    let date_in_ms=(Date.now()+604800000*(week - this.actualWeek))-(jourActuel-jour)*86400000;
    date_in_ms+= (h-nowDate.getHours())*3600000 + (min-nowDate.getMinutes())*60000 + (s-nowDate.getSeconds())*1000
    return new Date(date_in_ms);
  }
}
