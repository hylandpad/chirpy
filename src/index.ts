import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { type APIConfig } from './config.js'

const badWords = ['kerfuffle','sharbert','fornax']
const app = express();
const PORT = 8080;
const tracker:APIConfig = {
  fileserverHits: 0
}

app.use(express.json());

app.use(middlewareLogResponses)

app.use("/app",middlewareMetricsInc,express.static("./src/app"));

app.get("/api/healthz", (req: Request, res: Response)=>{
  res.set("Content-Type","text/plain; charset=utf-8");
  res.send("OK");
});

app.get("/admin/metrics", (req: Request, res: Response)=>{
  res.set("Content-Type","text/html; charset=utf-8")
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${tracker.fileserverHits} times!</p>
  </body>
</html>`)
});

app.post("/admin/reset", (req,res) => {
  tracker.fileserverHits = 0
  res.end()
});

app.post("/api/validate_chirp",(req,res)=>{
  type Parameters = {
    body: string;
  }  
  
  const params: Parameters = req.body
      if(params.body.length > 140){
        throw new Error("Chirp is too long")
      }else{
        const profanityFiltered = profanityFilter(params.body,badWords);
        const responseBody = {
          cleanedBody: profanityFiltered
        }
        res.status(200).send(responseBody)
      }

      res.status(400).send("Something went wrong");
})

function profanityFilter(bodytext: string, badWords: string[]){
  const splitted = bodytext.split(" ")
  for (let i = 0; i <  splitted.length; i++){
    if (badWords.includes(splitted[i].toLowerCase())){
      splitted[i] = '****'
    }
  }
  return splitted.join(" ");
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  tracker.fileserverHits++;
  next();
}

function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
  res.on("finish",() => {
    const statusCode = res.statusCode;
    if (statusCode < 200 || statusCode >= 300){
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  })
  next();
}

async function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(err);
  res.status(500).json({
    error: "Something went wrong on our end",
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
