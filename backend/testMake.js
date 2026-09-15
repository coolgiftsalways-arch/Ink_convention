import "dotenv/config";

const res = await fetch(process.env.MAKE_WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-make-apikey": process.env.MAKE_API_KEY,
  },
  body: JSON.stringify({
    artistName: "Test Artist",
    artistPhone: "919876543210",
    customerName: "Ahmed",
    customerPhone: "919812345678",
    tattooStyle: "Realism",
    preferredDate: "2026-09-20",
    message: "I want a forearm tattoo",
  }),
});

console.log("STATUS:", res.status);
console.log("RESPONSE:", await res.text());
