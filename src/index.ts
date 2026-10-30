import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { type APIConfig } from './config.js'
import { NotFoundError,MalformedError,UnauthorizedError,ForbiddenError } from './api/errors.js'

const badWords = ['kerfuffle','sharbert','fornax']
const app = express();
const PORT = 8080;
const tracker:APIConfig = {
  fileServerHits: 0,
  dbURL: process.env.DB_URL || ""
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
    <p>Chirpy has been visited ${tracker.fileServerHits} times!</p>
  </body>
</html>`)
});

app.post("/admin/reset", (req,res) => {
  tracker.fileServerHits = 0
  res.end()
});

app.post("/api/validate_chirp",(req,res)=>{
  type Parameters = {
    body: string;
  }  
  
  const params: Parameters = req.body
      if(params.body.length > 140){
        throw new MalformedError("Chirp is too long. Max length is 140")
      }else{
        const profanityFiltered = profanityFilter(params.body,badWords);
        const responseBody = {
          cleanedBody: profanityFiltered
        }
        res.status(200).send(responseBody)
      }
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
  tracker.fileServerHits++;
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

async function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(err);
  if (err instanceof NotFoundError) {
    res.status(404).json({error: err.message});
  } else if (err instanceof MalformedError) {
    res.status(400).json({error: err.message});
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({error: err.message});
  } else if (err instanceof ForbiddenError) {
    res.status(403).json({error: err.message});
  } else {
    res.status(500).json({error: "Something went wrong on our end"});
  }
}

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
