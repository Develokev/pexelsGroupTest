document.addEventListener("DOMContentLoaded", () => {
    //VARIABLES ++++++++++++++++++++++++++++++++++++++++

    const secCards = document.querySelector("#secCards");
    const searchForm = document.querySelector("#searchForm");
    const selPerPage = document.querySelector(".selPerPage");
    const txtSearch = document.querySelector("#txtSearch");
    const optFormato = document.querySelectorAll(".radioInputs");
    const divBotones = document.querySelector("#divBotones");
    const main = document.querySelector("main");

    const API = "bNMWPmSZ6gk732B9aDG3hAF52xANSaqqfvZ2MTJczcHgopWGGM7JhJGQ";
    const urlSearch = "https://api.pexels.com/v1/search?query=";
    const urlSingle = "https://api.pexels.com/v1/photos/";
    const arrayData = JSON.parse(localStorage.getItem("arrayData")) || [];


    //EVENTOS ++++++++++++++++++++++++++++++++++++++++++
    searchForm.addEventListener("click", (ev) => {
        //evento que envía el texto de búsqueda y compara
        if (ev.target.id == "submit") {
            ev.preventDefault();
            setSelected(txtSearch.value.replace(" ", "+"));
            resetForm();
        }
    });

    main.addEventListener("click", ({ target }) => {
        //Evento que filtra fotos por categorías

        if (target.matches("BUTTON")) {
            nextPage(target.textContent);

        } else if (target.parentNode.classList.contains("categoria")) {
            location.assign(
                "../html/filtered.html?categoria=" +
                target.parentNode.childNodes[0].textContent);

        } else if (target.parentNode.parentNode.classList.contains("categoria")) {
            location.assign(
                "../html/filtered.html?categoria=" +
                target.parentNode.parentNode.childNodes[0].textContent);

        } else if (target.parentNode.id) {
            location.assign("../html/singlePhoto.html?id=" + target.parentNode.id);

        } else if (target.parentNode.parentNode.id) {
            location.assign("../html/singlePhoto.html?id=" + target.parentNode.parentNode.id);
        }
    });

    //FUNCIONES +++++++++++++++++++++++++++++++++++++++



    //FUNCIONES SECUNDARIAS - LOCAL +++++++++++++++++++

    //Recupera del Local Storage
    const getLocal = () => JSON.parse(localStorage.getItem("arrayData")) || [];


    // Guarda en el Local Storage
    const setLocal = (url, categoria, totalPaginas) => {
        arrayData.splice(0);
        arrayData.push({ url, categoria, totalPaginas });
        localStorage.setItem("arrayData", JSON.stringify(arrayData));
    };



    //FUNCIONES SECUNDARIAS - DOM +++++++++++++++++++++

    //Borra el cuadro de texto del usuario
    const resetForm = () => txtSearch.value = "";


    //Trae el formato elegido por el usuario de imagen
    const getFormat = () => {
        //lo que devuelve el querySelectorALL, matchea y luego filtra.
        if (optFormato[0].checked) return "portrait";
        if (optFormato[1].checked) return "landscape";
        if (optFormato[2].checked) return "square";
    }; //usar ev change form


    //Trae la cantidad de imagenes por página elegido por el usuario
    const getPerPages = () => selPerPage.value;


    //Habilita o no los botones laterales
    const setSideButtons = () => {
        const btnSideLeft = document.querySelector('.btnAnt');
        const btnSideRigth = document.querySelector('.btnSig');
        const btnAnt = document.querySelector('#btnAnt');
        const btnSig = document.querySelector('#btnSig');

        btnSideLeft.disabled = btnAnt.disabled;
        btnSideRigth.disabled = btnSig.disabled;
    }



    //FUNCIONES SECUNDARIAS - EXTRAS ++++++++++++++++++

    //Prepara la url para almacenarla en el Local
    const urlFix = url => {
        const newArray = url.split('=');
        newArray.splice(newArray.length - 1);
        return newArray.join('=') + '=';
    }


    //Establece desde y hasta qué nros de botones se pintan 
    const getFromTo = (paginas, elegido) => {
        const cantMaxBotones = 5;
        if (paginas < cantMaxBotones) {
            desde = 1;
            hasta = paginas;
        } else if (paginas >= 10) {
            if (paginas - elegido <= 3) {
                desde = paginas - cantMaxBotones + 1;
                hasta = paginas;
            } else if (elegido > 4) {
                desde = elegido - 2;
                hasta = elegido + 2;
            } else {
                desde = 1;
                hasta = cantMaxBotones;
            }
        }
        return { desde, hasta };
    }



    //FUNCIONES PRINCIPALES +++++++++++++++++++++++++++++++

    //Realiza el fetch()
    const fetchCategory = async (categoria, url, foto) => {  //
        try {
            let peticion, urlFetch;
            
            if (categoria && url) {
                //Búsqueda para mostrar imagenes.
                peticion = await fetch(url, { headers: { authorization: API } });
                urlFetch = urlFix(url);
                
            } else if (categoria) {
                //Búsqueda para mostrar categorias.
                urlFetch = urlSearch + categoria +
                    `&orientation=${getFormat()}&per_page=${getPerPages()}&page=`;
                peticion = await fetch(urlFetch + 1,
                    { headers: { authorization: API } });

            } else {
                //Búsqueda para mostrar la foto grande.
                peticion = await fetch(urlSingle + foto,
                    { headers: { authorization: API } });

            }
            //peticion aqui

            if (peticion.ok) {
                const resp = await peticion.json();
                return {
                    ok: true,
                    respuesta: resp,
                    url: urlFetch
                };
            } else {
                throw {
                    ok: false,
                    respuesta: "error",
                    url: urlFetch
                };
            }
        } catch (error) {
            return error;
        }
    };


    //Recibe la información del fetch y la organiza - Categorías
    const getCategory = async (categoria) => {
        const { ok, respuesta } = await fetchCategory(categoria);

        if (ok) {
            let rnd = Math.floor(Math.random() * respuesta.per_page);
            secCards.append(paintCards(respuesta.photos[rnd], categoria));
        } else console.log("Error: getCategory.");
    };


    //Recibe la información del fetch y la organiza - Imagenes
    const getSelected = async (categoria, selected, urlFetch) => {
        const { ok, respuesta, url } = await fetchCategory(categoria, urlFetch);

        if (ok) {
            const fragmentPhotos = document.createDocumentFragment();
            secCards.innerHTML = "";

            respuesta.photos.forEach(item => fragmentPhotos.append(paintCards(item)));
            secCards.append(fragmentPhotos);

            const totalPaginas = Math.ceil(respuesta.total_results / respuesta.per_page);
            setLocal(url, categoria, totalPaginas)

            window.scrollTo(0, 0);
            createPageButtons(totalPaginas, selected)

            return totalPaginas;
        } else console.log("Error: getSelected.");
    };


    //Recibe la información del fetch y la organiza - Foto Grande
    const getPhoto = async (foto) => {
        const { ok, respuesta } = await fetchCategory(null, null, foto);

        if (ok) paintPhoto(respuesta);
        else console.log("Error: getPhoto.");
    };


    //Pinta las cards
    const paintCards = (objFoto, categoria) => {
        const divCard = document.createElement("DIV");

        let p1Linea = categoria;
        let p2Linea = objFoto.alt;
        let p3Linea = objFoto.photographer;

        divCard.classList.add("divCard");
        if (categoria) divCard.classList.add("categoria");
        else {
            divCard.id = objFoto.id;
            p1Linea = objFoto.alt;
            p2Linea = objFoto.photographer;
            p3Linea = objFoto.photographer_url;
        }

        const pCard = document.createElement("P");
        pCard.textContent = p1Linea;

        const imgCard = document.createElement("IMG");
        imgCard.src = objFoto.src.medium;
        imgCard.alt = objFoto.alt;

        const pTitulo = document.createElement("P");
        pTitulo.textContent = p2Linea;

        const pAutor = document.createElement("P");
        pAutor.textContent = p3Linea;

        divCard.append(pCard, imgCard, pTitulo, pAutor);
        return divCard;
    };


    //Trae la siguiente página
    const nextPage = (pagina) => {
        const btnSelected = document.querySelector('.selected');
        const arrayData = getLocal();
        let url = arrayData[0].url
        let nro;

        if (pagina == '>>') {
            nro = parseInt(btnSelected.textContent) + 1;
            url += nro;
        } else if (pagina == '<<') {
            nro = parseInt(btnSelected.textContent) - 1;
            url += nro;
        } else {
            url += pagina;
            nro = pagina;
        }

        getSelected(arrayData[0].categoria, nro, url)
    }


    //Pinta la foto en grande
    const paintPhoto = (objFoto) => {
        const divCard = document.createElement("DIV");
        divCard.classList.add("singlePhoto");

        const pCard = document.createElement("P");
        pCard.textContent = objFoto.alt;

        const imgCard = document.createElement("IMG");
        imgCard.src = objFoto.src.large;
        imgCard.alt = objFoto.alt;

        const pTitulo = document.createElement("P");
        pTitulo.textContent = objFoto.photographer;

        const pAutor = document.createElement("P");
        pAutor.textContent = objFoto.photographer_url;

        divCard.append(pCard, imgCard, pTitulo, pAutor);
        main.append(divCard);
    };


    //Crea los botones de las páginas
    const createPageButtons = (paginas, btnElegido) => {
        const fragment = document.createDocumentFragment();
        const elegido = parseInt(btnElegido);

        const { desde, hasta } = getFromTo(paginas, elegido);
        let i;

        if (paginas > 1) {
            for (i = desde; i <= hasta; i++) {
                const btnPaginas = document.createElement("BUTTON");
                btnPaginas.textContent = i;
                if (i == elegido) btnPaginas.classList.add('selected')
                fragment.append(btnPaginas);
            }
            divBotones.innerHTML = "";

            const btnAnt = document.createElement("BUTTON");
            if (elegido == 1) btnAnt.disabled = true;
            btnAnt.id = 'btnAnt';
            btnAnt.textContent = '<<';
            fragment.prepend(btnAnt);

            const btnSig = document.createElement("BUTTON");
            if (elegido == i - 1) btnSig.disabled = true;
            btnSig.id = 'btnSig'
            btnSig.textContent = '>>';
            fragment.append(btnSig);

            divBotones.append(fragment);
            setSideButtons();
        } else {
            divBotones.innerHTML = "";
        }
    };


    //Carga la primera página de las imagenes elegidas
    const setSelected = async (categoria) => {
        const paginas = await getSelected(categoria, 1);
    };


    //Carga las categorías
    const setCategories = (...categorias) => {
        categorias.forEach((categoria) => getCategory(categoria));
    };


    //INIT
    const init = () => {
        //Función inicializadora, resetea el formulario, y pinta las categorías en primera instancia
        const url = location.search;
        const params = new URLSearchParams(url);

        resetForm();
        if (params.has("categoria")) setSelected(params.get("categoria"))
        else if (params.has("id")) getPhoto(params.get("id"));
        else setCategories("Baby", "Food", "Car");
    };

    init();
}); //Load
