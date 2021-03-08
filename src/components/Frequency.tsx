import { createRef, RefObject, useEffect } from "react";

type Props = {
  stream: MediaStream;
};

const WIDTH = 400;
const HEIGHT = 120;

export default function Frequency({ stream }: Props) {
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

  const sampleRate = audioCtx.sampleRate;

  const source = audioCtx.createMediaStreamSource(stream);

  const fftSize = 8192;

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = fftSize;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);

  draw();

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(241, 219, 248)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(100, 46, 136)";

    canvasCtx.beginPath();

    const f0 = sampleRate / 2 / bufferLength; // bufferLength 는 fftSize / 2 입니다.

    const A0 = 27.0;
    const C8 = 4186.0;

    const startIdx = Math.floor(A0 / f0);
    const endIdx = Math.ceil(C8 / f0);

    let sliceWidth = (WIDTH * 1.0) / (endIdx - startIdx);
    let x = 0;

    for (let i = startIdx; i <= endIdx; i++) {
      let v = dataArray[i] / 256.0;
      let y = (1 - v) * HEIGHT;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(WIDTH, HEIGHT);
    canvasCtx.stroke();
  }
}
