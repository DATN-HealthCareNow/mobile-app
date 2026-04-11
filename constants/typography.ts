import { Platform } from "react-native";

const headingFamily = Platform.select({
  ios: "AvenirNext-DemiBold",
  android: "sans-serif-medium",
  default: "System",
}) as string;

const bodyFamily = Platform.select({
  ios: "AvenirNext-Regular",
  android: "sans-serif",
  default: "System",
}) as string;

export const Typography = {
  brandTitle: {
    fontFamily: headingFamily,
    letterSpacing: 0.2,
  },
  heading: {
    fontFamily: headingFamily,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: bodyFamily,
  },
};
