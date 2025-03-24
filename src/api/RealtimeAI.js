import { RTCPeerConnection, mediaDevices } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { Component } from "react";

export default class RealtimeAI extends Component {
  constructor(props) {
    super(props);
    this.pc = null;
    this.dc = null;
    this.moduleContent = props.moduleContent;
  }

  start = async () => {
    try {
      console.log("RealtimeAI props:", this.props);
      const tokenResponse = await fetch("http://127.0.0.1:8000/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: this.moduleContent }),
      });
      const data = await tokenResponse.json();

      const EPHEMERAL_KEY =
        data.client_secret && data.client_secret.value
          ? data.client_secret.value
          : data.client_secret;
      if (!EPHEMERAL_KEY) {
        throw new Error("Ephemeral key missing in token response");
      }

      // 2. Create RTCPeerConnection and store it
      this.pc = new RTCPeerConnection();

      // 3. Handle remote audio tracks
      this.pc.ontrack = (event) => {
        console.log("Received remote stream", event.streams[0]);
      };

      // 4. Capture local audio from the microphone
      const stream = await mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        this.pc.addTrack(track, stream);
      });

      // 5. Create a data channel for sending/receiving text/chat events
      const dc = this.pc.createDataChannel("oai-events");
      this.dc = dc;
      dc.onmessage = (e) => {
        console.log("Received event:", e.data);
      };

      // 6. Create an SDP offer and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // 7. Send the SDP offer to OpenAI's realtime endpoint
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });
      const answerSdp = await sdpResponse.text();
      await this.pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      console.log("Realtime AI connection established.");
    } catch (error) {
      console.error("Error establishing realtime AI connection:", error);
    }
  };
  startText = async () => {
    try {
      console.log("RealtimeAI props:", this.props);
      // 1. Get an ephemeral key from your backend
      const tokenResponse = await fetch("http://127.0.0.1:8000/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: this.moduleContent }),
      });
      const data = await tokenResponse.json();
      // Token response can be in two shapes:
      // { client_secret: { value: "TOKEN" } } or { client_secret: "TOKEN" }
      const EPHEMERAL_KEY =
        data.client_secret && data.client_secret.value
          ? data.client_secret.value
          : data.client_secret;
      if (!EPHEMERAL_KEY) {
        throw new Error("Ephemeral key missing in token response");
      }

      // 2. Create RTCPeerConnection and store it
      this.pc = new RTCPeerConnection();

      // 3. Handle remote audio tracks
      this.pc.ontrack = (event) => {
        console.log("Received remote stream", event.streams[0]);
      };

      // 4. Capture local audio from the microphone
      const stream = await mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        this.pc.addTrack(track, stream);
      });

      // 5. Create a data channel for sending/receiving text/chat events
      const dc = this.pc.createDataChannel("oai-events");
      this.dc = dc;
      dc.onmessage = (e) => {
        console.log("Received event:", e.data);
        // (You can parse and handle incoming text/chat messages here.)
      };

      // 6. Create an SDP offer and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // 7. Send the SDP offer to OpenAI's realtime endpoint
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });
      const answerSdp = await sdpResponse.text();
      await this.pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      console.log("Realtime AI connection established.");
    } catch (error) {
      console.error("Error establishing realtime AI connection:", error);
    }
  };

  // Stop the connection and cleanup
  stop = () => {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
      this.dc = null;
      console.log("Realtime AI connection stopped.");
    }
    InCallManager.stop();
  };

  // Ensure connection is initialized before chat events
  initializeForChat = async () => {
    if (!this.pc) {
      await this.startText();
    }
  };

  // Send a message via the data channel
  sendData = (message) => {
    if (this.dc) {
      this.dc.send(message);
    } else {
      console.error("Data channel not initialized. Can't send message:", message);
    }
  };
}
