import React, { Component } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Svg, { Rect, Text as SvgText, TSpan, Path, G, Defs, Marker } from 'react-native-svg';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import COLORS from '../../../../constants/COLORS';
import JSON5 from 'json5';
import BackArrow from "../../../../util/BackArrow";
import { updateUserProgress } from "../../../../api/updateUserProgress";
import { SessionContext } from "../../../../util/SessionContext";

const chalkColors = ["#264653", "#2A9D8F", "#F4A261", "#E76F51", "#F7C948"];

const getContrastColor = (hexColor) => {
  const color = hexColor.charAt(0) === '#' ? hexColor.slice(1) : hexColor;
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "#fff" : "#000";
};

const HORIZONTAL_SPACING = 350;
const ROOT_HORIZONTAL_SPACING = 550;
const VERTICAL_SPACING = 250;

const getTextDimensions = (text, fontSize = 18, padding = 25, isRoot = false) => {
  const lines = text.split('\n');
  const lineCount = lines.length;
  const avgCharWidth = fontSize * 0.6;
  const maxLineLength = Math.max(...lines.map(line => line.length));
  const baseWidth = maxLineLength * avgCharWidth + padding;
  const width = isRoot ? baseWidth * 1 : baseWidth;
  const height = (lineCount * (fontSize + 2) + padding) * (isRoot ? 1.8 : 1);
  return { width, height };
};

const getTreeBounds = (nodes) => {
  const xs = nodes.map(node => node.x);
  const ys = nodes.map(node => node.y - node.height / 2);
  const xMaxs = nodes.map(node => node.x + node.width);
  const yMaxs = nodes.map(node => node.y + node.height / 2);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xMaxs),
    maxY: Math.max(...yMaxs),
  };
};

const layoutTree = (node, depth = 0, yOffsetRef = { current: 0 }) => {
  node.depth = depth;
  node.x = depth === 0 ? 0 : (depth - 1) * HORIZONTAL_SPACING + ROOT_HORIZONTAL_SPACING;

  const isRoot = depth === 0;
  const fontSize = isRoot ? 36 : 18;
  const padding = isRoot ? 40 : 25;
  const { width, height } = getTextDimensions(node.label, fontSize, padding, isRoot);
  node.width = width;
  node.height = height;

  if (node.children && node.children.length > 0) {
    const childYOffsets = { current: yOffsetRef.current };
    node.children.forEach(child => layoutTree(child, depth + 1, childYOffsets));
    const childHeights = node.children.map(child => child.y);
    const minChildY = Math.min(...childHeights);
    const maxChildY = Math.max(...childHeights);
    node.y = (minChildY + maxChildY) / 2;
    yOffsetRef.current = maxChildY + VERTICAL_SPACING;
  } else {
    node.y = yOffsetRef.current + height / 2;
    yOffsetRef.current += VERTICAL_SPACING;
  }
};

