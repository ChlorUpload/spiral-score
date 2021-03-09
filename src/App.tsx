import styled from "styled-components";
import { Button, Space, Radio, Typography, Switch, Spin, Result } from "antd";
import React, { useEffect, useState } from "react";
import Record from "./utils/Record";
import Wave from "./components/Wave";
import Frequency from "./components/Frequency";
import Spiral from "./components/Spiral";

const Layout = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  flex-direction: column;
`;

const Controller = styled.div`
  background-color: black;
  padding: 15px;
  color: white;
`;

type RadioDomain = "wave" | "frequency" | "spiral";

function App() {
  const [radioValue, setRadioValue] = useState<RadioDomain>("wave");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [record, setRecord] = useState<Record | null>(null);

  useEffect(() => {
    setRecord(
      new Record((strm) => {
        setStream(strm);
      })
    );
  }, []);

  return (
    <Layout>
      <Controller>
        <Space size={30}>
          <Button
            type="primary"
            danger={stream !== null}
            onClick={() => {
              if (record !== null) {
                if (stream === null) {
                  record.start();
                } else {
                  record.stop();
                }
                setStream(record.stream);
              }
            }}
          >
            {stream === null ? (
              <Typography.Text style={{ color: "white" }}>
                녹음 시작
              </Typography.Text>
            ) : (
              <Typography.Text style={{ color: "white" }}>
                녹음 중지
              </Typography.Text>
            )}
          </Button>
          <Space size={4} direction="vertical">
            <Typography.Text style={{ color: "white" }}>
              데이터를 변환할 도메인을 선택하세요
            </Typography.Text>
            <Radio.Group
              onChange={(e) => {
                setRadioValue(e.target.value);
              }}
              value={radioValue}
            >
              <Radio value="wave" style={{ color: "white" }}>
                시간 도메인
              </Radio>
              <Radio value="frequency" style={{ color: "white" }}>
                주파수 도메인
              </Radio>
              <Radio value="spiral" style={{ color: "white" }}>
                나선 도메인
              </Radio>
            </Radio.Group>
          </Space>
        </Space>
      </Controller>
      <Main>
        {stream === null ? (
          <Result
            title="MediaStream을 찾을 수 없습니다."
            extra="화면 상단의 '녹음 시작' 버튼을 눌러 녹음을 시작해주세요."
          ></Result>
        ) : (
          (() => {
            switch (radioValue) {
              case "wave":
                return <Wave stream={stream}></Wave>;
              case "frequency":
                return <Frequency stream={stream}></Frequency>;
              case "spiral":
              default:
                return <Spiral stream={stream}></Spiral>;
            }
          })()
        )}
      </Main>
    </Layout>
  );
}

export default App;
