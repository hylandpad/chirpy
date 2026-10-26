import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { type APIConfig } from './config.js'

const app = express();
const PORT = 8080;
const tracker:APIConfig = {
  fileserverHits: 0
}

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
  let body = ""

  req.on("data", (chunk) => {
    body += chunk
  })

  req.on("end", () => {  
    try {
      const parsedBody = JSON.parse(body);  
      if(body.length > 140){
        const responseBody = {
          error:"Chirp is too long"
        }
        res.status(400).send(responseBody)
      }else{
        const responseBody = {
          valid: true
        }
        res.status(200).send(responseBody)
      }
    } catch (error){
      res.status(400).send("Something went wrong");
    }
  }
  )
})

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
