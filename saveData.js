const https = require('https');
const fs = require('fs');
const iconv = require('iconv-lite');
// järgjsed funktsioon mis hangib andmed ja salvestab need faili
function fetchDataAndSave(url, filePath) {
    // järgjsed tagastab promisi
    return new Promise((resolve, reject) => {
    // toob andmed urlist
    https.get(url, (response) => {
            let data = [];

            // chunckide kaupa kuulabb
            response.on('data', (chunk) => {
                data.push(chunk);
            });

            // järgjsed kui kõik andmed on tulnud
            response.on('end', () => {
                const buffer = Buffer.concat(data);
                const decodedData = iconv.decode(buffer, 'win1257');
                // kirjutab andmed faili
                fs.writeFile(filePath, decodedData, 'utf-8', (err) => {
                    if (err) {
                        console.error('Viga faili kirjutamisel:', err);
                        reject(err);
                    } else {
                        console.log('Andmed salvestatud faili', filePath);
                        resolve();
                    }
                });
            });

        // KUi ebaõnnestubS
        }).on('error', (err) => {
            console.error('Viga andmete toomisel:', err);
            reject(err);
        });
    });
}

module.exports = { fetchDataAndSave };