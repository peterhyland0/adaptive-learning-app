import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import RealtimeAI from '../../../../api/RealtimeAI';
import COLORS from '../../../../constants/COLORS';

const RealtimeAIButton = ({ module }) => {
  const [isActive, setIsActive] = useState(false); // Recording state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const lottieRef = useRef(null);
  const realtimeAI = useRef(new RealtimeAI({ moduleContent: module?.content || '' })).current;

  const toggleRecording = async () => {
    if (!isActive) {
      try {
        setIsLoading(true); // Start loading
        await realtimeAI.start();
        setIsLoading(false); // Stop loading
        lottieRef.current?.play(); // Play soundwave animation
        setIsActive(true); // Set recording active
      } catch (error) {
        setIsLoading(false); // Reset loading on error
        console.error("Error starting speech:", error);
      }
    } else {
      try {
        await realtimeAI.stop();
        lottieRef.current?.pause(); // Pause soundwave animation
        setIsActive(false); // Set recording inactive
      } catch (error) {
        console.error("Error stopping speech:", error);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleRecording}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        width: 60,
        height: 30,
        borderRadius: 8,
      }}
    >
      <LottieView
        ref={lottieRef}
        source={
          isLoading
            ? require('../../../../assets/animations/loading-circle-maroon.json')
            : require('../../../../assets/animations/soundwave.json')
        }
        autoPlay={isLoading || isActive}
        loop={true}
        style={
          isLoading
          ? { width: 60, height: 30 }
          : { width: 100, height: 60 }
        }
        speed={1}
      />
    </TouchableOpacity>
  );
};

export default RealtimeAIButton;