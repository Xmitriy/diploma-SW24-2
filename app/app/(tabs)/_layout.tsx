import { TabBar, ThemeView } from "@/components";
import { useAppTheme } from "@/lib/theme";
import { Tabs } from "expo-router";
import { AuthContext } from "@/context/auth";
import { useContext, useEffect } from "react";
import useDailyTaskStore from "@/stores/dailyTaskStore";
import { useTranslation } from "@/lib/language";

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const { setAuthDetails } = useDailyTaskStore();
  const { user, accessToken } = useContext(AuthContext);

  useEffect(() => {
    if ((user?._id || user?.id) && accessToken) {
      setAuthDetails(user._id || user.id, accessToken);
    } else {
      setAuthDetails(null, null);
    }
  }, [user, accessToken, setAuthDetails]);

  return (
    <ThemeView>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "shift",
          sceneStyle: {
            backgroundColor: theme === "light" ? "white" : "#111827",
          },
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            lazy: false,
          }}
        />
        <Tabs.Screen
          name="blogs"
          options={{
            tabBarLabel: "blogs",
            lazy: false,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            tabBarLabel: "stats",
            lazy: false,
            animation: "fade",
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: "Profile",
            lazy: false,
          }}
        />
      </Tabs>
    </ThemeView>
  );
}
