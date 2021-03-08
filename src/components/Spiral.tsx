import { createRef, RefObject, useEffect } from "react";

type Props = {
  stream: MediaStream;
};

const RADIUS = 300;

export default function Spiral({ stream }: Props) {
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
    <canvas
      ref={ref}
      width={`${RADIUS * 2}px`}
      height={`${RADIUS * 2}px`}
    ></canvas>
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

  const fractionalPart = (num: number) => num - Math.floor(num);
  const rightToLeftCoord = (x: number, y: number) => ({
    x: x + RADIUS,
    y: RADIUS - y,
  });

  draw();

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(241, 219, 248)";
    canvasCtx.beginPath();
    canvasCtx.ellipse(RADIUS, RADIUS, RADIUS, RADIUS, 0, 0, 2 * Math.PI);
    canvasCtx.fill();

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(100, 46, 136)";
    canvasCtx.beginPath();

    const f0 = sampleRate / fftSize;

    const C2 = 65.4;
    const C8 = 4186.0;

    const startIdx = Math.floor(C2 / f0);
    const endIdx = Math.ceil(C8 / f0);

    for (let i = startIdx; i <= endIdx; i++) {
      let v = dataArray[i];
      const f = f0 * i;
      const d = (C2 * RADIUS) / f;
      const arg = Math.PI / 2 - 2 * Math.PI * fractionalPart(Math.log2(f / C2));

      const point = rightToLeftCoord(d * Math.cos(arg), d * Math.sin(arg));

      canvasCtx.fillStyle = `rgb(${v}, ${v}, ${v})`;
      canvasCtx.beginPath();
      canvasCtx.ellipse(point.x, point.y, 6, 6, 0, 0, Math.PI * 2);
      canvasCtx.fill();
    }

    const alpha0 = Math.PI / 6;
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = "rgb(170, 170, 170)";
    for (let i = 0; i < 6; i++) {
      const rad = alpha0 * i;
      const start = rightToLeftCoord(
        RADIUS * Math.cos(rad),
        RADIUS * Math.sin(rad)
      );
      const end = rightToLeftCoord(
        RADIUS * Math.cos(rad + Math.PI),
        RADIUS * Math.sin(rad + Math.PI)
      );
      canvasCtx.beginPath();
      canvasCtx.moveTo(start.x, start.y);
      canvasCtx.lineTo(end.x, end.y);
      canvasCtx.stroke();
    }
  }
}
