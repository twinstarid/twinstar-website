export default async function handler(req, res) {
  const SHEET_API = "https://api.sheetbest.com/sheets/97b066c8-339f-43f4-be3b-fe4af8293305";

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "TSID-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  try {
    // Ambil semua ORDER ID yang sudah ada
    const existing = await fetch(SHEET_API);
    const used = await existing.json();
    const usedIds = used.map(r => r.ORDER_ID);

    // Buat kode baru yang unik
    let newId;
    do {
      newId = generateCode();
    } while (usedIds.includes(newId));

    // Simpan ke Sheet
    await fetch(SHEET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ORDER_ID: newId,
        TIMESTAMP: new Date().toISOString(),
      }),
    });

    res.status(200).json({ orderId: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
