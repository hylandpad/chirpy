import express, { type Express, type Request, type Response, type NextFunction } from 'express';

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app"));
app.get("/healthz", (req: Request, res: Response)=>{
  res.set("Content-Type","text/plain; charset=utf-8");
  res.send("OK");
});

function middlewareLogResponses = (req: Request, res: Response, next: NextFunction) {
  res.on("finish",() => {
    if (res.statusCode <= 200 && res.statusCode >= 300){
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
    }
  })
  next()
}
app.use(middlewareLogResponses)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
