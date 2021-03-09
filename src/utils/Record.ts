import { message } from "antd";

export default class Record {
  private bufferSize: number = 0;
  private numInputChannels: number = 0;
  private numOutputChannels: number = 0;
  private chunks: Blob[] = [];
  private onStreamReady: (stream: MediaStream) => void = () => {};

  public mediaRecorder: MediaRecorder | null = null;
  public stream: MediaStream | null = null;

  constructor(onStreamReady: (stream: MediaStream) => void) {
    this.onStreamReady = onStreamReady;
  }

  public start = () => {
    if (!navigator.mediaDevices.getUserMedia) {
      message.error("getUserMedia가 지원되지 않는 환경입니다.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(this._onSuccess, this._onError);
  };

  public stop = () => {
    this.stream?.getTracks().forEach((track) => {
      track.stop();
    });
    this.stream = null;
  };

  private _onSuccess = (stream: MediaStream) => {
    this.stream = stream;
    this.onStreamReady(stream);
  };

  private _onError = (e: any) => {
    console.log(e);
    message.error(
      "녹음 중 에러가 발생했습니다. 자세한 내용은 콘솔을 확인해주세요."
    );
  };
}
