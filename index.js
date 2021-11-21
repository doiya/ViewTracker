let faceapi;
let video;
let videoWidth;
let videoHeight;
let detections;
let cameraPosition;

const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}

function setup() {
  // カメラから読み込む
  // video = createCapture(VIDEO);
  // ファイルから読み込む
  video = createVideo('img/mr_fuji.mp4');
  video.elt.onloadeddata = function () {
    videoWidth = video.width;
    videoHeight = video.height;
    const canvas = createCanvas(videoWidth, videoHeight + 200);
    canvas.parent('canvas');
  };
  video.elt.muted = true;
  video.hide();
  faceapi = ml5.faceApi(video.loop(), detection_options, modelReady)
}

function modelReady() {
  faceapi.detect(gotResults);
}

function gotResults(err, result) {
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
          drawBox(detections)
          drawLandmarks(detections)
      }
  }
  pop();
  switchCamera();
  faceapi.detect(gotResults)
}

function drawBox(detections){
  for(let i = 0; i < detections.length; i++){
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
  stroke(161, 95, 251)
  strokeWeight(2)
  for(let i = 0; i < detections.length; i++){
    const mouth = detections[i].parts.mouth; 
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;
    // console.log('leftEye: ' + leftEye[0]._x, ', ' + leftEye[3]._y);
    // console.log('nose: ' + nose[0]._x + ', ' + nose[0]._y);
    // console.log('rightEye: ' + rightEye[3]._x + ', ' + rightEye[0]._y);
    
    const leftEyeToNose = Math.abs(leftEye[0]._x - nose[0]._x);
    const NoseToRightEye = Math.abs(nose[0]._x - rightEye[0]._x);
    if (leftEyeToNose / NoseToRightEye < 3/5) {
        // console.log('下手');
        cameraPosition = 0;
    } else if (leftEyeToNose / NoseToRightEye < 5/3) {
        // console.log('上手');
        cameraPosition = 1;
    } else {
        // console.log('正面');
        cameraPosition = 2;
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
