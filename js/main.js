document.addEventListener("DOMContentLoaded", () => {

    //VARIABLES ++++++++++++++++++++++++++++++++++++++++

    const secCards = document.querySelector("#secCards");
    const searchForm = document.querySelector("#searchForm");
    const selPerPage = document.querySelector('#selPerPage');
    const txtSearch = document.querySelector('#txtSearch');
    const optFormato = document.querySelectorAll('#searchForm input[name="formato"]');
    const divBotones = document.querySelector('#divBotones');

    const API = "bNMWPmSZ6gk732B9aDG3hAF52xANSaqqfvZ2MTJczcHgopWGGM7JhJGQ";
    const urlSearch = "https://api.pexels.com/v1/search?query=";

    //EVENTOS ++++++++++++++++++++++++++++++++++++++++++
    searchForm.addEventListener('click', ev => {
        if (ev.target.id == 'submit') {
            ev.preventDefault();
            setSelected(txtSearch.value.replace(' ', '+'));
            resetForm();
        }
    })

    secCards.addEventListener('click', ({ target }) => {
        if (target.classList.contains('categoria')) {
            setSelected(target.childNodes[0].textContent)
        } else if (target.parentNode.classList.contains('categoria')) {
            setSelected(target.parentNode.childNodes[0].textContent)
        }
    })

    divBotones.addEventListener('click', ({ target }) => {
        if (target.matches('BUTTON')) {

        }
    })

    //FUNCIONES +++++++++++++++++++++++++++++++++++++++

    const resetForm = () => {
        txtSearch.value = '';
        // optFormato[2].checked = true;
    }

    const paintCards = (objFoto, categoria) => {
        const divCard = document.createElement("DIV");

        let p1Linea = categoria;
        let p2Linea = objFoto.alt;
        let p3Linea = objFoto.photographer;

        divCard.classList.add("divCard");
        if (categoria) divCard.classList.add("categoria");
        else {
            divCard.classList.add(objFoto.id);
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


    const getFormat = () => {
        if (optFormato[0].checked) return 'portrait';
        if (optFormato[1].checked) return 'landscape';
        if (optFormato[2].checked) return 'square';
    }


    const getPerPages = () => {
        console.log(selPerPage)
        return selPerPage.value;
    }

    const fetchCategory = async (categoria) => {
        try {
            const peticion = await fetch(urlSearch + categoria +
                `&orientation=${getFormat()}&per_page=${getPerPages()}&page=1`,
                { headers: { authorization: API } });

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
            return error;
        }
    };


    const getSelected = async (categoria) => {
        const { ok, respuesta } = await fetchCategory(categoria);

        if (ok) {
            const fragmentPhotos = document.createDocumentFragment();
            secCards.innerHTML = '';

            respuesta.photos.forEach(item => fragmentPhotos.append(paintCards(item)));
            secCards.append(fragmentPhotos);
            return Math.floor(respuesta.total_results / respuesta.per_page);
        } else {
            console.log('Error: getSelected.');
        }
    }

    const getCategory = async (categoria) => {
        const { ok, respuesta } = await fetchCategory(categoria);

        if (ok) {
            let rnd = Math.floor(Math.random() * respuesta.per_page);
            secCards.append(paintCards(respuesta.photos[rnd], categoria));
        } else {
            console.log("Error: getCategory.");
        }
    }

    const createPageButtons = paginas => {
        const fragment = document.createDocumentFragment();
        let cantBotones = 6;

        if (paginas > 1) {
            if (paginas < cantBotones) cantBotones = paginas;
            for (let i = 1; i <= cantBotones; i++) {
                const btnPaginas = document.createElement("BUTTON");
                btnPaginas.textContent = i;
                fragment.append(btnPaginas);
            }
            divBotones.innerHTML = '';
            const pBotones = document.createElement("P");
            pBotones.textContent = `... ${paginas} Pages.`
            fragment.append(pBotones);
            divBotones.append(fragment);
        } else {
            divBotones.innerHTML = '';
        }
    }

    const setSelected = async (categoria) => {
        const paginas = await getSelected(categoria);
        createPageButtons(paginas);
    }

    const setCategories = (...categorias) => {
        categorias.forEach(categoria => {
            getCategory(categoria);
        })
    }

    //INIT
    const init = () => {
        resetForm();
        setCategories('Trees', 'Beach', 'Cars');
    };

    init();
}); //Load
