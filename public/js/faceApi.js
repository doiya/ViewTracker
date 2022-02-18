let faceapi;
let video;
let videoWidth;
let videoHeight;
let detections;
let cameraPosition;
let nowTime;
let startTime;

const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}

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

    // const getNow = () => {
    //   let dt = new Date(),
    //       y = dt.getFullYear(),
    //       m = ('00' + (dt.getMonth()+1)).slice(-2),
    //       d = ('00' + dt.getDate()).slice(-2),
    //       h = ('00' + dt.getHours()).slice(-2),
    //       min = ('00' + dt.getMinutes()).slice(-2),
    //       s = ('00' + dt.getSeconds()).slice(-2);
    //   return `${y}-${m}-${d}T${h}:${min}:${s}`;
    // };

    let data;
    if (detections[0]) {
      data = {
        "date": timer(),
        "coordinates": JSON.stringify(detections[0].parts),
        "img": canvas.toDataURL("image/jpeg")
      };
    } else {
      data = {
        "date": timer(),
        "coordinates": "error",
        "img": canvas.toDataURL("image/jpeg")
      };
    }
    sock.send(JSON.stringify(data));
  });

  // カメラから読み込む
  // video = createCapture(VIDEO);
  // video.elt.onloadedmetadata = function () {
  // ファイルから読み込む
  // video = createVideo('img/mr_fuji.mp4');
  video = createVideo('../img/GEKI_Dance_Face_hidden.mp4');
  video.elt.onloadeddata = function () {
    videoWidth = video.width;
    videoHeight = video.height;
    const canvas = createCanvas(videoWidth, videoHeight + 200);
    canvas.parent('canvas');
  };
  video.elt.muted = true;
  video.hide();
  video.loop = false;
  nowTime = Date.now();
  startTime = nowTime;
  faceapi = ml5.faceApi(video.play(), detection_options, modelReady)
}

function modelReady() {
  faceapi.detect(gotResults);
}

function gotResults(err, result) {
  const _now = Date.now();
  if (_now - nowTime > 1000) {
    // btn.click();
    nowTime = _now;
  }
  if (err) {
      console.log(err)
      faceapi.detect(gotResults)
    }
  detections = result;
  background(255);
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0,0, videoWidth, videoHeight)
  if (detections) {
      if (detections.length > 0) {
          drawBox(detections);
          drawLandmarks(detections);
      }
  }
  pop();
  switchCamera();
  if (detections[0]) {
    // const _now = Date.now();
    // if (_now - nowTime > 1000) {
    //   btn.click();
    //   nowTime = _now;
    // }
  }
  faceapi.detect(gotResults)
}

function drawBox(detections){
  for(let i = 0; i < detections.length; i++){
    let i = 0;
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x
    const y = alignedRect._box._y
    const boxWidth = alignedRect._box._width
    const boxHeight  = alignedRect._box._height
    
    noFill();
    stroke(161, 95, 251);
    strokeWeight(2);
    rect(x, y, boxWidth, boxHeight);
  }  
}

function drawLandmarks(detections){
  noFill();
  // stroke(161, 95, 251)
  strokeWeight(2)
  for(let i = 0; i < detections.length; i++){
    if (i == 0) {
      stroke('red');
    } else {
      stroke(161, 95, 251);
    }
    const mouth = detections[i].parts.mouth; 
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;
    // console.log('leftEye: ' + leftEye[0]._x, ', ' + leftEye[3]._y);
    // console.log('nose: ' + nose[0]._x + ', ' + nose[0]._y);
    // console.log('rightEye: ' + rightEye[3]._x + ', ' + rightEye[0]._y);

    if (i == 0) {
      cameraPosition = detectCameraPosition(leftEye, rightEye);
    }
    
    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
  }

}

function drawPart(feature, closed){
  beginShape();
  for(let i = 0; i < feature.length; i++){
    const x = feature[i]._x
    const y = feature[i]._y
    vertex(x, y)
  }
  
  if(closed === true){
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function detectCameraPosition(leftEye, nose, rightEye) {
  const leftEyeToNose = Math.abs(leftEye[0]._x - nose[0]._x);
  const NoseToRightEye = Math.abs(nose[0]._x - rightEye[3]._x);
  if (leftEyeToNose / NoseToRightEye < 3/5) {
      // console.log('下手');
      return 0;
  } else if (leftEyeToNose / NoseToRightEye < 5/3) {
      // console.log('正面');
      return 1;
  } else {
      // console.log('上手');
      return 2;
  }
}

function detectCameraPosition(leftEye, rightEye) {
  const leftEyeLength = Math.abs(leftEye[3]._x - leftEye[0]._x);
  const rightEyeLength = Math.abs(rightEye[3]._x - rightEye[0]._x);
  // console.log('leftEyeLength : ' + leftEyeLength);
  // console.log('rightEyeLength : ' + rightEyeLength)
  if (leftEyeLength / rightEyeLength < 9/10) {
      // console.log('下手');
      return 0;
  } else if (leftEyeLength / rightEyeLength < 10/9) {
      // console.log('正面');
      return 1;
  } else {
      // console.log('上手');
      return 2;
  }
}

function switchCamera() {
  push();
  fill(60, 60, 60);
  translate(50, videoHeight + 100);
  rect(0, 0, 140, 50);
  translate(150, 0);
  rect(0, 0, 140, 50);
  translate(150, 0);
  rect(0, 0, 140, 50);
  pop();

  textAlign(CENTER, CENTER);
  textSize(20);
  fill(255, 255, 255);
  if (cameraPosition === 2) {
    text('上手カメラ', 120, videoHeight + 125);
    return;
  }
  if (cameraPosition === 1) {
    text('正面カメラ', 270, videoHeight + 125);
    return;
  }
  if (cameraPosition === 0) {
    text('下手カメラ', 420, videoHeight + 125);
    return;
  }
}

function timer() {
  let elapsedTime = nowTime - startTime;
  //m(分) = 135200 / 60000ミリ秒で割った数の商　-> 2分
  let m = Math.floor(elapsedTime / 60000);

  //s(秒) = 135200 % 60000ミリ秒で / 1000 (ミリ秒なので1000で割ってやる) -> 15秒
  let s = Math.floor(elapsedTime % 60000 / 1000);

  //ms(ミリ秒) = 135200ミリ秒を % 1000ミリ秒で割った数の余り
  let ms = elapsedTime % 1000;


  //HTML 上で表示の際の桁数を固定する　例）3 => 03　、 12 -> 012
  //javascriptでは文字列数列を連結すると文字列になる
  //文字列の末尾2桁を表示したいのでsliceで負の値(-2)引数で渡してやる。
  m = ('0' + m).slice(-2); 
  s = ('0' + s).slice(-2);
  ms = ('0' + ms).slice(-3);

  //HTMLのid　timer部分に表示させる　
  let textContent = m + ':' + s + ':' + ms;
  return textContent;
}
