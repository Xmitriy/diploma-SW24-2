import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { login } from "@/lib/data";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as jose from "jose";
import { tokenCache } from "@/utils/cache";
import { BASE_URL, API_URL } from "@/utils/constants";
import { handleAppleAuthError } from "@/utils/handleAppleError";
import { randomUUID } from "expo-crypto";
import { Platform } from "react-native";
import { useStatsStore } from "@/stores/statsStore";

export const AuthContext = createContext({
  user: null as User | null,
  loggedIn: false,
  loading: true,
  accessToken: null as string | null,
  login: async (username: string, password: string) => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  register: async (registerForm: registerFormType) => {},
  signInWithApple: () => {},
  signInWithAppleWebBrowser: () => Promise.resolve(),
  isLoading: true,
  error: null as AuthError | null,
  needsRegistration: { visible: false, data: null },
  setNeedsRegistration: (needsRegistration: {
    visible: boolean;
    data: any;
  }) => {},
  update: async (user: Partial<User>): Promise<boolean> => false,
  isUpdating: false,
  getFoodImage: async (image: string): Promise<FoodImage | null> => null,
  foodImageLoading: false,
  workouts: [] as any[],
  incrementStreak: async (): Promise<boolean> => false,
});

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const appleConfig: AuthRequestConfig = {
  clientId: "apple",
  scopes: ["name", "email"],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `https://server.tengis.space/auth/authorize`,
  tokenEndpoint: `https://server.tengis.space/auth/token`,
};

const appleDiscovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/apple/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/apple/token`,
};

const isWeb = Platform.OS === "web";

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [foodImageLoading, setFoodImageLoading] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [needsRegistration, _setNeedsRegistration] = useState<{
    visible: boolean;
    data: any;
  }>({ visible: false, data: null });
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const refreshInProgressRef = useRef(false);
  const [appleRequest, appleResponse, promptAppleAsync] = useAuthRequest(
    appleConfig,
    appleDiscovery
  );
  const { setField } = useStatsStore();

  const setNeedsRegistration = useCallback(
    (val: { visible: boolean; data: any }) => {
      _setNeedsRegistration(val);
    },
    []
  );

  const loadGoals = useCallback(
    async (goals: DailyGoals) => {
      setField("stepsGoal", goals.stepsGoal);
      setField("waterGoal", goals.waterGoal);
      setField("caloriesGoal", goals.caloriesGoal);
      setField("proteinGoal", goals.proteinGoal);
      setField("carbsGoal", goals.carbsGoal);
      setField("fatGoal", goals.fatGoal);
      setField("sleepGoal", goals.sleepGoal);
      setField("rdcGoal", goals.rdcGoal);
    },
    [setField]
  );

  const signOut = useCallback(async () => {
    _setNeedsRegistration({ visible: false, data: null });
    if (isWeb) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Error during web logout:", error);
      }
    } else {
      await tokenCache?.deleteToken("accessToken");
      await tokenCache?.deleteToken("refreshToken");
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setLoggedIn(false);
  }, []);

  const refreshAccessToken = useCallback(
    async (tokenToUse?: string) => {
      if (refreshInProgressRef.current) {
        console.log("Token refresh already in progress, skipping");
        return null;
      }
      refreshInProgressRef.current = true;
      try {
        const storedRefreshToken = await tokenCache?.getToken("refreshToken");
        const currentRefreshToken =
          tokenToUse || refreshToken || storedRefreshToken;
        if (!currentRefreshToken) {
          console.error("No refresh token available for refresh");
          await signOut();
          return null;
        }
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentRefreshToken}`,
          },
        });
        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.json();
          console.error("Token refresh failed:", errorData);
          if (refreshResponse.status === 401) {
            await signOut();
          }
          return null;
        }
        const data = await refreshResponse.json();
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;
        console.log("---------------newAccessToken", data);
        setUser(data.user as User);
        if (data.user.dailyGoals)
          await loadGoals(data.user.dailyGoals as DailyGoals);
        if (newAccessToken) setAccessToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);
        await tokenCache?.saveToken("accessToken", newAccessToken);
        await tokenCache?.saveToken("refreshToken", newRefreshToken);
        setLoggedIn(true);
        return newAccessToken;
      } catch (error) {
        console.error("Error refreshing token:", error);
        await signOut();
        return null;
      } finally {
        refreshInProgressRef.current = false;
      }
    },
    [refreshToken, signOut, loadGoals]
  );

  const handleNativeTokens = useCallback(
    async (tokens: { accessToken: string; refreshToken: string }) => {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        tokens;
      if (newAccessToken) setAccessToken(newAccessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);
      if (newAccessToken)
        await tokenCache?.saveToken("accessToken", newAccessToken);
      if (newRefreshToken)
        await tokenCache?.saveToken("refreshToken", newRefreshToken);
      if (newAccessToken) {
        const decoded = jose.decodeJwt(newAccessToken);
        setUser(decoded as User);
        setLoggedIn(true);
      }
    },
    []
  );

  const handleResponse = useCallback(async () => {
    if (response?.type === "success") {
      setIsLoading(true);
      try {
        const { code } = response.params;
        const serverResponse = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (serverResponse.status === 202) {
          const data = await serverResponse.json();
          _setNeedsRegistration({ visible: true, data: data.data });
          return;
        }
        if (!serverResponse.ok) {
          console.error(
            "Error handling auth response (google):",
            await serverResponse.json()
          );
          return;
        }
        const data = await serverResponse.json();
        setUser(data.user);
        setLoggedIn(true);
        if (data.user.dailyGoals)
          await loadGoals(data.user.dailyGoals as DailyGoals);
        await handleNativeTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } catch (e) {
        console.error("Error handling auth response (google catch):", e);
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === "cancel") {
      alert("Sign in cancelled");
    } else if (response?.type === "error") {
      setError(response?.error as AuthError);
    }
  }, [response, handleNativeTokens, loadGoals]);

  const handleAppleResponse = useCallback(async () => {
    // Current implementation is largely commented out, if restored, ensure useCallback dependencies.
    // For now, assuming it doesn't change AuthProvider state directly in a way that needs memoization beyond this.
  }, []);

  const loginWithGoogle = useCallback(async () => {
    _setNeedsRegistration({ visible: false, data: null });
    try {
      if (!request) {
        return;
      }
      await promptAsync();
    } catch (e) {
      console.log("Google login error:", e);
    }
  }, [request, promptAsync]);

  const registerUser = useCallback(
    async (formData: registerFormType): Promise<void> => {
      setIsLoading(true);
      _setNeedsRegistration({ visible: false, data: null });
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const text = await res.text();
          console.error("Registration failed:", text);
          throw new Error("Registration failed: " + text);
        }
        const data = await res.json();
        setUser(data.user);
        setLoggedIn(true);
        if (data.user.dailyGoals)
          await loadGoals(data.user.dailyGoals as DailyGoals);
        await handleNativeTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } catch (error) {
        console.error("Error during registration:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleNativeTokens, loadGoals]
  );

  const loginUser = useCallback(
    async (email?: string, password?: string): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await login(email, password);
        if (!res?.user) {
          setLoggedIn(false);
          throw new Error("Login failed: User data not returned");
        }
        setUser(res.user);
        setLoggedIn(true);
        if (res.user.dailyGoals)
          await loadGoals(res.user.dailyGoals as DailyGoals);
        await handleNativeTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        });
      } catch (e) {
        console.error("Login error:", e);
        setError(e as AuthError);
        setLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    },
    [handleNativeTokens, loadGoals]
  );

  const signInWithAppleWebBrowser = useCallback(async (): Promise<void> => {
    try {
      if (!appleRequest) {
        return;
      }
      await promptAppleAsync();
    } catch (e) {
      console.log("Apple web sign in error:", e);
    }
  }, [appleRequest, promptAppleAsync]);

  const signInWithApple = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const rawNonce = randomUUID();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: rawNonce,
      });
      const appleAuthResponse = await fetch(
        `${BASE_URL}/api/auth/apple/apple-native`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identityToken: credential.identityToken,
            rawNonce,
            givenName: credential.fullName?.givenName,
            familyName: credential.fullName?.familyName,
            email: credential.email,
          }),
        }
      );
      if (!appleAuthResponse.ok) {
        console.error(
          "Apple native auth failed:",
          await appleAuthResponse.json()
        );
        throw new Error("Apple native authentication failed");
      }
      const tokens = await appleAuthResponse.json();
      if (tokens.user && tokens.user.dailyGoals)
        await loadGoals(tokens.user.dailyGoals as DailyGoals);
      await handleNativeTokens(tokens);
    } catch (e) {
      console.error("Apple sign in error:", e);
      handleAppleAuthError(e);
      setError(e as AuthError);
    } finally {
      setIsLoading(false);
    }
  }, [handleNativeTokens, loadGoals]);

  const updateUser = useCallback(
    async (userDataToUpdate: Partial<User>): Promise<boolean> => {
      if (!accessToken) {
        console.warn("Cannot update user: no access token");
        return false;
      }
      setIsUpdating(true);
      try {
        const formData = new FormData();
        Object.entries(userDataToUpdate).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (
              key === "image" &&
              typeof value === "string" &&
              !value.startsWith("http")
            ) {
              const filename = value.split("/").pop();
              const match = /\.(\w+)$/.exec(filename ?? "");
              const type = match ? `image/${match[1]}` : `image`;
              formData.append("image", {
                uri: value,
                name: filename,
                type,
              } as any);
            } else {
              formData.append(key, value as any);
            }
          }
        });
        const res = await fetch(`${API_URL}/auth/update`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        if (!res.ok) {
          console.error("Error updating user:", res.status, await res.json());
          return false;
        }
        const data = await res.json();
        setUser(data.user);
        if (data.user.dailyGoals)
          await loadGoals(data.user.dailyGoals as DailyGoals);
        return true;
      } catch (e) {
        console.error("Error updating user (catch):", e);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [accessToken, loadGoals]
  );

  const getDailyFood = useCallback(async (): Promise<void> => {
    const cachedDailyFoods = await tokenCache?.getToken("dailyFoods");
    if (cachedDailyFoods) {
      const parsedCache = JSON.parse(cachedDailyFoods);
      const cacheDate = new Date(parsedCache.timestamp);
      const today = new Date();
      delete parsedCache.timestamp;
      if (cacheDate.toDateString() === today.toDateString()) {
        setField("dailyFoods", parsedCache);
        return;
      }
    }
    if (!accessToken) {
      return;
    }
    const res = await fetch(`${API_URL}/auth/food`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.error("Error getting daily food:", res.status, await res.json());
      return;
    }
    const data = await res.json();
    await tokenCache?.saveToken(
      "dailyFoods",
      JSON.stringify({ ...data, timestamp: new Date().toISOString() })
    );
    setField("dailyFoods", data);
  }, [accessToken, setField]);

  const getFoodImage = useCallback(
    async (image: string): Promise<FoodImage | null> => {
      if (!accessToken) {
        console.warn("getFoodImage: No access token");
        return null;
      }
      setFoodImageLoading(true);
      try {
        const formData = new FormData();
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri: image, name: filename, type } as any);
        const res = await fetch(`${API_URL}/auth/food/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        if (!res.ok) {
          console.error(
            "Error getting food image:",
            res.status,
            await res.json()
          );
          return null;
        }
        return await res.json();
      } catch (e) {
        console.log("Error getting food image (catch):", e);
        return null;
      } finally {
        setFoodImageLoading(false);
      }
    },
    [accessToken]
  );

  const getWorkouts = useCallback(async (): Promise<void> => {
    try {
      const cachedWorkouts = await tokenCache?.getToken("workouts");
      if (cachedWorkouts) {
        const parsedCache = JSON.parse(cachedWorkouts);
        const cacheDate = new Date(parsedCache.timestamp);
        const today = new Date();
        if (cacheDate.toDateString() === today.toDateString()) {
          setWorkouts(parsedCache.data);
          return;
        }
      }
      if (!accessToken) {
        return;
      }
      const res = await fetch(`${API_URL}/auth/exercise`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        console.error("Error getting workouts:", res.status, await res.json());
        return;
      }
      const data = await res.json();
      setWorkouts(data);
      await tokenCache?.saveToken(
        "workouts",
        JSON.stringify({ data, timestamp: new Date().toISOString() })
      );
    } catch (e) {
      console.error("Error getting workouts:", e);
    }
  }, [accessToken]);

  const incrementStreak = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.warn("AuthProvider: User not available to increment streak.");
      return false;
    }
    const newStreak = (user.streak || 0) + 1;
    const currentHighestStreak = user.highestStreak || 0;
    const updatePayload: Partial<User> = { streak: newStreak };
    if (newStreak > currentHighestStreak) {
      updatePayload.highestStreak = newStreak;
    }
    const success = await updateUser(updatePayload);
    if (success) {
      console.log(
        `AuthProvider: Streak updated. New streak: ${newStreak}, New Highest: ${
          updatePayload.highestStreak || currentHighestStreak
        }`
      );
    } else {
      console.warn(`AuthProvider: Failed to update streak.`);
    }
    return success;
  }, [user, updateUser]);

  // login
  useEffect(() => {
    const checkLogin = async () => {
      setIsLoading(true);
      try {
        const storedAccessToken = await tokenCache?.getToken("accessToken");
        let decodedAccessToken = null;
        let isAccessTokenValid = false;

        if (storedAccessToken) {
          try {
            decodedAccessToken = jose.decodeJwt(storedAccessToken);
            const exp = (decodedAccessToken as any).exp;
            if (exp && exp * 1000 > Date.now()) {
              isAccessTokenValid = true;
            }
          } catch (jwtError) {
            console.error(
              "AuthContext: Error decoding stored access token:",
              jwtError
            );
            isAccessTokenValid = false;
            // Potentially delete invalid token from cache here
            // await tokenCache?.deleteToken("accessToken");
          }
        }

        if (isAccessTokenValid && decodedAccessToken && storedAccessToken) {
          console.log(
            "AuthContext: Valid access token found in cache. Using it."
          );
          setAccessToken(storedAccessToken);
          setUser(decodedAccessToken as User);
          setLoggedIn(true);
          if ((decodedAccessToken as User).dailyGoals) {
            await loadGoals(
              (decodedAccessToken as User).dailyGoals as DailyGoals
            );
          }
          const rt = await tokenCache?.getToken("refreshToken");
          if (rt) {
            setRefreshToken(rt); // Set for periodic refresh
          }
        } else {
          console.log(
            "AuthContext: No valid access token. Attempting refresh if refresh token exists."
          );
          const rt = await tokenCache?.getToken("refreshToken");
          if (rt) {
            console.log(
              "AuthContext: Found refresh token. Attempting refresh."
            );
            setRefreshToken(rt); // Set state before calling, as refreshAccessToken might be memoized based on it
            await refreshAccessToken(rt); // This will set user/accessToken if successful or sign out
          } else {
            console.log(
              "AuthContext: No refresh token found. User needs to log in."
            );
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
            setLoggedIn(false);
          }
        }
      } catch (error) {
        console.error("Error during checkLogin:", error);
        // Ensure a clean state on unexpected errors during checkLogin
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setLoggedIn(false);
      } finally {
        setIsLoading(false);
        refreshAccessToken();
      }
    };
    checkLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && loggedIn) {
      getDailyFood();
      getWorkouts();
    }
  }, [user, loggedIn, getDailyFood, getWorkouts]);

  useEffect(() => {
    if (response) {
      handleResponse();
    }
  }, [response, handleResponse]);

  useEffect(() => {
    if (appleResponse) {
      handleAppleResponse();
    }
  }, [appleResponse, handleAppleResponse]);

  // interval to refresh user 10min
  useEffect(() => {
    let intervalId: number;
    if (loggedIn && refreshToken) {
      intervalId = setInterval(() => {
        console.log("Attempting periodic token refresh...");
        refreshAccessToken(refreshToken).catch((e) =>
          console.error("Periodic refresh failed", e)
        );
      }, 1000 * 60 * 10);
    }
    return () => clearInterval(intervalId);
  }, [loggedIn, refreshToken, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loggedIn,
        loading: isLoading,
        accessToken,
        login: loginUser,
        loginWithGoogle,
        logout: signOut,
        register: registerUser,
        signInWithApple,
        signInWithAppleWebBrowser,
        isLoading,
        error,
        needsRegistration,
        setNeedsRegistration,
        update: updateUser,
        getFoodImage,
        foodImageLoading,
        isUpdating,
        workouts,
        incrementStreak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
