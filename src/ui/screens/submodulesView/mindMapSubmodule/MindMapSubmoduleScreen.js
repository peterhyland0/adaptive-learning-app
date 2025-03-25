import React, { Component } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Svg, { Rect, Text as SvgText, TSpan, Path, G, Defs, Marker } from 'react-native-svg';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import COLORS from '../../../../constants/COLORS';
import JSON5 from 'json5';
import BackArrow from "../../../../util/BackArrow";
import { updateUserProgress } from "../../../../api/updateUserProgress";
import { SessionContext } from "../../../../util/SessionContext";

// Chalk color palette (feel free to adjust these values)
const chalkColors = [
  "#264653",
  "#2A9D8F",
  "#F4A261",
  "#E76F51",
  "#F7C948",
];

// Helper to pick a contrasting text color based on the fill
const getContrastColor = (hexColor) => {
  const color = hexColor.charAt(0) === '#' ? hexColor.slice(1) : hexColor;
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "#fff" : "#000";
};

// Spacing constants for layout
const horizontalSpacing = 350;
const verticalSpacing = 250;

// A helper function to compute approximate text dimensions.
const getTextDimensions = (text, fontSize = 14, padding = 20) => {
  const lines = text.split('\n');
  const lineCount = lines.length;
  const avgCharWidth = fontSize * 0.6;
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const width = maxLineLength * avgCharWidth + padding;
  const height = lineCount * (fontSize + 2) + padding;
  return { width, height };
};

// Recursive layout function that assigns x, y coordinates and depth to each node.
const layoutTree = (node, depth = 0, yOffsetRef = { current: 50 }) => {
  node.depth = depth;
  node.x = depth * horizontalSpacing + 200;
  if (!node.width || !node.height) {
    const { width, height } = getTextDimensions(node.label);
    node.width = width;
    node.height = height;
  }
  if (node.children && node.children.length > 0) {
    const startY = yOffsetRef.current;
    node.children.forEach((child) => {
      layoutTree(child, depth + 1, yOffsetRef);
    });
    const endY = yOffsetRef.current - verticalSpacing;
    node.y = (startY + endY) / 2;
  } else {
    node.y = yOffsetRef.current;
    yOffsetRef.current += verticalSpacing;
  }
};

// Convert the tree structure into flat arrays of nodes and edges.
const flattenTree = (node) => {
  const nodes = [];
  const edges = [];
  const traverse = (current) => {
    nodes.push(current);
    if (current.children && current.children.length > 0) {
      current.children.forEach((child) => {
        edges.push({ from: current, to: child });
        traverse(child);
      });
    }
  };
  traverse(node);
  return { nodes, edges };
};

const getCurvePath = (from, to) => {
  const startX = from.x + from.width;
  const startY = from.y;
  const endX = to.x - 10;
  const endY = to.y;
  const cp1x = startX + 40;
  const cp1y = startY;
  const cp2x = endX - 40;
  const cp2y = endY;
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
};

const getMaxDepth = (node, depth = 0) => {
  if (!node.children || node.children.length === 0) return depth;
  return Math.max(...node.children.map((child) => getMaxDepth(child, depth + 1)));
};

