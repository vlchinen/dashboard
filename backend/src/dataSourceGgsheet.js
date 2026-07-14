const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '..', process.env.GOOGLE_SHEETS_CREDENTIALS_PATH);
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_RANGE = 'Transactions!A:I';

// Google Sheets uses the same date system as Excel: number of days since 1899-12-30.
const SHEETS_EPOCH_OFFSET_DAYS = 25569;

async function getWalletTransactions() {
  const rawRows = await fetchRawRowsFromGoogleSheets();
  return convertRowsToTransactions(rawRows);
}

async function fetchRawRowsFromGoogleSheets() {
  const sheets = google.sheets({ version: 'v4', auth: createGoogleAuth() });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_RANGE,
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  return response.data.values || [];
}

function createGoogleAuth() {
  return new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

function convertRowsToTransactions(rawRows) {
  const [headerRow, ...dataRows] = rawRows;
  return dataRows.map((row) => rowToTransaction(headerRow, row));
}

function rowToTransaction(headerRow, row) {
  const transaction = {};
  headerRow.forEach((columnName, columnIndex) => {
    transaction[columnName] = row[columnIndex];
  });

  transaction.Time = convertSheetsSerialDateToJsDate(transaction.Time);
  return transaction;
}

function convertSheetsSerialDateToJsDate(serialDate) {
  return new Date((serialDate - SHEETS_EPOCH_OFFSET_DAYS) * 86400 * 1000);
}

module.exports = { getWalletTransactions };