var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


var app = express();



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



/** @You_may_need_to_change_these */
const videosPath = path.join(os.homedir(), "Downloads")
let SERVER_HOST = `http://localhost:3000`;
/** @U-------------------------- */

(async function getIpAddress() {
  try {
    const { stdout } = await exec('ipconfig');
    const match = stdout.match(/IPv4 Address[\.\s]+:\s+([\d\.]+)/gi);
    console.log("🚀 ~ file: app.js:46 ~ exec ~ match:", match)

    if (match) {
      const current = match[0];
      for (const ip of match) {
        if (ip !== current && ip.length > current.length) {
          console.log(ip.split(':')[1].trim())
          SERVER_HOST = `http://${ip.split(':')[1].trim()}:3000` ;
        }
      }
    }
    else {
      console.error(`No IP address found`);
      SERVER_HOST = "http://localhost:3000"
    }
  } catch (error) {
    console.error(`Error executing ipconfig: ${error}`);
    SERVER_HOST = "http://localhost:3000";
  }
})()

console.log(SERVER_HOST)

const contentTypeMap = {
  '.mp4': 'video/mp4',
  '.mkv': 'video/x-matroska',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.flv': 'video/x-flv',
  '.ogg': 'video/ogg',
};



async function getIpAddress() {
  try {
    const { stdout } = await exec('ipconfig');
    const match = stdout.match(/IPv4 Address[\.\s]+:\s+([\d\.]+)/gi);
    console.log("🚀 ~ file: app.js:46 ~ exec ~ match:", match)

    if (match) {
      const current = match[0];
      for (const ip of match) {
        if (ip !== current && ip.length > current.length) {
          console.log("🚀 ~ file: app.js:51 ~ exec ~ ip:", ip.split(':')[1].trim())
          return ip.split(':')[1].trim();
        }
      }
    }
    else {
      console.error(`No IP address found`);
      return "localhost"
    }
  } catch (error) {
    console.error(`Error executing ipconfig: ${error}`);
    return "localhost";
  }
}

const showAllAvailablevideos = async (req, res, next) => {

  try {
    const files = await fs.promises.readdir(videosPath);
    const filteredFiles = files.filter((file) => {
      const fileExtension = path.extname(file);
      return contentTypeMap[fileExtension];
    })

    const linkList = filteredFiles.map(link => `<li><a href="${SERVER_HOST}/v/${link.split('.')[0]}?s=1">${link}</a></li>`).join('');
    const html = `<html><body><h1 style="text-align : left;">My videos v1.0</h1><ul>${linkList}</ul></body></html>`;

    res.send(html)

  }
  catch (e) {
    console.error(e);
    next();
  }
}


app.get('/d', showAllAvailablevideos);

app.get('/v/:n', async (req, res) => {
  const video_name = decodeURIComponent(req.params.n);
  const isStream = !!req.query?.s;
  console.log("🚀 ~ file: app.js:38 ~ app.get ~ streaming:", isStream)

  if (!isExistFile()) {
    return res.status(500).send('Internal Server error');
  }

  const video = await searchVideo(video_name);

  const stat = fs.statSync(video.path);
  console.log("🚀 ~ file: app.js:45 ~ app.get ~ stat:", stat)
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    console.log("🚀 ~ file: app.js:49 ~ app.get ~ range:", range)


    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(video.path, { start, end });
    let headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': video.type,
    };

    if (!isStream) {
      console.log("first")
      headers["Content-Disposition"] = `attachment; filename=${video_name + video.ext}`
    }
    console.log("🚀 ~ file: app.js:65 ~ app.get ~ headers:", headers)

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    let headers = {
      'Content-Length': fileSize,
      'Content-Type': video.type,
    };

    if (!isStream) {
      console.log("second")
      headers["Content-Disposition"] = `attachment; filename=${video_name + video.ext}`
    }

    res.writeHead(200, headers);
    fs.createReadStream(video.path).pipe(res);
  }
});


function isExistFile() {
  return fs.existsSync(videosPath);
}

const searchVideo = async (videoName) => {
  try {
    const files = await fs.promises.readdir(videosPath);
    const videoFile = files.find((file) => {
      const fileExtension = path.extname(file);
      const fileNameWithoutExtension = path.basename(file, fileExtension);
      return contentTypeMap[fileExtension] && fileNameWithoutExtension.toLowerCase().includes(videoName.toLowerCase());
    });
    if (videoFile) {
      const ext = path.extname(path.join(videosPath, videoFile));
      return {
        path: path.join(videosPath, videoFile),
        type: contentTypeMap[ext] || 'application/octet-stream',
        ext
      }
    }
    console.log('Video not found');
  } catch (error) {
    console.error(error);
  }
};



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
