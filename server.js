require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Mailjet = require('node-mailjet');

const mailjetClient = Mailjet.connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const app = express();
app.use(cors());
app.use(express.json()); // <-- Ovo je sada ispravno i sigurnije

app.post('/send-email', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ status: "error", message: 'Sva polja su obavezna.' });
  }

  try {
    const request = mailjetClient
      .post("send", { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
              Name: "Tvoj sajt"
            },
            To: [
              {
                Email: process.env.MJ_RECEIVER_EMAIL,
                Name: "Primaoc"
              }
            ],
            Subject: subject,
            TextPart: `Ime: ${name}\nEmail: ${email}\nPoruka:\n${message}`,
          }
        ]
      });

    await request;
    res.json({ status: "success", message: 'Mejl je uspešno poslat.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: 'Greška prilikom slanja mejla.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
