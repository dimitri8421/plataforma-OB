const mongoose = require('mongoose');
const { parse: json2csv } = require('json2csv');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Função para obter dados históricos entre um intervalo de datas
exports.getHistoricalData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'As datas de início e fim são obrigatórias.' });
    }

    const historicalData = await mongoose.model('YourModel').find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    res.status(200).json({ success: true, data: historicalData });
  } catch (error) {
    console.error("Erro ao obter dados históricos:", error);
    res.status(500).json({ success: false, message: 'Erro ao obter dados históricos' });
  }
};

// Função para exportar dados históricos em CSV
exports.exportToCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'As datas de início e fim são obrigatórias.' });
    }

    const historicalData = await mongoose.model('YourModel').find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const csvData = json2csv(historicalData.map(data => data.toObject()));
    const filePath = path.join(__dirname, '..', 'temp', `report_${Date.now()}.csv`);

    fs.writeFileSync(filePath, csvData);

    res.download(filePath, 'report.csv', (err) => {
      if (err) {
        console.error("Erro ao fazer download do CSV:", err);
        res.status(500).json({ success: false, message: 'Erro ao exportar dados para CSV' });
      }
      fs.unlinkSync(filePath); // Apaga o arquivo temporário após o download
    });
  } catch (error) {
    console.error("Erro ao exportar para CSV:", error);
    res.status(500).json({ success: false, message: 'Erro ao exportar dados para CSV' });
  }
};

// Função para exportar dados históricos em PDF
exports.exportToPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'As datas de início e fim são obrigatórias.' });
    }

    const historicalData = await mongoose.model('YourModel').find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '..', 'temp', `report_${Date.now()}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('Relatório de Dados Históricos', { align: 'center' });
    doc.moveDown();

    historicalData.forEach(data => {
      doc.fontSize(12).text(JSON.stringify(data), { align: 'left' });
      doc.moveDown();
    });

    doc.end();

    res.download(filePath, 'report.pdf', (err) => {
      if (err) {
        console.error("Erro ao fazer download do PDF:", err);
        res.status(500).json({ success: false, message: 'Erro ao exportar dados para PDF' });
      }
      fs.unlinkSync(filePath); // Apaga o arquivo temporário após o download
    });
  } catch (error) {
    console.error("Erro ao exportar para PDF:", error);
    res.status(500).json({ success: false, message: 'Erro ao exportar dados para PDF' });
  }
};

// Função para exportar dados históricos em Excel
exports.exportToExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'As datas de início e fim são obrigatórias.' });
    }

    const historicalData = await mongoose.model('YourModel').find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório de Dados Históricos');
    const filePath = path.join(__dirname, '..', 'temp', `report_${Date.now()}.xlsx`);

    worksheet.columns = Object.keys(historicalData[0].toObject()).map(key => ({
      header: key,
      key,
      width: 20
    }));

    historicalData.forEach(data => worksheet.addRow(data.toObject()));

    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'report.xlsx', (err) => {
      if (err) {
        console.error("Erro ao fazer download do Excel:", err);
        res.status(500).json({ success: false, message: 'Erro ao exportar dados para Excel' });
      }
      fs.unlinkSync(filePath); // Apaga o arquivo temporário após o download
    });
  } catch (error) {
    console.error("Erro ao exportar para Excel:", error);
    res.status(500).json({ success: false, message: 'Erro ao exportar dados para Excel' });
  }
};
