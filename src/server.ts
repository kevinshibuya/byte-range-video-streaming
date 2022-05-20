import express from 'express'
import { Router, Request, Response } from 'express';

const fs = require("fs");

const app = express();
const port = 3333;

const route = Router()

app.use(express.static("public"));

const filePath = "./assets/videos/remined-silver-nft.mov";

type optionsType = {
  start: any;
  end: any;
}

app.get('/works-in-chrome-and-safari', (req, res) => {

  // Listing 3.
  const options = {} as optionsType;

  let start: any;
  let end: any;

  const range = req.headers.range;
  if (range) {
    const bytesPrefix = "bytes=";
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split("-");
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader("content-type", "video/mp4");

  fs.stat(filePath, (err: any, stat: any) => {
    if (err) {
      console.error(`File stat error for ${filePath}.`);
      console.error(err);
      res.sendStatus(500);
      return;
    }

    let contentLength = stat.size;

    // Listing 4.
    if (req.method === "HEAD") {
      res.statusCode = 200;
      res.setHeader("accept-ranges", "bytes");
      res.setHeader("content-length", contentLength);
      res.end();
    }
    else {
      // Listing 5.
      let retrievedLength;
      if (start !== undefined && end !== undefined) {
        retrievedLength = (end + 1) - start;
      }
      else if (start !== undefined) {
        retrievedLength = contentLength - start;
      }
      else if (end !== undefined) {
        retrievedLength = (end + 1);
      }
      else {
        retrievedLength = contentLength;
      }

      // Listing 6.
      res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

      res.setHeader("content-length", retrievedLength);

      if (range !== undefined) {
        res.setHeader("content-range", `bytes ${start || 0}-${end || (contentLength - 1)}/${contentLength}`);
        res.setHeader("accept-ranges", "bytes");
      }

      // Listing 7.
      const fileStream = fs.createReadStream(filePath, options);
      fileStream.on("error", (error: any) => {
        console.log(`Error reading file ${filePath}.`);
        console.log(error);
        res.sendStatus(500);
      });


      fileStream.pipe(res);
    }
  });
});

app.use(route)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});