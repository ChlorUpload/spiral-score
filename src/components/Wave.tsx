import { createRef, RefObject, useEffect } from "react";

type Props = {
  stream: MediaStream;
};

const WIDTH = 400;
const HEIGHT = 120;

export default function Wave({ stream }: Props) {
  const ref = createRef<HTMLCanvasElement>();

  useEffect(() => {
    if (ref.current !== null) {
      const canvasCtx = ref.current.getContext("2d");
      if (canvasCtx !== null) {
        visualize(stream, canvasCtx);
      }
    }
  }, [ref.current, stream]);

  return (
    <canvas ref={ref} width={`${WIDTH}px`} height={`${HEIGHT}px`}></canvas>
  );
}

function visualize(stream: MediaStream, canvasCtx: CanvasRenderingContext2D) {
  const audioCtx = new AudioContext();

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  draw();

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(241, 219, 248)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(100, 46, 136)";

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
  }
}
