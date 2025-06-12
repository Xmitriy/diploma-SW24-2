import React, { useRef, useCallback } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import LottieView from 'lottie-react-native';

export default function Flame({ size = 100 }: { size?: number }) {
  const animationRef = useRef<LottieView>(null);

  useFocusEffect(
    useCallback(() => {
      animationRef.current?.play();
    }, [])
  );

  return (
    <View style={{ position: 'absolute', bottom: -12, marginBottom: 16 }}>
      <LottieView
        ref={animationRef}
        source={require("@/assets/icons/flameBlue.json")}
        
        style={{
          width: size,
          height: size,
        }}
      />
    </View>
  );
}
