module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...(config.android && config.android.config),
        googleMaps: {
          // Lấy API Key động từ file .env (Không đưa lên Git)
          apiKey: process.env.API_KEY_MAP || config.android?.config?.googleMaps?.apiKey || "",
        },
      },
    },
  };
};
