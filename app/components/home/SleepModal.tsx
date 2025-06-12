// import React, { useState } from "react";
// import { View, Text, Modal, TouchableOpacity, Switch, FlatList, ScrollView } from "react-native";
// import { ThemeText, ThemeView } from "@/components";
// function SleepModal( {
//     visible,
//     setVisible,
//   }: {
//     visible: boolean;
//     setVisible: React.Dispatch<React.SetStateAction<boolean>>;
//   }) {
//     const [containerHeight, setContainerHeight] = useState(400);
//     return (
//         <Modal
//       visible={visible}
//       onRequestClose={() => setVisible(false)}
//       presentationStyle="pageSheet"
//       animationType="slide"
//     >
//         <ScrollView>
//             <ThemeView className="flex-1 items-center pt-12 px-8 bg-white"
//         onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
//                 <View className="w-full h-60 overflow-hidden rounded-[40px] bg-white dark:bg-gray-900 justify-center items-start">

//                 </View>
//             </ThemeView>
//         </ScrollView>
//         </Modal>
//     )
// }

// export default SleepModal
import { View, Text, Modal, ScrollView } from "react-native";
import { ThemeView } from "@/components";

function SleepModal({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      presentationStyle="pageSheet"
      animationType="slide"
    >
      <ScrollView>
        <ThemeView className="flex-1 items-center pt-12 px-8 bg-white">
          <View className="w-full h-60 overflow-hidden rounded-[40px] bg-white dark:bg-gray-900 justify-center items-start ">
            {/* You can add an image or decorative header here */}
          </View>

          <View className="flex-row justify-between gap-6 ">
            {/* Sleep Time Box */}
            <View className=" w-52 p-4 border border-gray-300 rounded-2xl bg-white">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Sleep Time
              </Text>
              <Text className="text-gray-600">10:30 PM - 6:30 AM</Text>
            </View>
            {/* Sleep Quality Box */}
            <View className=" w-52 h-40 p-4 border border-gray-300 rounded-2xl bg-white">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Sleep Quality
              </Text>
            </View>
          </View>
        </ThemeView>
      </ScrollView>
    </Modal>
  );
}

export default SleepModal;
