import React, { Component } from "react";
import {
  Dimensions,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";
import COLORS from "../../../../constants/COLORS";
import RealtimeAI from "../../../../api/RealtimeAI";

export default class RealtimeAIModal extends Component {
  constructor(props) {
    super(props);
    const { width, height } = Dimensions.get("window");
    this.windowWidth = width;
    this.windowHeight = height;
    const module = this.props.module;
    console.log("RealtimeAIModalScreen", module);
    this.realtimeAI = new RealtimeAI({ moduleContent: module.content });
    this.state = {
      mode: "speech", // 'speech' or 'text'
      textPrompt: "",
      chatLog: []
    };
  }

  toggleMode = () => {
    this.setState(prevState => ({
      mode: prevState.mode === "speech" ? "text" : "speech"
    }));
  };

  handleSendText = async () => {
    const { textPrompt, chatLog } = this.state;
    if (textPrompt.trim() === "") return;
    // Append user message to chat log
    await this.realtimeAI.initializeForChat(); // Ensure connection is ready


    this.setState({ chatLog: [...chatLog, { sender: "User", text: textPrompt }] });


    // Build and send a conversation item event
    const userEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: textPrompt
          }
        ]
      }
    };
    this.realtimeAI.sendData(JSON.stringify(userEvent));

    // Trigger a text-only response from the model
    const responseEvent = {
      type: "response.create",
      response: {
        modalities: ["text"]
      }
    };
    this.realtimeAI.sendData(JSON.stringify(responseEvent));

    this.setState({ textPrompt: "" });
  };

  render() {
    const { mode, textPrompt, chatLog } = this.state;

    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={this.props.onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            {/* Speech Controls */}
            <TouchableOpacity
              onPress={() => this.realtimeAI.start()}
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.realtimeAI.stop()}
              style={[styles.controlButton, styles.stopButton]}
            >
              <Text style={styles.controlButtonText}>Stop</Text>
            </TouchableOpacity>
            {/* Toggle between Speech and Text */}
            <TouchableOpacity
              onPress={this.toggleMode}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {mode === "speech" ? "Text" : "Speech"}
              </Text>
            </TouchableOpacity>
            {/* Close Modal */}
            <TouchableOpacity
              onPress={this.props.onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          {mode === "text" && (
            <View style={styles.chatContainer}>
              <View style={styles.chatLog}>
                {chatLog.map((msg, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.chatMessage,
                      msg.sender === "User"
                        ? styles.userMessage
                        : styles.aiMessage
                    ]}
                  >
                    {msg.sender}: {msg.text}
                  </Text>
                ))}
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor="#888"
                  value={"Can you change this so that you add another child to the types of p2p communication for more clarification, ensure the response is in json format? :{'id': 'root', 'label': '1CS4402 – Parallel Computing\\\\nLecture 2: MPI Overview', 'children': [{'id': 'child1', 'label': 'MPI – Getting Started', 'children': [{'id': 'child1_1', 'label': 'What is MPI?\\\\nMPI = Message Passing\\\\nInterface An Interface Specification', 'children': [{'id': 'child1_1_1', 'label': 'MPI is not a library, but a specification for message passing libraries.\\\\nIt defines standards for writing message passing programs aimed at practicality,\\\\nportability, efficiency, and flexibility.'}]}, {'id': 'child1_2', 'label': 'MPI Programming\\\\nModel: SPMD (Single Program Multiple Data)', 'children': [{'id': 'child1_2_1', 'label': 'MPI supports distributed and shared memory systems, making it applicable\\\\nto various parallel architectures like SMP clusters and massively parallel machines.\\\\nAll parallelism must be explicitly managed by the programmer.'}]}]}, {'id': 'child2', 'label': 'MPI Basic Concepts', 'children': [{'id': 'child2_1', 'label': 'Basic MPI Programming\\\\nStructure', 'children': [{'id': 'child2_1_1', 'label': 'A typical MPI program structure includes setup and initialization of the MPI environment,\\\\nacquisition of MPI basic elements like size and rank, execution of parallel work,\\\\nand finalization of the MPI environment.'}]}, {'id': 'child2_2', 'label': 'Environment Management\\\\nRoutines', 'children': [{'id': 'child2_2_1', 'label': 'Important routines include MPI_Init and MPI_Finalize for managing the runtime,\\\\nMPI_Comm_size and MPI_Comm_rank for process information,\\\\nand MPI_Wtime for timing.'}]}]}, {'id': 'child3', 'label': 'Point-to-Point Communication', 'children': [{'id': 'child3_1', 'label': 'P2P Communication\\\\nBasics', 'children': [{'id': 'child3_1_1', 'label': 'MPI point-to-point communication involves direct data exchange between two MPI processes.\\\\nThis is handled using MPI_Send and MPI_Recv, with variations for\\\\nasynchronous and buffered communications.'}]}, {'id': 'child3_2', 'label': 'Types of P2P\\\\nCommunication', 'children': [{'id': 'child3_2_1', 'label': 'Different types of send/receive operations include blocking, non-blocking,\\\\nsynchronous, and combined operations, each serving different use cases\\\\nand providing different levels of control over communication.'}]}]}]}\","}
                  onChangeText={(text) => this.setState({ textPrompt: text })}
                />
                <TouchableOpacity
                  onPress={this.handleSendText}
                  style={styles.sendButton}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  header: {
    flexDirection: "row",
    backgroundColor: COLORS.MAROON_LIGHT,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  controlButton: {
    width: this && this.windowWidth ? this.windowWidth * 0.2 : 70,
    height: this && this.windowHeight ? this.windowHeight * 0.1 : 70,
    backgroundColor: COLORS.MAROON,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 8
  },
  stopButton: {
    backgroundColor: "red"
  },
  controlButtonText: {
    fontSize: 16,
    color: "#fff"
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#0275D8",
    borderRadius: 8,
    marginLeft: 8
  },
  toggleButtonText: {
    fontSize: 16,
    color: "#fff"
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 6,
    backgroundColor: "gray",
    borderRadius: 4
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14
  },
  chatContainer: {
    backgroundColor: "#fff",
    padding: 16,
    maxHeight: this && this.windowHeight ? this.windowHeight * 0.4 : 200
  },
  chatLog: {
    flex: 1,
    marginBottom: 12
  },
  chatMessage: {
    fontSize: 16,
    marginVertical: 4
  },
  userMessage: {
    textAlign: "right",
    color: "#0275D8"
  },
  aiMessage: {
    textAlign: "left",
    color: "#333"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8
  },
  sendButton: {
    backgroundColor: COLORS.MAROON,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
