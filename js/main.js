document.addEventListener("DOMContentLoaded", () => {
  //VARIABLES ++++++++++++++++++++++++++++++++++++++++

  const secCards = document.querySelector("#secCards");
  const searchForm = document.querySelector("#searchForm");
  const fragment = document.createDocumentFragment();

  const API = "bNMWPmSZ6gk732B9aDG3hAF52xANSaqqfvZ2MTJczcHgopWGGM7JhJGQ";

  const urlSearch = "https://api.pexels.com/v1/search?query=";
  //EVENTOS ++++++++++++++++++++++++++++++++++++++++++
secCards.addEventListener('click', ({target}) => {  
    if(target.parentNode.classList.contains('categoria')) {
      getSelected(target.parentNode.childNodes[0].textContent)
      console.log(target.parentNode.childNodes[0].textContent)
    }
})

  //FUNCIONES +++++++++++++++++++++++++++++++++++++++

  const paintCards =  (objFoto, categoria) => {
    const divCard = document.createElement("DIV");
    let p1Linea=categoria;
    let p2Linea=objFoto.alt;
    let p3Linea=objFoto.photographer;

    divCard.classList.add("divCard");
    if (categoria){
      divCard.classList.add("categoria");
    } else {
      divCard.classList.add(objFoto.id);
      p1Linea=objFoto.alt;
       p2Linea=objFoto.photographer;
       p3Linea=objFoto.photographer_url;
    }

    const pCard = document.createElement("P");
    pCard.textContent = p1Linea;

    const imgCard = document.createElement("IMG");
    imgCard.src = objFoto.src.small;
    imgCard.alt = objFoto.alt;

    const pTitulo = document.createElement("P");
    pTitulo.textContent = p2Linea;

    const pAutor = document.createElement("P");
    pAutor.textContent = p3Linea;

    divCard.append(pCard, imgCard, pTitulo, pAutor);
    return divCard;
  };

  const fetchCategory = async (categoria) => {
    try {
      const peticion = await fetch(urlSearch + categoria, {
        headers: { authorization: API },
      });

      if (peticion.ok) {
        const resp = await peticion.json();
        return {
          ok: true,
          respuesta: resp,
        };
      } else {
        throw {
          ok: false,
          respuesta: "error",
        };
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCategory = async (categoria) => {
    const { ok, respuesta } = await fetchCategory(categoria);

    if (ok) {
      let rnd = Math.floor(Math.random() * respuesta.per_page);
      secCards.append(paintCards(respuesta.photos[rnd], categoria));      
    } else {
      console.log("error");
    }
  };

  const getSelected = async (categoria) => {
    const { ok, respuesta:{photos} } = await fetchCategory(categoria);
    
    if(ok) {
      console.log(photos);
        const fragmentPhotos=document.createDocumentFragment();
        secCards.innerHTML='';
        photos.forEach((item) => {
          fragmentPhotos.append((paintCards(item)));
        })
        secCards.append(fragmentPhotos);
    }
  }

  //INIT
  const init = () => {
    getCategory("nature");
    getCategory("cars");
    getCategory("animals");
  };

  init();
}); //Load
