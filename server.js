require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Mailjet = require('node-mailjet');

const mailjetClient = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const request = await mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'tvojemail@example.com',
              Name: 'Tvoje ime ili ime sajta',
            },
            To: [
              {
                Email: 'primailemail@example.com',
                Name: 'Primaoc',
              },
            ],
            Subject: subject,
            TextPart: message,
            HTMLPart: `<h3>Poruka od: ${name} (${email})</h3><p>${message}</p>`,
          },
        ],
      });

    res.json({ message: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Greška prilikom slanja mejla.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));
