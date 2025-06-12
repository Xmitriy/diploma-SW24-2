import { Avatar, ThemeText } from "@/components";
import { use, useCallback, useRef, useState } from "react";
import { FlatList, LayoutChangeEvent, Pressable, View } from "react-native";
import Tab1 from "@/components/profile/tab1";
import Tab2 from "@/components/profile/tab2";
import Tab3 from "@/components/profile/tab3";
import { useTranslation } from "@/lib/language";
import { useNavigation, useRouter } from "expo-router";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@/lib/theme";
import { AuthContext } from "@/context/auth";
import { SafeAreaView } from "react-native-safe-area-context";
const Tabs = () => {
  const { t } = useTranslation();
  const tabRef = useRef<FlatList>(null);
  const [width, setWidth] = useState<number>(0);
  const [selectedTab, setselectedTab] = useState<number>(0);
  const tabs = [
    {
      key: "1",
      component: Tab1,
    },
    {
      key: "2",
      component: Tab2,
    },
    {
      key: "3",
      component: Tab3,
    },
  ];

  const renderItem = useCallback(
    ({ item }: { item: { key: string; component: React.ComponentType } }) => (
      <View
        style={{
          width: width,
          minHeight: 400,
          height: "auto",
          paddingBottom: 100,
        }}
        key={item.key}
      >
        <item.component />
      </View>
      //ene hesgiin unduriig uur hun ashiglah uyd ni tengis zasna geseen utsandaa taaruulad 350 iig uurchlurui ahh
    ),
    [width]
  );

  const scrollTo = (index: number) => {
    if (tabRef.current && index >= 0 && index < tabs.length) {
      requestAnimationFrame(() => {
        tabRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0,
          viewOffset: 0,
        });
      });
    }
  };

  const setDimensions = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width]
  );

  const TabButton = ({ children, tab }: { children: string; tab: number }) => {
    const handlePress = () => {
      scrollTo(tab);
      setselectedTab(tab);
    };
    const selected = selectedTab === tab;
    return (
      <View
        className={`flex-1 overflow-hidden  ${
          selected ? "bg-white dark:bg-blue-600 rounded-full h-9" : ""
        }`}
      >
        <Pressable
          android_ripple={{
            color: "#00000020",
            radius: 40,
          }}
          onPress={handlePress}
          className="flex-1 justify-center items-center"
        >
          <ThemeText className={`${selected ? "font-bold" : ""}`}>
            {children}
          </ThemeText>
        </Pressable>
      </View>
    );
  };

  return (
    <View className="flex-1 w-[85%] my-2" onLayout={setDimensions}>
      <View className="flex-row justify-between w-full items-center h-10 bg-blue-50 px-1 rounded-full dark:bg-gray-800">
        <TabButton tab={0}>{t("profile1.timeline")}</TabButton>
        <TabButton tab={1}>{t("profile1.stats")}</TabButton>
        <TabButton tab={2}>{t("profile1.duels")}</TabButton>
      </View>
      <FlatList
        ref={tabRef}
        initialScrollIndex={0}
        data={tabs}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        nestedScrollEnabled={true}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={false}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={1}
      />
    </View>
  );
};

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push("/");
    }
  };
  const { user } = use(AuthContext);

  const handlePfp = () => {
    router.push("/(settings)/Edit");
  };

  return (
    <SafeAreaView className="items-center justify-center dark:bg-gray-900 bg-white flex-1">
      <View className="flex-row items-center px-6 justify-between w-full mt-5">
        <View className="border-2 border-gray-200 dark:border-gray-700 overflow-hidden rounded-full">
          <Pressable
            android_ripple={{ color: "#00000020", radius: 40 }}
            onPress={handleBack}
            className="p-2"
          >
            <Icon
              source="chevron-left"
              size={25}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </Pressable>
        </View>
        <ThemeText className="text-2xl text-center font-semibold">
          {t("profile1.title")}
        </ThemeText>
        <Pressable
          className="border-2 border-gray-200 dark:border-gray-700 p-2 rounded-full"
          onPress={() => router.push("/settings")}
        >
          <Icon
            source="cog-outline"
            size={25}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </Pressable>
      </View>
      <Pressable
        className="items-center justify-center mt-5"
        onPress={handlePfp}
      >
        <Avatar />
      </Pressable>
      <ThemeText className="text-2xl font-bold mt-2">
        {user?.username}
        {/* Gerelt-Od */}
      </ThemeText>
      <View className="flex-row items-center justify-between w-1/2 my-4">
        <View className="items-center">
          <Icon
            source="flash-outline"
            color={theme === "dark" ? "#fff" : "#000"}
            size={30}
          />
          <ThemeText className="font-semibold text-xl">247</ThemeText>
          <ThemeText className="color-gray-400">
            {t("profile1.calories")}
          </ThemeText>
        </View>
        <View className="items-center">
          <Icon
            source="account-outline"
            color={theme === "dark" ? "#fff" : "#000"}
            size={30}
          />
          <ThemeText className="font-semibold text-xl">0</ThemeText>
          <ThemeText className="color-gray-400">
            {t("profile1.followers")}
          </ThemeText>
        </View>
      </View>
      <Tabs />
    </SafeAreaView>
  );
}
