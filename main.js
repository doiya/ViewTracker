const express = require('express');
const fs = require('fs');
const app = express();
const expressWs = require('express-ws')(app)

var clients=[]; // クライアントのリスト

const today = new Date(); 
const recordDirectory = "./record/" + today.getFullYear() + "-" + today.getMonth() + 1 + "-" + today.getDate() + "/";

fs.mkdir(recordDirectory + "capture/", { recursive: true }, err => {
    if(err) console.error(err);
});


// WebSocketのエンドポイント
app.ws('/echo', (ws, request) => {
    const remoteAddress = request.headers['x-forwarded-for']
        || request.connection.remoteAddress
    console.log(`client connected: ${remoteAddress}`)
    clients.push(ws);

    ws.on('message', (jsonData) => {
        const data = JSON.parse(jsonData);
        saveCoordinates(data);
        saveImg(data);
    })

    // 切断時は接続クライアント一覧から取り除く
    ws.on('close', function() {
        clients = clients.filter((client) => client != ws)
        console.log(`client disconnected: ${remoteAddress}`)
    })
})


app.get('/', function(req, res) {
    fs.readFile("./index.html", function (err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    });
});

// app.get('/capture', function(req, res) {
//     fs.readFile("./capture.html", function (err, data) {
//         res.writeHead(200, { "Content-Type": "text/html" });
//         res.write(data);
//         res.end();
//     });
// });

app.use('/public', express.static('public'));

app.listen(8080, () => console.log('app start port 8080.'));



const saveCoordinates = (data) => {
    const _data = `{"date":"${data.date}","coordinates":${data.coordinates}},\n`;
    fs.appendFile(recordDirectory + "coordinates.json", _data, "utf8", (error) => {
        if (error) {
          console.log(error.message);
          throw error;
        }
      });
}

const saveImg = (data) => {
    const base64 = data.img.split(",")[1];
    const decode = new Buffer.from(base64,'base64');
    fs.writeFile(recordDirectory + "capture/" + data.date + '.jpg', decode, (err) => {
      if(err){
        console.log(err);
        io.emit('msg', '保存失敗');
      }
    });
  };