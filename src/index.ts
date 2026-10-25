import express, { type Express, type Request, type Response } from 'express';

const app = express();
const PORT = 8080;

app.use(express.static("."));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
