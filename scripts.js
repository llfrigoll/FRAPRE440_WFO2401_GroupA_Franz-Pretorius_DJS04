import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books

const starting = document.createDocumentFragment()

for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
    const element = tileCreation(author, id, image, title)//Usage of tile creation
    starting.appendChild(element)
}

document.querySelector('[data-list-items]').appendChild(starting)

//The creation of a tile is used in multiple places so I created a function to handle it
function tileCreation(author, id, image, title) {
    const element = document.createElement('button')
    element.classList = 'preview'
    element.setAttribute('data-preview', id)

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `
    return element
}

//The code for generating html for genres and authors were very similar and therefore refactored their code into one function
//splitting up the creation using a parameter called datatype
function createFilterHtml(datatype) { //datatype is in this case genres or authors
    const datatypeHtml = document.createDocumentFragment()
    const firstDatatypeElement = document.createElement('option')
    firstDatatypeElement.value = 'any'
    firstDatatypeElement.innerText = datatype === 'genres' ? 'All Genres' : 'All Authors'
    datatypeHtml.appendChild(firstDatatypeElement)

    for (const [id, name] of Object.entries(datatype === 'genres' ? genres : authors)) {
        const element = document.createElement('option')
        element.value = id
        element.innerText = name
        datatypeHtml.appendChild(element)
    }

    document.querySelector(`[data-search-${datatype}]`).appendChild(datatypeHtml)
}

createFilterHtml('genres')//Usage of createFilterHtml with each parameter
createFilterHtml('authors')//Usage of createFilterHtml with each parameter

//Code for setting themes is used multiple times, this function gives correct output using the parameter as either day or night
function themeCheck(dayOrNightValue) { //value is either 'day' or 'night'
    document.documentElement.style.setProperty(dayOrNightValue === 'night' ? '--color-dark' : '--color-light', '255, 255, 255');
    document.documentElement.style.setProperty(dayOrNightValue === 'night' ? '--color-light' : '--color-dark', '10, 10, 20');
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night'
    themeCheck('night')//Usage of themeCheck function
} else {
    document.querySelector('[data-settings-theme]').value = 'day'
    themeCheck('day')//Usage of themeCheck function
}

document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0

document.querySelector('[data-list-button]').innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`

document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    themeCheck(theme)//Usage of themeCheck function
    
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = tileCreation(author, id, image, title)//Usage of tile creation
        newItems.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(newItems)

    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = tileCreation(author, id, image, title)//Usage of tile creation
        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

//Creation of template element
const template = document.createElement('template');

//Setting the innerhtml of the template element
template.innerHTML = `
    <style>
    .overlay {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        border-width: 0;
        box-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12);
        animation-name: enter;
        animation-duration: 0.6s;
        z-index: 10;
        background-color: rgba(var(--color-light), 1);
      }
      
      @media (min-width: 30rem) {
        .overlay {
          max-width: 30rem;
          left: 0%;
          top: 0;
          border-radius: 8px;;
        }
      }
      
      .overlay__form {
        padding-bottom: 0.5rem;
        margin: 0 auto;
      }
      
      .overlay__row {
        display: flex;
        gap: 0.5rem;
        margin: 0 auto;
        justify-content: center;
      }
      
      .overlay__button {
        font-family: Roboto, sans-serif;
        background-color: rgba(var(--color-blue), 0.1);
        transition: background-color 0.1s;
        border-width: 0;
        border-radius: 6px;
        height: 2.75rem;
        cursor: pointer;
        width: 50%;
        color: rgba(var(--color-blue), 1);
        font-size: 1rem;
        border: 1px solid rgba(var(--color-blue), 1);
      }
      
      .overlay__button_primary {
        background-color: rgba(var(--color-blue), 1);
        color: rgba(var(--color-force-light), 1);
      }
      
      .overlay__button:hover {
        background-color: rgba(var((var(--color-blue))), 0.2);
      }
      
      
      .overlay__button_primary:hover {
        background-color: rgba(var(--color-blue), 0.8);
        color: rgba(var(--color-force-light), 1);
      }
      
      .overlay__input {
        width: 100%;
        margin-bottom: 0.5rem;
        background-color: rgba(var(--color-dark), 0.05);
        border-width: 0;
        border-radius: 6px;
        width: 100%;
        height: 4rem;
        color: rgba(var(--color-dark), 1);
        padding: 1rem 0.5rem 0 0.75rem;
        font-size: 1.1rem;
        font-weight: bold;
        font-family: Roboto, sans-serif;
        cursor: pointer;
      }
      
      .overlay__input_select {
        padding-left: 0.5rem;
      }
      
      .overlay__field {
        position: relative;
        display: block;
      }
      
      .overlay__label {
        position: absolute;
        top: 0.75rem;
        left: 0.75rem;
        font-size: 0.85rem;
        color: rgba(var(--color-dark), 0.4);
      }
      
      .overlay__input:hover {
        background-color: rgba(var(--color-dark), 0.1);
      }
      
      .overlay__title {
        padding: 1rem 0 0.25rem;
        font-size: 1.25rem;
        font-weight: bold;
        line-height: 1;
        letter-spacing: -0.1px;
        max-width: 25rem;
        margin: 0 auto;
        color: rgba(var(--color-dark), 0.8)
      }
      
      .overlay__blur {
        width: 100%;
        height: 200px;
        filter: blur(10px);
        opacity: 0.5;
        transform: scale(2);
      }
      
      .overlay__image {
        max-width: 10rem;
        position: absolute;
        top: 1.5m;
        left: calc(50% - 5rem);
        border-radius: 2px;
        box-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12);
      }
      
      .overlay__data {
        font-size: 0.9rem;
        display: -webkit-box;
        -webkit-line-clamp: 6;
        -webkit-box-orient: vertical;  
        overflow: hidden;
        color: rgba(var(--color-dark), 0.8)
      }
      
      .overlay__data_secondary {
        color: rgba(var(--color-dark), 0.6)
      }
      
      .overlay__content {
        padding: 2rem 1.5rem;
        text-align: center;
        padding-top: 3rem;
      }
      
      .overlay__preview {
        overflow: hidden;
        margin: -1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .overlay__background {
        background: rgba(var(--color-dark), 0.6);
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
      }
    </style>

    <dialog class="overlay" data-list-active>
        <div class="overlay__preview"><img class="overlay__blur" data-list-blur src=""/><img class="overlay__image" data-list-image src=""/></div>
        <div class="overlay__content">
            <h3 class="overlay__title" data-list-title></h3>
            <div class="overlay__data" data-list-subtitle></div>
            <p class="overlay__data overlay__data_secondary" data-list-description></p>
        </div>

        <div class="overlay__row">
            <button class="overlay__button overlay__button_primary" data-list-close>Close</button>
        </div>
    </dialog>
`

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }

    //Grabbing of cusom element from DOM
    let host = document.getElementsByTagName('book-preview')
    
    if (active) {
        //Use shadowRoot queryselector to set attributes
        host[0].shadowRoot.querySelector('[data-list-close]').addEventListener('click', () => {
            host[0].shadowRoot.querySelector('[data-list-active]').open = false
        })

        host[0].shadowRoot.querySelector('[data-list-active]').open = true
        host[0].shadowRoot.querySelector('[data-list-blur]').src = active.image
        host[0].shadowRoot.querySelector('[data-list-image]').src = active.image
        host[0].shadowRoot.querySelector('[data-list-title]').innerText = active.title
        host[0].shadowRoot.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        host[0].shadowRoot.querySelector('[data-list-description]').innerText = active.description
    }
})

//Definition of custom element 
customElements.define(
    "book-preview",

    class bookPreview extends HTMLElement {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(template.content.cloneNode(true));
      }
    },
);

