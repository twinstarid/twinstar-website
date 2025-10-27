import { google } from "googleapis";

const SHEET_ID = "ID_SHEET_KAMU"; // contoh: 1AbCdEfGhIjKlMnOpQrSxYz12345ABCDE
const RANGE = "A:B"; // kolom ORDER_ID dan TIMESTAMP

// kredensial dari service account (dari file JSON)
const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: process.env.GCP_PROJECT_ID,
  private_key_id: process.env.GCP_PRIVATE_KEY_ID,
  private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.GCP_CLIENT_EMAIL,
  client_id: process.env.GCP_CLIENT_ID,
};

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "TSID-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ambil data existing
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const usedIds = existing.data.values ? existing.data.values.map(r => r[0]) : [];
    let newId;
    do {
      newId = generateCode();
    } while (usedIds.includes(newId));

    // simpan ke sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[newId, new Date().toISOString()]],
      },
    });

    res.status(200).json({ orderId: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
