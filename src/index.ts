import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { type APIConfig } from './config.js'

const app = express();
const PORT = 8080;
const tracker:APIConfig = {
  fileserverHits: 0
}

app.use(middlewareLogResponses)
app.use("/app",middlewareMetricsInc,express.static("./src/app"));
app.get("/healthz", (req: Request, res: Response)=>{
  res.set("Content-Type","text/plain; charset=utf-8");
  res.send("OK");
});
app.get("/metrics", (req: Request, res: Response)=>{
  res.send(`Hits: ${tracker.fileserverHits}`)
});
app.get("/reset", (req,res) => {
  tracker.fileserverHits = 0
  res.end()
});

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
