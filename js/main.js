const API_URL = 'https://jsonplaceholder.typicode.com/todos';
let usersData = []; // Menyimpan data user secara global

// // Fetch data from JSONPlaceholder API (Get All)
// async function loadUserData() {
//     try {
//         const response = await fetch('API_URL');
//         if (!response.ok) {
//             throw new Error('Failed to fetch user data');
//         }
//         const todo = await response.json();
//         console.log(todo);
//         usersData = todo;
//         populateTable(todo);
//     } catch (error) {
//         console.error('Error loading todo data:', error);
//     }
// }

// Fetch data dari JSON (based on drop down)
const loadUserData = async (completed = 'all') => {
    try {
        let url = API_URL;

        // Jika completed di-filter, tambahkan query parameter
        if (completed !== 'all') {
            url = `${API_URL}?completed=${completed}`;
        }

        const response = await fetch(url);
        const users = await response.json();

        // Tambahkan kolom `completed` secara acak karena API tidak mendukung field ini
        usersData = users.map(user => ({
            ...user,
            completed: user.completed !== undefined ? user.completed : Math.random() > 0.5
        }));

        // Jika filter applied, lakukan filter lokal
        const filteredUsers = completed === 'all'
            ? usersData
            : usersData.filter(user => String(user.completed) === completed);

        // Tampilkan data di tabel
        displayTable(filteredUsers);
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
};

// Populate table with data
function populateTable(todo) {
    const tableBody = document.querySelector('#todo-table tbody');
    tableBody.innerHTML = ''; // Clear previous data

    todo.forEach(todos => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${todos.userId}</td>
            <td>${todos.id}</td>
            <td>${todos.title}</td>
            <td>${todos.completed}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Fungsi untuk memfilter tabel berdasarkan dropdown
const filterTableByStatus = (status) => {
    loadUserData(status);
};

// Fungsi untuk menampilkan data ke tabel
const displayTable = (users) => {
    const userTable = document.querySelector('#todo-table tbody');
    userTable.innerHTML = users.map(user => `
        <tr>
            <td>${user.userId}</td>
            <td>${user.id}</td>
            <td>${user.title}</td>
            <td>${user.completed}</td>
        </tr>
    `).join('');
};

let deferredPrompt;

window.addEventListener('beforeinstallprompt',(event)=>{
    event.preventDefault();
    deferredPrompt = event;

    const installBtn = document.getElementById('download-btn');
    installBtn.style.display='block';

    installBtn.addEventListener('click',()=>{
        installBtn.style.display='none';

        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult)=>{
            if(choiceResult.outcome === 'accepted'){
                console.log('User accepted the install prompt');
            }else{
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        })
    })
});

// Load user data on page load
window.addEventListener('load', loadUserData('all'));
// Ekspor fungsi ke global (agar dapat digunakan di index.html)
window.filterTableByStatus = filterTableByStatus;