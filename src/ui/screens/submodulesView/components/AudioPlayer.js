import React, { Component } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";
import SoundPlayer from "react-native-sound-player";
import Slider from "@react-native-community/slider";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import WordFade from "./WordFade";

class AudioPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: 0,
      currentTime: 0,
      isPaused: true,
      allWords: [],
    };

    this.intervalRef = null;
    this.progressInterval = null;
    this.scrollViewRef = null;
  }

  componentDidMount() {
    const { audioUrl, onProgressUpdate } = this.props;

    try {
      SoundPlayer.loadUrl(audioUrl);
    } catch (error) {
      console.log("Error loading audio:", error);
    }

    this.intervalRef = setInterval(async () => {
      try {
        const info = await SoundPlayer.getInfo();
        if (info) {
          this.setState({ currentTime: info.currentTime, duration: info.duration });
        }
      } catch (err) {
        console.log("Error getting audio info:", err);
      }
    }, 500);

    this.progressInterval = setInterval(() => {
      if (!this.state.isPaused) {
        onProgressUpdate(this.state.currentTime, this.state.duration);
      }
    }, 10000);
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentTime, allWords } = this.state;
    const { transcript } = this.props;

    if (!transcript || !transcript.words || !Array.isArray(transcript.words)) {
      console.log("Transcript is invalid or missing words:", transcript);
      return;
    }

    if (currentTime !== prevState.currentTime) {
      const newWords = transcript.words.filter((w) => {
        const fadeInTime = w.start - 0.5; // Show 0.5s early
        const adjustedEnd = w.start === w.end ? w.end + 0.5 : w.end + (w.end - w.start);
        return (
          w &&
          !allWords.some((aw) => aw.start === w.start) &&
          currentTime >= fadeInTime &&
          currentTime < adjustedEnd + 1
        );
      });

      if (newWords.length > 0) {
        this.setState(
          (prevState) => ({
            allWords: [...prevState.allWords, ...newWords],
          }),
          () => {
            if (this.scrollViewRef) {
              this.scrollViewRef.scrollToEnd({ animated: true });
            }
          }
        );
      }
    }
  }

  componentWillUnmount() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
    clearInterval(this.progressInterval);
    SoundPlayer.stop();
  }

  playAudio = () => {
    try {
      SoundPlayer.play();
      this.setState({ isPaused: false });
    } catch (error) {
      console.log("Cannot play the sound file:", error);
    }
  };

  pauseAudio = () => {
    try {
      SoundPlayer.pause();
      this.setState({ isPaused: true });
    } catch (error) {
      console.log("Cannot pause the sound file:", error);
    }
  };

  togglePauseResume = () => {
    const { isPaused } = this.state;
    if (isPaused) {
      this.playAudio();
    } else {
      this.pauseAudio();
    }
  };

  handleSeek = (value) => {
    try {
      SoundPlayer.seek(value);
      this.setState({ currentTime: value });
    } catch (error) {
      console.log("Cannot seek in the sound file:", error);
    }
  };

  formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  render() {
    const { duration, currentTime, isPaused, allWords } = this.state;
    const { width } = this.props;
    const timeLeft = duration - currentTime;

    return (
      <View
        style={{
          paddingBottom: width * 0.15,
          alignItems: "center",
          justifyContent: "space-around"
      }}>
        <ScrollView
          style={{
            maxHeight: 200,
            width: width * 0.8,
        }}
          showsVerticalScrollIndicator={false}
          ref={(ref) => (this.scrollViewRef = ref)}
          onContentSizeChange={() => this.scrollViewRef.scrollToEnd({ animated: true })}
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {allWords.map((word, index) => (
            word && word.start && word.end ? (
              <WordFade
                key={`${word.start}-${index}`}
                text={word.word}
                width={width}
                isActive={currentTime >= word.start && currentTime < word.end}
              />
            ) : null
          ))}
        </ScrollView>

        <View
          style={{
            width: width * 0.9,
            flexDirection: "column",
            alignItems: "center",
            marginTop: width * 0.3,
          }}
        >
          <Slider
            style={{ width: "100%" }}
            minimumValue={0}
            maximumValue={duration}
            step={0.1}
            value={currentTime}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#fff"
            onSlidingComplete={this.handleSeek}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: width * 0.8,
              marginTop: 5,
            }}
          >
            <Text style={{ color: "#fff" }}>{this.formatTime(currentTime)}</Text>
            <Text style={{ color: "#fff" }}>{this.formatTime(timeLeft)}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginTop: 20,
            width: width * 0.6,
          }}
        >
          <TouchableOpacity
            onPress={() => this.handleSeek(currentTime - 15)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
            }}
          >
            <Text style={{ marginRight: 5, color: "#fff" }}>15s</Text>
            <FontAwesome6 name="rotate-left" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.togglePauseResume}
            style={{
              borderRadius: 50,
              paddingHorizontal: 15,
              paddingVertical: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={isPaused ? "play-circle-sharp" : "pause-circle-sharp"}
              size={80}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.handleSeek(currentTime + 15)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
            }}
          >
            <FontAwesome6 name="rotate-right" size={30} color="#fff" />
            <Text style={{ marginLeft: 5, color: "#fff" }}>15s</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  controlButton: {},
  playPauseButton: {},
});

export default AudioPlayer;