const addAchado = document.querySelector('#addAchado');
const aHome = document.querySelector('#aHome')

function aoSairButton() {
  addAchado.style.height = "50px";
  addAchado.style.width = "120px";
}
function aoSairLink(){
  aHome.style.fontSize = "larger"; 
}

addAchado.addEventListener('mouseout', aoSairButton);
aHome.addEventListener('mouseout', aoSairLink)