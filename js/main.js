const CONTACTS_API = 'http://localhost:8000/contacts';

// inputs
let nameInp = document.querySelector('#name-inp');
let surnameInp = document.querySelector('#surname-inp');
let numberInp = document.querySelector('#number-inp');


let addBtn = document.querySelector('#add-btn');
addBtn.addEventListener('click', createContact);

async function createContact(e) {
    e.preventDefault();
    if(
        !nameInp.value.trim() ||
        !surnameInp.value.trim() ||
        !numberInp.value.trim()
    ) {
        alert('Some inputs are empty');
        return;
    }

    let contactObj = {
        name: nameInp.value,
        surname: surnameInp.value,
        tel: numberInp.value 
    };

    await fetch(CONTACTS_API, {
        method: 'POST',
        body: JSON.stringify(contactObj),
        headers: {
            "Content-Type": "application/json; charset=utf-8" 
        }
    })

    nameInp.value = '';
    surnameInp.value = '';
    numberInp.value = '';

    render();    
};

let currentPage = 1;
let search = '';

async function render() {
    let container = document.querySelector('.container');
    container.innerHTML = '';

    let requestAPI = `${CONTACTS_API}?q=${search}&_page=${currentPage}&_limit=4`

    let res = await fetch(requestAPI);
    let data = await res.json();

    data.forEach(item => {
        container.innerHTML += `
            <div class="card" style="width: 18rem">
                <div class="card-body">
                <img
                    src="./image/ava.png"
                    class="card-img-top"
                    alt="..."
                    width="100px"
                    height="220px"
                />
                <p class="card-text"><b>${item.name}</b></p>
                <p class="card-text">
                    <b>${item.surname}</b>
                </p>
                <p class="card-text phone">${item.tel}</p>
                <button class="btn btn-danger btn-delete" id="${item.id}">DELETE</button>
                <button class="btn btn-primary btn-update" id="${item.id}" data-bs-toggle="modal"
                data-bs-target="#staticBackdrop">UPDATE</button>
                </div>
            </div>
        `
    });

    if(data.lenght === 0) {
        return;
    };

    addDeleteEvent();
    addUpdateEvent();
};

render();

// delete

async function deleteContact(e) {
    let contactId = e.target.id;

    await fetch(`${CONTACTS_API}/${contactId}`, {
        method: 'DELETE'
    });

    render();
}

function addDeleteEvent() {
    let deleteContactBtn = document.querySelectorAll('.btn-delete');
    deleteContactBtn.forEach(item => item.addEventListener('click', deleteContact));
};

// update

let saveChangesBtn = document.querySelector('.save-changes-btn');

function checkAddAndSaveBtn() {
    if(saveChangesBtn.id) {
        addBtn.setAttribute('style', 'display: none;');
        saveChangesBtn.setAttribute('style', 'display: block;');
    } else {
        addBtn.setAttribute('style', 'display: block;');
        saveChangesBtn.setAttribute('style', 'display: none;');
    }
};

checkAddAndSaveBtn();

async function updateContact(e) {
    let contactId = e.target.id;
    let res = await fetch(`${CONTACTS_API}/${contactId}`)
    let contactObj = await res.json();

    nameInp.value = contactObj.name;
    surnameInp.value = contactObj.surname;
    numberInp.value = contactObj.tel;

    saveChangesBtn.setAttribute('id', contactObj.id);
    checkAddAndSaveBtn();
}

function addUpdateEvent() {
    let updateContactBtn = document.querySelectorAll('.btn-update');
    updateContactBtn.forEach(item => item.addEventListener('click', updateContact));
};

async function saveChanges(e) {
    let updatedContactObj = {
        id: e.target.id,
        name: nameInp.value,
        surname: surnameInp.value,
        tel: numberInp.value
    };

    await fetch(`${CONTACTS_API}/${e.target.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedContactObj),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });

    nameInp.value = '';
    surnameInp.value = '';
    numberInp.value = '';

    saveChangesBtn.removeAttribute('id');

    checkAddAndSaveBtn();
    render();
} 

saveChangesBtn.addEventListener('click', saveChanges);

// search

let searchInp = document.querySelector('#search-inp');
searchInp.addEventListener('input', () => {
    search = searchInp.value;
    currentPage = 1;
    render();
});

// pagination
let nextPage = document.querySelector('#next-page');
let prevPage = document.querySelector('#prev-page');

async function checkPages() {
    let res = await fetch(CONTACTS_API);
    let data = await res.json();
    let pages = Math.ceil(data.length / 4);

    if(currentPage === 1) {
        prevPage.style.display = 'none';
        nextPage.style.display = 'block';
    } else if (currentPage === pages) {
        prevPage.style.display = 'block';
        nextPage.style.display = 'none';
    } else {
        prevPage.style.display = 'block';
        nextPage.style.display = 'block';
    };
};

checkPages();

prevPage.addEventListener('click', () => {
    currentPage--;
    render();
    checkPages();
});

nextPage.addEventListener('click', () => {
    currentPage++;
    render();
    checkPages();
});

// home
let homeBtn = document.querySelector('#home-btn');
homeBtn.addEventListener('click', () => {
    currentPage = 1;
    search = '';
    render();
    checkPages();
})


