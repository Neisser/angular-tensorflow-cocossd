import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as cocoSSD from '@tensorflow-models/coco-ssd';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'my AI with tensorflow';
  private video: HTMLVideoElement

  async ngOnInit() {
    tf.getBackend()
    this.webcam_init()
    // this.predictWithCocoModel();
  }

  public async predictWithCocoModel(){
    const model = await cocoSSD.load();
    this.detectFrame(this.video,model);
    console.log('model loaded');
  }

  public async webcam_init()
  {  
  this.video = <HTMLVideoElement> document.getElementById("vid");
    
    navigator.mediaDevices
    .getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
    }
     })
    .then(stream => {
    this.video.srcObject = stream;
    this.video.onloadedmetadata = () => {
      this.video.play();
      this.predictWithCocoModel();
    };
    });
  }

  detectFrame = (video, model) => {
    // console.log(video)
    model.detect(video).then(predictions => {
      console.log(predictions)
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  }

  renderPredictions(predictions) {
    const canvas = <HTMLCanvasElement> document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 500;
    canvas.height = 500;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //font options
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.drawImage(this.video, 0, 0, 500, 500);

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const widht = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx. strokeRect(x, y, widht, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure its on top
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y)
    });
  }

}
