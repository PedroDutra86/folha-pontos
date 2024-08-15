const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');
const cors = require('cors');
const moment = require('moment');  // Importa o Moment.js

const app = express();
const PORT = 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para analisar o corpo da requisição como JSON
app.use(bodyParser.json());

// Rota para receber os dados do formulário
app.post('/api/save', (req, res) => {
    const { name, status, address, timestamp } = req.body;

    // Formata a data e hora para o padrão brasileiro
    const formattedTimestamp = moment(timestamp).format('DD/MM/YYYY HH:mm:ss');

    // Caminho para o arquivo Excel
    const filePath = path.join(__dirname, 'folha-de-ponto.xlsx');

    try {
        let workbook;
        if (fs.existsSync(filePath)) {
            workbook = XLSX.readFile(filePath);
        } else {
            workbook = XLSX.utils.book_new();
        }

        let worksheet = workbook.Sheets['Pontos'];
        if (!worksheet) {
            worksheet = XLSX.utils.aoa_to_sheet([['Nome', 'Status', 'Endereço', 'Data/Hora']]);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Pontos');
        }

        const newRow = [name, status, address, formattedTimestamp];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        sheetData.push(newRow);
        const updatedWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
        workbook.Sheets['Pontos'] = updatedWorksheet;

        // Salva o arquivo Excel
        XLSX.writeFile(workbook, filePath);
        res.json({ message: 'Dados salvos com sucesso!' });
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).json({ message: 'Erro ao salvar os dados.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});