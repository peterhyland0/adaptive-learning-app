import React, { Component } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
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
      activeWords: [],
      wordRows: [[]],
    };

    this.intervalRef = null;
    this.progressInterval = null;

  }

  componentDidMount() {
    const { audioUrl, onProgressUpdate } = this.props;

    // Load the audio
    try {
      SoundPlayer.loadUrl(audioUrl);
    } catch (error) {
      console.log("Error loading audio:", error);
    }

    // Periodically update `currentTime` and `duration`
    this.intervalRef = setInterval(async () => {
      try {
        const info = await SoundPlayer.getInfo(); // { currentTime, duration }
        if (info) {
          this.setState({ currentTime: info.currentTime, duration: info.duration }, () => {
          });
        }
      } catch (err) {
        console.log("Error getting audio info:", err);
      }
    }, 500);

    // Fix: Use `this.state.duration` instead of outdated `info`
    this.progressInterval = setInterval(() => {
      if (!this.state.isPaused) {
        onProgressUpdate(this.state.currentTime, this.state.duration);
      }
    }, 10000);
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentTime, activeWords, wordRows } = this.state;
    const { transcript } = this.props;

    const DEFAULT_FADE_DURATION = 0.5;
    const EXTEND_MULTIPLIER = 2;
    const MAX_ROWS = 10; // Maximum number of rows allowed


    if (currentTime !== prevState.currentTime) {
      const newWords = transcript.words.filter((w) => {
        const adjustedEnd =
          w.start === w.end
            ? w.end + DEFAULT_FADE_DURATION
            : w.end + (w.end - w.start) * (EXTEND_MULTIPLIER - 1);

        // Ensure the word is not already active or in rows
        return (
          !activeWords.some((aw) => aw.start === w.start) &&
          !wordRows.flat().some((rowWord) => rowWord.start === w.start) &&
          currentTime >= w.start &&
          currentTime < adjustedEnd + 1
        );
      });


      if (newWords.length > 0) {
        this.setState((prevState) => {
          const updatedRows = [...prevState.wordRows];
          const lastRow = updatedRows[updatedRows.length - 1] || [];

          newWords.forEach((word) => {
            if (lastRow.length < 6) {
              lastRow.push(word);
            } else {
              updatedRows.push([word]);
            }
          });
          // Ensure the number of rows does not exceed MAX_ROWS
          while (updatedRows.length > MAX_ROWS) {
            updatedRows.shift(); // Remove the oldest row
          }

          return {
            activeWords: [...prevState.activeWords, ...newWords],
            wordRows: updatedRows,
          };
        });
      }

      const filteredWords = activeWords.filter((w) => {
        const adjustedEnd =
          w.start === w.end
            ? w.end + DEFAULT_FADE_DURATION
            : w.end + (w.end - w.start) * (EXTEND_MULTIPLIER - 1);

        return currentTime < adjustedEnd; // Only keep words not yet expired
      });

      if (filteredWords.length !== activeWords.length) {
        this.setState({ activeWords: filteredWords });
      }

    }
  }


  componentWillUnmount() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
    clearInterval(this.progressInterval);
    console.log(this.progressInterval)
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
    const { duration, currentTime, isPaused, activeWords } = this.state;
    const { width } = this.props;

    const timeLeft = duration - currentTime;

    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        {/* Words Fading Row */}
        <View
          style={{
            flexDirection: "column", // Stack rows vertically
            alignItems: "flex-start", // Align rows to the left
            marginLeft: width * 0.1,
            width: "100%",
            marginTop: 10,
          }}>
          {this.state.wordRows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 5,
              }}>
              {row.map((word, index) => (
                <WordFade
                  key={`${word.start}-${index}`}
                  text={word.word}
                  width={this.windowWidth * 0.8}
                />
              ))}
            </View>
          ))}
        </View>


        {/* Audio Progress UI */}
        <View
          style={{
            width: width * 0.9,
            flexDirection: "column",
            alignItems: "center",
            marginTop: 20,
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

        {/* Controls */}
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
            }}>
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
            }}>
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
            }}>
            <FontAwesome6 name="rotate-right" size={30} color="#fff" />
            <Text style={{ marginLeft: 5, color: "#fff" }}>15s</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wordRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  controlButton: {

  },
  playPauseButton: {

  },


});


export default AudioPlayer;
