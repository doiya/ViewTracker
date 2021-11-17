let faceapi;
let video;
let detections;

const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}

function setup() {
  createCanvas(640, 380);
  video = createCapture(VIDEO);
  video.elt.muted = true;
  video.loop();
  video.size(width, height);
  faceapi = ml5.faceApi(video, detection_options, modelReady)
  textAlign(RIGHT);
}

function modelReady() {
  faceapi.detect(gotResults);
}

function gotResults(err, result) {
  if (err) {
      console.log(err)
      return
  }
  console.log(result)
  detections = result;
  background(255);
  image(video, 0,0, width, height)
  if (detections) {
      if (detections.length > 0) {
          drawBox(detections)
          drawLandmarks(detections)
      }
  }
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

        console.log('leftEye: ' + leftEye[0]._x, ', ' + leftEye[3]._y);
        console.log('nose: ' + nose[0]._x + ', ' + nose[0]._y);
        console.log('rightEye: ' + rightEye[3]._x + ', ' + rightEye[0]._y);
        
        const leftEyeToNose = Math.abs(leftEye[0]._x - nose[0]._x);
        const NoseToRightEye = Math.abs(nose[0]._x - rightEye[0]._x);

        if (leftEyeToNose / NoseToRightEye < 3/5) {
            console.log('下手');
        } else if (leftEyeToNose / NoseToRightEye < 5/3) {
            console.log('上手');
        } else {
            console.log('正面');
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