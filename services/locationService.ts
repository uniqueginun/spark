import * as Location from "expo-location";

const API_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export const getLocationInfo = async (location: Location.LocationObject) => {
  const response = await fetch(
    `${API_URL}?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&localityLanguage=en`,
  );

  return await response.json();
};
