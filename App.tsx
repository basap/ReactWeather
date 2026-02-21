import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import { WeatherResponse } from "./types/weather";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const API_KEY = "### API KEY ###";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeatherByCity = async () => {
    if (!city) return;

    try {
      setLoading(true);

      const response = await axios.get<WeatherResponse>(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fi`
      );

      setWeather(response.data);
    } catch (error) {
      console.log(error);
      alert("Kaupunkia ei löytynyt");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Sijaintilupaa ei myönnetty");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await axios.get<WeatherResponse>(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=fi`
      );

      setWeather(response.data);
    } catch (error) {
      console.log(error);
      alert("Sijaintia ei saatu haettua");
    } finally {
      setLoading(false);
    }
  };

  const getWindDirection = (deg: number): string => {
    const directions = [
      "pohjoistuulta (N)",
      "koillistuulta (NE)",
      "itätuulta (E)",
      "kaakkoistuulta (SE)",
      "etelätuulta (S)",
      "lounaistuulta (SW)",
      "länsituulta (W)",
      "luoteistuulta (NW)"];
    return directions[Math.round(deg / 45) % 8];
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f6fc" }} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>ReactWeather</Text>

        <TextInput style={styles.input} placeholder="Syötä kaupunki" value={city} onChangeText={setCity}/>

        <View style={styles.buttonRow}>
          <View style={styles.button}>
            <Button title="Hae sää" onPress={fetchWeatherByCity} />
          </View>
          <View style={styles.button}>
            <Button title="Käytä GPS" onPress={fetchWeatherByLocation} />
          </View>
        </View>

        {loading && <ActivityIndicator size="large" />}

        {weather && (
          <>
            <View style={styles.card}>
              <Text style={styles.city}>{weather.name}</Text>
              <Text style={styles.temp}>{weather.main.temp}°C</Text>
              <Text>Tuntuu kuin {weather.main.feels_like}°C</Text>
              <Text>↑ {weather.main.temp_max}°C ↓ {weather.main.temp_min}°C</Text>
              <Text style={styles.description}>
                Sään kuvaus: {weather.weather[0].description}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tuuli</Text>

              <View style={styles.windRow}>
                <MaterialCommunityIcons name="navigation" size={40}
                  style={{
                    transform: [
                      { rotate: `${(weather.wind.deg + 180) % 360}deg` }
                    ],
                  }}
                />
                <View style={{ marginLeft: 15 }}>
                  <Text>Nopeus: {weather.wind.speed} m/s</Text>
                  <Text>
                    Suunta: {getWindDirection(weather.wind.deg)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Aurinko</Text>

              <View style={styles.sunRow}>
                <MaterialCommunityIcons name="weather-sunset-up" size={30} />
                <Text style={styles.sunText}>
                  {formatTime(weather.sys.sunrise)}
                </Text>
              </View>

              <View style={styles.sunRow}>
                <MaterialCommunityIcons name="weather-sunset-down" size={30} />
                <Text style={styles.sunText}>
                  {formatTime(weather.sys.sunset)}
                </Text>
              </View>
            </View>

            {weather.rain && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sade</Text>
                <Text>
                  Viimeisen tunnin aikana: {weather.rain["1h"] ?? 0} mm
                </Text>
                <Text>
                  Viimeisen kolmen tunnin aikana: {weather.rain["3h"] ?? 0} mm
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  temp: {
    fontSize: 42,
    fontWeight: "bold",
  },
  description: {
    marginTop: 5,
    fontStyle: "italic",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f6fc",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  weatherContainer: {
    marginTop: 20,
  },
  city: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  windRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sunRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  sunText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