// Helper functions to transform JSON data (inserts newline after words)
function insertNewLinesByWidth(label, maxWidth, fontSize = 14) {
  const words = label.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';
  const approxCharWidth = fontSize * 0.6;
  words.forEach(word => {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (testLine.length * approxCharWidth > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
        currentLine = '';
      }
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.join('\n');
}

function transformLabels(data) {
  if (Array.isArray(data)) {
    data.forEach((item) => transformLabels(item));
  } else if (data !== null && typeof data === 'object') {
    for (const key in data) {
      if (key === 'label' && typeof data[key] === 'string') {
        data[key] = insertNewLinesByWidth(data[key], 250);
      } else {
        transformLabels(data[key]);
      }
    }
  }
}

class GraphDiagram extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const { submodule } = this.props.route.params;
    console.log("submodule mind map:", submodule.lessonData);
    let parsedMindMap = null;
    try {
      parsedMindMap = JSON5.parse(submodule.lessonData);
    } catch (e) {
      console.log('Error parsing mind map data:', e);
    }

    if (parsedMindMap) {
      transformLabels(parsedMindMap);
      this.treeData = parsedMindMap;
    } else {
      this.treeData = {};
    }

    // Create a deep copy so that layout modifications do not affect the original object.
    this.treeData = JSON.parse(JSON.stringify(this.treeData));
    layoutTree(this.treeData);
    const { nodes, edges } = flattenTree(this.treeData);
    this.nodes = nodes;
    this.edges = edges;

    const initialElapsedTime =
      submodule.progress && submodule.progress.lastTime
        ? submodule.progress.lastTime
        : 0;
    this.state = {
      elapsedTime: initialElapsedTime,
      showModal: false,
      hasNavigated: false,
    };
  }

  componentDidMount() {
    // Set up an interval to update progress every 10 seconds.
    this.progressTimer = setInterval(() => {
      this.setState(
        (prevState) => ({ elapsedTime: prevState.elapsedTime + 10 }),
        () => {
          // Use 60 seconds as the fixed denominator for calculating completion percentage.
          this.handleProgressUpdate(this.state.elapsedTime, 60);
        }
      );
    }, 10000);
  }

  componentWillUnmount() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }

  handleProgressUpdate = async (currentTime, duration) => {
    console.log("Updating progress for mind map:", currentTime, duration);
    const { submodule } = this.props.route.params;
    const { session } = this.context;

    // Calculate completion percentage based on fixed duration (60 seconds)
    let completionPercentage = (currentTime / duration) * 100;
    let progressStatus = "Not Started";
    if (completionPercentage >= 95) {
      completionPercentage = 100;
      progressStatus = "Completed";
    } else {
      completionPercentage = Math.round(completionPercentage);
      progressStatus = "In Progress";
    }
    const now = new Date().toISOString();
    const completionDate = completionPercentage === 100 ? now : null;

    // Update the local session state
    const updatedModules = session.modules.map((mod) =>
      mod.id === submodule.moduleId
        ? {
          ...mod,
          submodules: mod.submodules.map((sub) =>
            sub.id === submodule.id
              ? {
                ...sub,
                progress: {
                  ...sub.progress,
                  lastTime: currentTime,
                  lastUpdated: now,
                  completionDate: (currentTime / duration) >= 0.99 ? now : null,
                  completionPercentage: completionPercentage,
                  progressStatus: progressStatus,
                },
              }
              : sub
          ),
        }
        : mod
    );
    this.context.setSession({ ...session, modules: updatedModules });

    // Update Firestore
    try {
      await updateUserProgress(
        [
          {
            id: submodule.id,
            completionPercentage: Math.min((currentTime / duration) * 100, 100),
            lastUpdated: now,
            completionDate: completionDate,
            lastTime: currentTime,
            progressStatus: progressStatus,
          },
        ],
        submodule.moduleId,
        session.userUid
      );
      console.log("Firestore update success");
    } catch (err) {
      console.error("Firestore update failed:", err);
    }
  };

  handleNodePress = (node) => {
    console.log('Node pressed:', node.id);
  };

  renderNode = (node) => {
    const lines = node.label.split('\n');
    // Select a chalk color based on node depth.
    const fill = chalkColors[node.depth % chalkColors.length];
    const textFill = getContrastColor(fill);

    return (
      <G key={node.id} onPress={() => this.handleNodePress(node)}>
        <Rect
          x={node.x}
          y={node.y - node.height / 2}
          width={node.width}
          height={node.height}
          fill={fill}
          stroke="#fff"
          strokeWidth="2"
          rx="5"
          ry="5"
        />
        <SvgText
          x={node.x + node.width / 2}
          y={node.y - (lines.length - 1) * 8}
          fill={textFill}
          fontSize="14"
          fontWeight="normal"
          textAnchor="middle"
        >
          {lines.map((line, index) => (
            <TSpan key={index} x={node.x + node.width / 2} dy={index === 0 ? 0 : 16}>
              {line}
            </TSpan>
          ))}
        </SvgText>
      </G>
    );
  };

  render() {
    const virtualCanvasWidth = 4 * 500; // 2000 pixels wide
    const virtualCanvasHeight = this.treeData.children.length * 900;
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const svgWidth = screenWidth + 200;
    const svgHeight = screenHeight + 200;
    const { submodule, module } = this.props.route.params;

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.BLACK_LIGHT }}>
        <BackArrow
          title={submodule.name}
          color={"#fff"}
          AIModal={true}
          module={module}
        />
        <ReactNativeZoomableView
          maxZoom={5}
          minZoom={0.2}
          zoomStep={0.5}
          contentWidth={virtualCanvasWidth}
          contentHeight={virtualCanvasHeight}
          style={{ width: '100%', height: '100%' }}
        >
          <Svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${virtualCanvasWidth} ${virtualCanvasHeight}`}
          >
            <Defs>
              <Marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="1"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <Path d="M0,0 L0,10 L10,5 Z" fill="#fff" />
              </Marker>
            </Defs>
            {/* Render nodes */}
            <G id="nodes">{this.nodes.map((node) => this.renderNode(node))}</G>
            {/* Render edges */}
            <G id="edges">
              {this.edges.map((edge, idx) => {
                const d = getCurvePath(edge.from, edge.to);
                return (
                  <Path
                    key={`edge-${idx}`}
                    d={d}
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrow)"
                  />
                );
              })}
            </G>
          </Svg>
        </ReactNativeZoomableView>
      </View>
    );
  }
}

export default GraphDiagram;
