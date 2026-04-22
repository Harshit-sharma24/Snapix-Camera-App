import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = "gallery_data";

export const saveImage = async (uri: string) => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    const images = data ? JSON.parse(data) : [];

    const updated = [uri, ...images];

    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {
    console.log("save error", e);
  }
};

export const getImages = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const deleteImages = async (selected: string[]) => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    const images = data ? JSON.parse(data) : [];

    const updated = images.filter((i: string) => !selected.includes(i));

    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {
    console.log(e);
  }
};