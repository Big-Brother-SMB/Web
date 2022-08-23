
/* inspired by Web Dev Simplified */

const overlay = document.getElementById('overlay')

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

database.ref("users/" + user + "/tuto").once("value", function(snapshot) {
    tuto = snapshot.val()
    if(tuto != true){
      const modal = document.getElementById('modal')
      openModal(modal)
    }
})
