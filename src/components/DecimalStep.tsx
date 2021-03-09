import { InputNumber, Slider, Space } from "antd";
import { useEffect, useState } from "react";

type Props = {
  value?: number;
  onChange?: (value: number) => void;
};

export default function DecimalStep({ value, onChange }: Props) {
  const [step, setStep] = useState(0);
  const min = 0;
  const max = 1;

  useEffect(() => {
    if (value !== undefined) setStep(value);
  }, [value]);

  const onStepChange = (newStep: number) => {
    if (onChange) onChange(newStep);
    setStep(newStep);
  };

  return (
    <Space size={10}>
      <Slider
        style={{
          width: 150,
        }}
        min={min}
        max={max}
        step={0.01}
        onChange={onStepChange}
        value={step}
      ></Slider>
      <InputNumber
        width={100}
        min={min}
        max={max}
        step={0.01}
        value={step}
        onChange={onStepChange}
      />
    </Space>
  );
}
