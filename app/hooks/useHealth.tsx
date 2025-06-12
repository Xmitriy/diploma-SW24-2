// import {
//   initialize,
//   requestPermission,
//   readRecords,
// } from "react-native-health-connect";

import { View, Text } from "react-native";
import React from "react";

export default function useHealthConnect() {
  // const isInitialized = await initialize();

  // // request permissions
  // const grantedPermissions = await requestPermission([
  //   { accessType: "read", recordType: "ActiveCaloriesBurned" },
  // ]);

  // // check if granted

  // const { records } = await readRecords("ActiveCaloriesBurned", {
  //   timeRangeFilter: {
  //     operator: "between",
  //     startTime: "2023-01-09T12:00:00.405Z",
  //     endTime: "2023-01-09T23:53:15.405Z",
  //   },
  // });
  return (
    <View>
      <Text>useHealthConnect</Text>
    </View>
  );
}
