let beforeTime = 0;
let videoWidth;
let videoHeight;

function setup() {
  let sock = new WebSocket("ws://localhost:8080/echo");

  sock.addEventListener("open", e => {
      console.log("接続が開かれたときに呼び出されるイベント");
  });

  sock.addEventListener("message", e => {
      console.log("サーバーからメッセージを受信したときに呼び出されるイベント");
  });

  sock.addEventListener("close", e => {
      console.log("接続が閉じられたときに呼び出されるイベント");
  });

  sock.addEventListener("error", e => {
      console.log("エラーが発生したときに呼び出されるイベント");
  });

  btn.addEventListener("click", e => {

    let data;
    
      data = {
        "date": 'r225-2-' + beforeTime,
        "coordinates": "",
        "img": canvas.toDataURL("image/jpeg")
      };
    
    sock.send(JSON.stringify(data));
  });

  video = createVideo('../img/20220216_faceAngle/r225-2.mp4');
  video.elt.onloadeddata = function () {
    videoWidth = video.width;
    videoHeight = video.height;
    // const canvas = createCanvas(videoWidth, videoHeight);
    const canvas = createCanvas(112, 112);
    canvas.parent('canvas');
  };
  video.elt.muted = true;
  video.hide();
  video.play();
}

function draw() {
  scale(-1, 1);
  image(video.get(500,100,1000,1000), 0, 0, - 112, 112);
  // let c = get()
  let nowTime = video.time();
  if (nowTime - beforeTime > 0.1) {
    // console.log(nowTime);
    beforeTime = nowTime;
    // btn.click()
  }
}