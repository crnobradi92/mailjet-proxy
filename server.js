require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Mailjet = require('node-mailjet');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

app.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const request = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
              Name: name || "Kontakt forma",
            },
            To: [
              {
                Email: process.env.MJ_RECEIVER_EMAIL,
                Name: "Geos",
              },
            ],
            Subject: "Poruka sa sajta",
            TextPart: `Ime: ${name}\nEmail: ${email}\nPoruka: ${message}`,
          },
        ],
      });

    console.log(request.body);
    res.status(200).json({ message: 'Mejl uspešno poslat!' });
  } catch (err) {
    console.error(err.statusCode || 500, err.message);
    res.status(500).json({ error: 'Greška prilikom slanja mejla.' });
  }
});

app.listen(port, () => {
  console.log(`Server radi na portu ${port}`);
});
