const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { fetchDataAndSave } = require('./saveData');

const app = express();
const PORT = 3300;

let jsonData = [];

//  server annab public kaustast failid
app.use(express.static('public'));

// toimub andmete erinev parsisimne, et oleks loetav paremini
async function loadData() {
    try {
        const data = await fs.readFile('LE.txt', 'utf-8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        jsonData = lines.map(line => {
            const [id, description, ...rest] = line.split('"').filter(item => item.trim() !== '');
            return { id, description };
        });
    console.log('Andmed said edukalt loetud');
    } catch (error) {
        console.error('Viga andmete lugemisel:', error);
        // kui faili pole siis toome selle
        if (error.code === 'ENOENT') {
            console.log('LE.txt pole olemas toome andmed...');
            await fetchAndLoadData();
        }
    }
}

// Function to fetch and load data
async function fetchAndLoadData() {
    try {
        await fetchDataAndSave('https://raw.githubusercontent.com/timotr/harjutused/main/hajusrakendused/LE.txt', 'LE.txt');
        await loadData();
    } catch (error) {
        console.error('Viga andmete toomisel ja lugemisel:', error);
    }
}

// kodu lehe route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//api route otsimiseks
app.get('/api/search', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const filteredData = jsonData.filter(item =>
        item.id.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );

    const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
    
    res.json({
        totalItems: filteredData.length,
        items: paginatedData,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize)
    });
});



// järgjsed server kaivitub
app.listen(PORT, async () => {
    console.log(`Server töötab http://localhost:${PORT}`);
    
    //laeb algsed andmed
    await fetchAndLoadData();
    
    // ajahvaemik, mil uued eandmed tulevad hetkel pandud 1 tund
    setInterval(fetchAndLoadData, 86400000); // 1 tund
});
