import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import WebView from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTranslation } from "@/lib/language";

const API_KEY = "29e1ca53-d185-46f8-b8a2-cf97d47ee249";
const POSETRACKER_API = "https://app.posetracker.com/pose_tracker/tracking";
const { width, height } = Dimensions.get("window");

export default function CameraTracking() {
  const [poseTrackerInfos, setCurrentPoseTrackerInfos] = useState<any>(null);
  const [repsCounter, setRepsCounter] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const { t } = useTranslation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const prevReadyRef = useRef<boolean | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [requestPermission, permission]);

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  const showSuccessAndGoBack = () => {
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        router.replace("/home/training"); // return to previous screen
      }, 2000);
    });
  };

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(60);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return null;
        }
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showSuccessAndGoBack();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInfos = (infos: any) => {
    setCurrentPoseTrackerInfos(infos);

    const wasReady = prevReadyRef.current;
    const isNowReady = infos?.ready;

    if (wasReady !== null && wasReady !== isNowReady) {
      fadeIn();

      if (isNowReady) {
        startCountdown();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    prevReadyRef.current = isNowReady;
  };

  const handleCounter = (count: number) => {
    setRepsCounter(count);
  };

  const webViewCallback = (info: any) => {
    if (info?.type === "counter") {
      handleCounter(info.current_count);
    } else {
      handleInfos(info);
    }
  };

  const onMessage = (event: any) => {
    try {
      let parsedData =
        typeof event.nativeEvent.data === "string"
          ? JSON.parse(event.nativeEvent.data)
          : event.nativeEvent.data;

      webViewCallback(parsedData);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const exercise = "squat";
  const difficulty = "easy";
  const skeleton = "&skeleton=default";
  const posetracker_url = `${POSETRACKER_API}?token=${API_KEY}&exercise=${exercise}&difficulty=${difficulty}&width=${width}&height=${height}&isMobile=true${skeleton}`;

  const jsBridge = `
    window.addEventListener('message', function(event) {
      window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
    });

    window.webViewCallback = function(data) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    };

    const originalPostMessage = window.postMessage;
    window.postMessage = function(data) {
      window.ReactNativeWebView.postMessage(typeof data === 'string' ? data : JSON.stringify(data));
    };

    true;
  `;

  const getBackgroundColor = () => {
    if (!poseTrackerInfos) return "#ffffffee";
    return poseTrackerInfos.ready ? "#cce5ff" : "#ffcccc";
  };

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        <WebView
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          style={styles.webView}
          source={{ uri: posetracker_url }}
          originWhitelist={["*"]}
          injectedJavaScript={jsBridge}
          onMessage={onMessage}
          mixedContentMode="compatibility"
        />
      </View>

      <Animated.View
        style={[
          styles.infoContainer,
          { backgroundColor: getBackgroundColor(), opacity: fadeAnim },
        ]}
      >
        {!poseTrackerInfos ? (
          <>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.statusText}>
              {t("cameraTracking.activatingAI")}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.statusText}>
              {t("cameraTracking.aiActive")}
            </Text>
            <Text style={styles.infoText}>
              {t("cameraTracking.infoLabel")} {poseTrackerInfos?.type || "-"}
            </Text>
            <Text style={styles.readyText}>
              {poseTrackerInfos?.ready
                ? t("cameraTracking.positionCorrect")
                : `${t("cameraTracking.adjustPosition")} ${
                    poseTrackerInfos?.postureDirection
                  }`}
            </Text>
          </>
        )}
      </Animated.View>

      <View style={styles.counterBadge}>
        <Text style={styles.counterText}>{repsCounter}</Text>
      </View>

      {countdown !== null && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      <Animated.View style={[styles.successOverlay, { opacity: successAnim }]}>
        <Text style={styles.successText}>{t("cameraTracking.success")}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webViewContainer: {
    flex: 7,
  },
  webView: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 3,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  readyText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  counterBadge: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 100,
    elevation: 5,
  },
  counterText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  countdownContainer: {
    position: "absolute",
    top: height / 2 - 60,
    left: width / 2 - 60,
    width: 120,
    height: 120,
    backgroundColor: "#000000cc",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  countdownText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: "#000000cc",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  successText: {
    color: "#00FF99",
    fontSize: 40,
    fontWeight: "bold",
  },
});
