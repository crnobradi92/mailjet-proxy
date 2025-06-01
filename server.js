require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Mailjet = require('node-mailjet');

const mailjetClient = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const request = mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
              Name: 'Your Name',
            },
            To: [
              {
                Email: process.env.MJ_RECEIVER_EMAIL,
                Name: 'Receiver',
              },
            ],
            Subject: subject,
            TextPart: message,
            CustomID: 'AppGettingStartedTest',
          },
        ],
      });

    const result = await request;
    res.send('success');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška prilikom slanja mejla.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});