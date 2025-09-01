document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultDiv = document.getElementById('result');  
    const paginationDiv = document.getElementById('pagination');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    // siin on muutujad mis hoiavad praegune leht ja otsingu tekst
    let currentPage = 1;
    let currentQuery = '';

    // Otsingu loogika
    function performSearch(query, page = 1) {
        currentQuery = query;
        currentPage = page;
        const pageSize = pageSizeSelect.value;
        showLoading();
        fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`)
            .then(response => response.json())
            .then(data => {
                displayResults(data);                
                displayPagination(data);               
                const newUrl = `?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`;
                history.pushState({query, page, pageSize}, '', newUrl);
            })
            .catch(error => {
                console.error('Tekkis viga:', error);
                resultDiv.innerHTML = '<p class="text-center text-danger">Otsingu käigus tekkis viga</p>';
            });
    }

    function showLoading() {
        resultDiv.innerHTML = '<p class="text-center">Loading...</p>';
    }

    // Tulemuste tabeli genereerimine
    function displayResults(data) {
        if (data.items.length === 0) {
            resultDiv.innerHTML = '<p class="text-center text-muted">No results found</p>';
            return;
        }

        let tableHtml = `
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID/SKU nr</th>
                        <th>Kirjeldus</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.items.forEach(item => {
            tableHtml += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.description}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
            <p>Näitab ${data.items.length} / ${data.totalItems} tulemust</p>
        `;

        resultDiv.innerHTML = tableHtml;
    }

   
    function displayPagination(data) {
        const totalPages = data.totalPages;
        let paginationHtml = '';

        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${i === data.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        paginationDiv.innerHTML = paginationHtml;

    
        paginationDiv.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                performSearch(currentQuery, page);
            });
        });
    }

    searchButton.addEventListener('click', () => performSearch(searchInput.value));
    searchInput.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    pageSizeSelect.addEventListener('change', () => {
        performSearch(currentQuery, 1);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q') || '';
    const page = parseInt(urlParams.get('page')) || 1;
    const pageSize = urlParams.get('pageSize') || '10';

    searchInput.value = searchQuery;
    pageSizeSelect.value = pageSize;
    performSearch(searchQuery, page);


    window.onpopstate = function(event) {
        if (event.state) {
            searchInput.value = event.state.query;
            pageSizeSelect.value = event.state.pageSize;
            performSearch(event.state.query, event.state.page);
        } else {
            searchInput.value = '';
            pageSizeSelect.value = '10';
            resultDiv.innerHTML = '';
            paginationDiv.innerHTML = '';
        }
    };
});