const mailjet = require('node-mailjet');
require('dotenv').config(); // važno ako lokalno testiraš

const mailjetClient = mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware za parsiranje JSON tela zahteva
app.use(express.json());

app.post('/send', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).send('Missing required fields');
  }

  const request = mailjet
    .post("send", { version: 'v3.1' })
    .request({
      Messages: [
        {
          From: {
            Email: "crnobradi92@gmail.com",  // ovde stavi svoj email sa kog šalješ
            Name: "Ime pošiljaoca"         // može tvoje ime ili ime firme
          },
          To: [
            {
              Email: "crnobradi92@gmail.com",  // ovde stavi kome šalješ mejl
              Name: "Ime primaoca"
            }
          ],
          Subject: subject,
          TextPart: message,
          HTMLPart: `<h3>Ime: ${name}</h3><p>Email: ${email}</p><p>Poruka: ${message}</p>`
        }
      ]
    });

  request
    .then(result => {
      console.log('Email poslat:', result.body);
      res.send('success');
    })
    .catch(err => {
      console.error('Greška prilikom slanja:', err.statusCode);
      res.status(500).send('Error sending email');
    });
});

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
