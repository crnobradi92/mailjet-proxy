require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Mailjet = require('node-mailjet');

const app = express();
app.use(cors());
app.use(express.json());

const mailjetClient = Mailjet.connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

app.post('/send-email', async (req, res) => {
  const { name, email, subject, message, 'g-recaptcha-response': recaptchaToken } = req.body;

  // ✅ Provera da li su sva polja popunjena
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ status: "error", message: 'Sva polja su obavezna.' });
  }

  // ✅ Provera da li postoji reCAPTCHA token
  if (!recaptchaToken) {
    return res.status(400).json({ status: "error", message: "reCAPTCHA verifikacija nije potvrđena." });
  }

  // ✅ Verifikacija reCAPTCHA tokena na Google serveru
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
  try {
    const recaptchaRes = await axios.post(verifyUrl);
    const data = recaptchaRes.data;

    if (!data.success) {
      return res.status(400).json({ status: "error", message: "reCAPTCHA verifikacija nije prošla." });
    }
  } catch (err) {
    console.error("Greška u reCAPTCHA:", err.message);
    return res.status(500).json({ status: "error", message: "Greška pri verifikaciji reCAPTCHA." });
  }

  // ✅ Slanje mejla putem Mailjet-a
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
    console.error("Greška u slanju mejla:", err);
    res.status(500).json({ status: "error", message: 'Greška prilikom slanja mejla.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
