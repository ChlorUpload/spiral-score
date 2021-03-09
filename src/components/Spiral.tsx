import { Slider, Space, Typography } from "antd";
import { createRef, RefObject, useEffect, useState } from "react";
import DecimalStep from "./DecimalStep";

type Props = {
  stream: MediaStream;
};

const RADIUS = 250;
const PADDING = 50;
let g_roc = 0;
let g_ratio = 0;

const ratioTocolor = (ratio: number) => {
  var r = 0;
  var g = 0;
  var b = 0;
  if (ratio < 0.5) {
    r = 239;
    g = Math.round(510 * ratio);
    b = 80;
  } else {
    r = Math.round(510 - 510 * ratio);
    g = 161;
    b = 14;
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return "#" + ("000000" + h.toString(16)).slice(-6);
};

export default function Spiral({ stream }: Props) {
  const ref = createRef<HTMLCanvasElement>();
  const [roc, setRoc] = useState(0);
  const [ratio, setRatio] = useState(0);

  const changeRoc = (roc: number) => {
    setRoc(roc);
    g_roc = roc;
  };

  const changeRatio = (ratio: number) => {
    setRatio(ratio);
    g_ratio = ratio;
  };

  useEffect(() => {
    g_roc = 0;
    g_ratio = 0;
  }, []);

  useEffect(() => {
    if (ref.current !== null) {
      const canvasCtx = ref.current.getContext("2d");
      if (canvasCtx !== null) {
        visualize(stream, canvasCtx);
      }
    }
  }, [ref.current, stream]);

  return (
    <Space direction="vertical" size={20} align="center">
      <Space size={10} align="center">
        <Typography.Text>유리함수 {"<->"} 일차함수</Typography.Text>
        <DecimalStep value={ratio} onChange={changeRatio}></DecimalStep>
      </Space>
      <Space size={10} align="center">
        <Typography.Text>ROC</Typography.Text>
        <DecimalStep value={roc} onChange={changeRoc}></DecimalStep>
      </Space>
      <canvas
        ref={ref}
        width={`${(RADIUS + PADDING) * 2}px`}
        height={`${(RADIUS + PADDING) * 2}px`}
      ></canvas>
    </Space>
  );
}

const visualize = (
  stream: MediaStream,
  canvasCtx: CanvasRenderingContext2D
) => {
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
    x: x + RADIUS + PADDING,
    y: RADIUS + PADDING - y,
  });

  const C2 = 65.4;
  const C8 = 4186.0;

  const rational = (f: number) => ((1 - g_roc) * (C2 / f) + g_roc) * RADIUS;
  const linear = (f: number) =>
    (((C2 / C8 - 1) * (f - C2)) / (C8 - C2) + 1) * RADIUS;

  draw();

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = ratioTocolor(0);
    canvasCtx.beginPath();
    canvasCtx.lineWidth = 1;
    canvasCtx.ellipse(
      RADIUS + PADDING,
      RADIUS + PADDING,
      RADIUS + PADDING,
      RADIUS + PADDING,
      0,
      0,
      2 * Math.PI
    );
    canvasCtx.fill();

    const f0 = sampleRate / fftSize;

    const startIdx = Math.floor(C2 / f0);
    const endIdx = Math.ceil(C8 / f0);

    canvasCtx.shadowBlur = 20;

    for (let i = startIdx; i <= endIdx; i++) {
      let v = dataArray[i] / 256;
      const f = f0 * i;

      const d = rational(f) * (1 - g_ratio) + linear(f) * g_ratio;
      const arg = Math.PI / 2 - 2 * Math.PI * fractionalPart(Math.log2(f / C2));

      const point = rightToLeftCoord(d * Math.cos(arg), d * Math.sin(arg));

      // draw circle in the left to the canvas

      canvasCtx.fillStyle = ratioTocolor(v * v);
      canvasCtx.shadowColor = ratioTocolor(v * v);
      canvasCtx.beginPath();
      canvasCtx.arc(point.x, point.y, 5, 0, Math.PI * 2, true);
      canvasCtx.closePath();
      canvasCtx.fill();
    }

    canvasCtx.shadowBlur = 0;

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
};
