// RegisterPromptModal.tsx
import React from "react";
import { View } from "react-native";
import { Modal, Portal, Text, Button, useTheme } from "react-native-paper";
import { useTranslation } from "@/lib/language";

interface RegisterPromptModalProps {
  visible: boolean;
  data: any;
  onConfirm: () => void;
  onCancel: () => void;
}

const RegisterPromptModal = ({
  visible,
  data,
  onConfirm,
  onCancel,
}: RegisterPromptModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          padding: 20,
          margin: 20,
          borderRadius: 10,
        }}
      >
        <Text variant="titleMedium" style={{ marginBottom: 10 }}>
          {t("registerPrompt.title")}
        </Text>
        <Text>{t("registerPrompt.noAccountFound", { email: data.email })}</Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <Button onPress={onCancel} style={{ marginRight: 10 }}>
            {t("registerPrompt.cancel")}
          </Button>
          <Button mode="contained" onPress={onConfirm}>
            {t("registerPrompt.register")}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default RegisterPromptModal;