const flattenTree = (node) => {
  const nodes = [];
  const edges = [];
  const traverse = (current) => {
    nodes.push(current);
    if (current.children && current.children.length > 0) {
      current.children.forEach(child => {
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

function insertNewLinesByWidth(label, maxWidth, fontSize = 18, isRoot = false) {
  const words = label.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';
  const approxCharWidth = fontSize * 0.6;
  const effectiveMaxWidth = isRoot ? maxWidth * 0.4 : maxWidth; // Tighter for root (2 words)

  if (isRoot) {
    // Force 2 words per line for root
    for (let i = 0; i < words.length; i += 2) {
      lines.push(words.slice(i, i + 2).join(' '));
    }
  } else {
    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (testLine.length * approxCharWidth > effectiveMaxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
  }
  return lines.join('\n');
}

function transformLabels(data, depth = 0) {
  if (Array.isArray(data)) {
    data.forEach(item => transformLabels(item, depth + 1));
  } else if (data && typeof data === 'object') {
    for (const key in data) {
      if (key === 'label' && typeof data[key] === 'string') {
        data[key] = insertNewLinesByWidth(data[key], 250, depth === 0 ? 36 : 18, depth === 0);
      } else {
        transformLabels(data[key], depth + 1);
      }
    }
  }
}

class GraphDiagram extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const { submodule } = this.props.route.params;
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;

    let parsedMindMap = null;
    try {
      parsedMindMap = JSON5.parse(submodule.lessonData);
    } catch (e) {
      console.log('Error parsing mind map data:', e);
    }

    this.treeData = parsedMindMap ? JSON.parse(JSON.stringify(parsedMindMap)) : {};
    transformLabels(this.treeData);
    layoutTree(this.treeData);
    const { nodes, edges } = flattenTree(this.treeData);
    this.nodes = nodes;
    this.edges = edges;

    const bounds = getTreeBounds(this.nodes);
    const treeWidth = bounds.maxX - bounds.minX;
    const treeHeight = bounds.maxY - bounds.minY;
    const padding = 200;
    this.virtualCanvasWidth = Math.max(this.windowWidth, treeWidth + 2 * padding);
    this.virtualCanvasHeight = Math.max(this.windowHeight, treeHeight + 2 * padding);

    const offsetX = (this.virtualCanvasWidth - treeWidth) / 2 - bounds.minX;
    const offsetY = (this.virtualCanvasHeight - treeHeight) / 2 - bounds.minY;
    this.nodes.forEach(node => {
      node.x += offsetX;
      node.y += offsetY;
    });

    const initialElapsedTime = submodule.progress?.lastTime || 0;
    this.state = {
      elapsedTime: initialElapsedTime,
      showModal: false,
      hasNavigated: false,
    };
  }

  componentDidMount() {
    this.progressTimer = setInterval(() => {
      this.setState(
        prevState => ({ elapsedTime: prevState.elapsedTime + 10 }),
        () => this.handleProgressUpdate(this.state.elapsedTime, 60)
      );
    }, 10000);
  }

  componentWillUnmount() {
    if (this.progressTimer) clearInterval(this.progressTimer);
  }

  handleProgressUpdate = async (currentTime, duration) => {
    const { submodule } = this.props.route.params;
    const { session } = this.context;

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

    const updatedModules = session.modules.map(mod =>
      mod.id === submodule.moduleId
        ? {
          ...mod,
          submodules: mod.submodules.map(sub =>
            sub.id === submodule.id
              ? {
                ...sub,
                progress: {
                  ...sub.progress,
                  lastTime: currentTime,
                  lastUpdated: now,
                  completionDate,
                  completionPercentage,
                  progressStatus,
                },
              }
              : sub
          ),
        }
        : mod
    );
    this.context.setSession({ ...session, modules: updatedModules });

    try {
      await updateUserProgress(
        [{
          id: submodule.id,
          completionPercentage: Math.min((currentTime / duration) * 100, 100),
          lastUpdated: now,
          completionDate,
          lastTime: currentTime,
          progressStatus,
        }],
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
    const fill = chalkColors[node.depth % chalkColors.length];
    const textFill = getContrastColor(fill);

    const isRoot = node.depth === 0;
    const fontSize = isRoot ? 36 : 18;
    const padding = isRoot ? 40 : 25;
    const { width, height } = getTextDimensions(node.label, fontSize, padding, isRoot);

    node.width = width;
    node.height = height;

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
          y={node.y - (lines.length - 1) * (isRoot ? 18 : 10)}
          fill={textFill}
          fontSize={fontSize}
          fontWeight="normal"
          textAnchor="middle"
        >
          {lines.map((line, index) => (
            <TSpan key={index} x={node.x + node.width / 2} dy={index === 0 ? 0 : (isRoot ? 36 : 20)}>
              {line}
            </TSpan>
          ))}
        </SvgText>
      </G>
    );
  };

  render() {
    const scaleFactor = 2;
    const svgWidth = this.windowWidth * scaleFactor;
    const svgHeight = this.windowHeight * scaleFactor;
    const { submodule, module } = this.props.route.params;

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.BLACK_LIGHT }}>
        <BackArrow
          title={submodule.name}
          color="#fff"
          AIModal={true}
          module={module}
        />
        <ReactNativeZoomableView
          maxZoom={4}
          minZoom={0.2}
          zoomStep={0.5}
          contentWidth={this.virtualCanvasWidth}
          contentHeight={this.virtualCanvasHeight}
          style={{
            backgroundColor: COLORS.BLACK_LIGHT,
          }}
        >
          <Svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${this.virtualCanvasWidth} ${this.virtualCanvasHeight}`}
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
            <G id="nodes">{this.nodes.map(node => this.renderNode(node))}</G>
            <G id="edges">
              {this.edges.map((edge, idx) => (
                <Path
                  key={`edge-${idx}`}
                  d={getCurvePath(edge.from, edge.to)}
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrow)"
                />
              ))}
            </G>
          </Svg>
        </ReactNativeZoomableView>
      </View>
    );
  }
}

export default GraphDiagram;