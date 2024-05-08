export async function init(common){

var images = {
    "1": "images_jeu/exemple.jpg",
    "2": "",
    "3": ""
  };
  
  function changeImage() {
    var select = document.getElementById("jeuSelect");
    var displayImage = document.getElementById("displayImage");
    
    if (select.value) {
      displayImage.src = images[select.value];
      displayImage.style.display = "block";

      localStorage.setItem("selectedImageId", select.value);
    } else {
      displayImage.style.display = "none";
    }
  }
}