import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "@/lib/language";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  FlatList,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
import { ThemeView, ThemeText } from "@/components";
import WaterAnimation from "@/components/home/WaterAnimation";
import { Ionicons } from "@expo/vector-icons";
import { useStatsStore } from "@/stores/statsStore";

function WaterModal({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const { water, waterGoal, setField } = useStatsStore();
  const [componentHeight, setComponentHeight] = useState(0);

  const percentage = useMemo(
    () => Math.min(Math.round((water / waterGoal) * 100), 100),
    [water, waterGoal]
  );

  const addWater = useCallback(
    (amount: number) => {
      setField("water", Math.min(water + amount, waterGoal));
    },
    [water, waterGoal, setField]
  );

  const waterOptions = useMemo(() => [100, 250, 500, 1000], []);

  const [alarms, setAlarms] = useState([
    { id: 1, time: "07:00 AM", enabled: true },
    { id: 2, time: "09:00 AM", enabled: true },
    { id: 3, time: "12:00 PM", enabled: false },
    { id: 4, time: "03:00 PM", enabled: true },
    { id: 5, time: "06:00 PM", enabled: false },
    { id: 6, time: "06:00 PM", enabled: false },
    { id: 7, time: "06:00 PM", enabled: false },
    { id: 8, time: "06:00 PM", enabled: false },
  ]);

  const toggleAlarm = useCallback((id: number) => {
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  }, []);

  const renderAlarmItem = useCallback(
    ({ item: alarm }: { item: (typeof alarms)[0] }) => (
      <View
        key={alarm.id}
        className="flex-row justify-between items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl mb-2"
      >
        <View className="flex-row items-center gap-4">
          <Ionicons name="alarm-outline" size={20} color="#2563EB" />
          <Text className="text-gray-800 dark:text-gray-200 text-base">
            {alarm.time}
          </Text>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={() => toggleAlarm(alarm.id)}
          thumbColor={alarm.enabled ? "#2563EB" : "#ccc"}
          trackColor={{ false: "#ccc", true: "#93c5fd" }}
        />
      </View>
    ),
    [toggleAlarm]
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      // presentationStyle="formSheet"
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      supportedOrientations={["portrait"]}
    >
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <SafeAreaView className="flex-1 items-center py-2 justify-end bg-black/50">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <ThemeView className="flex-1 max-h-[90%] w-full p-8 rounded-3xl">
              {/* Water progress */}
              <View
                onLayout={(e) => {
                  setComponentHeight(e.nativeEvent.layout.height);
                }}
                className="w-full h-60 overflow-hidden rounded-[40px] justify-center items-start dark:border dark:border-t-0 dark:rounded-t-none dark:border-gray-100"
              >
                <View className="flex-row items-center mt-6 gap-2 z-10">
                  <Text className="text-[60px] ml-6 dark:text-slate-300">
                    {percentage}
                  </Text>
                  <Text className="text-[20px] font-bold mt-8 dark:text-slate-300">
                    %
                  </Text>
                </View>
                <Text className="text-center text-sm mb-2 ml-10 z-10 dark:text-slate-300">
                  {t("waterModal.progressFraction", {
                    current: water,
                    goal: waterGoal,
                  })}
                </Text>
                <WaterAnimation containerHeight={componentHeight} />
              </View>

              {/* Add Water Section */}
              <View className="w-full flex-row flex-wrap justify-between mt-6">
                <ThemeText className="font-bold text-lg dark:text-black w-full font-quicksand">
                  {t("water.add")}
                </ThemeText>
                <View className="w-full flex-row flex-wrap justify-between gap-3 mt-6">
                  {waterOptions.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      onPress={() => addWater(amount)}
                      className="flex-row items-center bg-blue-200/50 dark:bg-gray-300/10 rounded-xl px-4 py-2 mb-3 h-16"
                      style={{ width: "45%" }}
                    >
                      <Ionicons name="water" size={20} color="#2563EB" />
                      <Text className="text-blue-800 dark:text-blue-200 font-semibold ml-2">
                        {t("waterModal.milliliters", { amount })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Alarm Section */}
              <View className="mt-6 w-full px-1 flex-1">
                <ThemeText className="font-bold text-lg dark:text-black w-full mb-3 font-quicksand">
                  {t("water.alarm")}
                </ThemeText>

                <FlatList
                  data={alarms}
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  className="h-full"
                  renderItem={renderAlarmItem}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            </ThemeView>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default React.memo(WaterModal);
