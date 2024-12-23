import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSession } from "../context/AuthProvider"; // Adjust the path as necessary
import { Alert } from "react-native";
import axios from "axios";
import { useColorScheme } from "@/hooks/useColorScheme";

const ProfileImage = () => {
  const { session, updateProfileImage } = useSession();
  const [loading, setLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const { token, id } = session;
  const colorScheme = useColorScheme();

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        requestCameraPermission();
      }
      const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (libraryStatus.status !== "granted") {
        requestLibraryPermission();
      }
    };
    requestPermissions();
  }, []);

  const uploadImage = async (image: any) => {
    if (!image) {
      Alert.alert("Error", "No image selected");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    //@ts-ignore
    formData.append("image", {
      uri: image.uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    formData.append("userId", id);

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/users/upload-profile-image`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(response.data);
        Alert.alert("Uspešno", "Slika dodana!", response.data.file);
        updateProfileImage(response.data.file);
      } else {
        Alert.alert(
          "Napaka",
          "Med shranjevanjem je prošlo do napake. status: " + response.status
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while uploading the image");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (libraryPermission && libraryPermission.status !== "granted") {
      Alert.alert("Permission required", "Please grant camera roll access.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0]);
      await uploadImage(result.assets[0]);
    }
  };

  const takeImage = async () => {
    if (cameraPermission && cameraPermission.status !== "granted") {
      Alert.alert("Permission required", "Please grant camera access.");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0]);
      await uploadImage(result.assets[0]);
    }
  };
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center dark:bg-black bg-white">
        <ActivityIndicator
          size="large"
          className="dark:text-white text-indigo-600"
        />
      </View>
    );
  }
  const color = colorScheme === "dark" ? "white" : "black";
  return (
    <ScrollView className="bg-gray-100 dark:bg-black min-h-full pt-5 px-3 pb-10">
      <View className="flex-col justify-around space-y-6">
        <TouchableOpacity
          onPress={pickImage}
          className="items-center text-white dark:text-white"
        >
          <Entypo name="image" color={color} size={30} />
          <Text className="text-black dark:text-white text-lg">
            izberi iz galerije
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takeImage} className="items-center">
          <Entypo name="camera" size={30} color={color} />
          <Text className="text-black dark:text-white text-lg">
            Naredi novo sliko
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileImage;
