import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import FilterModal from "../../components/filterModal";
import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RiderHome"
>;

type Driver = {
  id: string;
  name: string;
  gender: "Male" | "Female";
  rating: number;
  car: string;
  price: number;
  seats: number;
  avatar: string;
};

const DRIVERS: Driver[] = [
  {
    id: "1",
    name: "Alice Johnson",
    gender: "Female",
    rating: 4.9,
    car: "Toyota Prius",
    price: 120,
    seats: 3,
    avatar: "https://placehold.co/100x100",
  },
  {
    id: "2",
    name: "Ben Carter",
    gender: "Male",
    rating: 4.7,
    car: "Honda Civic",
    price: 95,
    seats: 2,
    avatar: "https://placehold.co/100x100",
  },
  {
    id: "3",
    name: "Carla Gomez",
    gender: "Female",
    rating: 4.8,
    car: "Hyundai Elantra",
    price: 110,
    seats: 1,
    avatar: "https://placehold.co/100x100",
  },
  {
    id: "4",
    name: "Daniel Park",
    gender: "Male",
    rating: 4.6,
    car: "Ford Focus",
    price: 85,
    seats: 4,
    avatar: "https://placehold.co/100x100",
  },
  {
    id: "5",
    name: "Emily Rivera",
    gender: "Female",
    rating: 5.0,
    car: "Kia Soul",
    price: 130,
    seats: 2,
    avatar: "https://placehold.co/100x100",
  },
];

export default function SearchResultsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [search, setSearch] = useState("");

  const [priceFilter, setPriceFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [seatFilter, setSeatFilter] = useState("All");

  const [priceVisible, setPriceVisible] = useState(false);
  const [genderVisible, setGenderVisible] = useState(false);
  const [seatVisible, setSeatVisible] = useState(false);

  const filteredDrivers = useMemo(() => {
    return DRIVERS.filter((driver) => {
      const searchMatch =
        driver.name.toLowerCase().includes(search.toLowerCase()) ||
        driver.car.toLowerCase().includes(search.toLowerCase());

      let priceMatch = true;

      if (priceFilter === "Under R100")
        priceMatch = driver.price <= 100;

      if (priceFilter === "Under R150")
        priceMatch = driver.price <= 150;

      if (priceFilter === "Under R200")
        priceMatch = driver.price <= 200;

      const genderMatch =
        genderFilter === "All" ||
        driver.gender === genderFilter;

      let seatMatch = true;

      if (seatFilter === "1+")
        seatMatch = driver.seats >= 1;

      if (seatFilter === "2+")
        seatMatch = driver.seats >= 2;

      if (seatFilter === "3+")
        seatMatch = driver.seats >= 3;

      if (seatFilter === "4+")
        seatMatch = driver.seats >= 4;

      return (
        searchMatch &&
        priceMatch &&
        genderMatch &&
        seatMatch
      );
    });
  }, [
    search,
    priceFilter,
    genderFilter,
    seatFilter,
  ]);
const renderDriver = ({ item }: { item: Driver }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.9}
    onPress={() => navigation.navigate("RideDetails")}
  >
    <Image
      source={{ uri: item.avatar }}
      style={styles.avatar}
    />

    <View style={styles.cardInfo}>
      <Text style={styles.driverName}>
        {item.name}
      </Text>

      <Text style={styles.detail}>
        🚗 {item.car}
      </Text>

      <Text style={styles.detail}>
        ⭐ {item.rating}
      </Text>

      <Text style={styles.detail}>
        👤 {item.gender}
      </Text>

      <Text style={styles.detail}>
        💺 {item.seats} Seats
      </Text>

      <Text style={styles.price}>
        R{item.price}
      </Text>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={(e) => {
          e.stopPropagation();
          navigation.navigate("RideDetails");
        }}
      >
        <Text style={styles.bookButtonText}>
          View Ride
        </Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.heading}>
        Search Results
      </Text>

      <View style={styles.searchContainer}>

        <Ionicons
          name="search"
          size={22}
          color={Colors.textSecondary}
        />

        <TextInput
          placeholder="Search driver or vehicle..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />

      </View>

      <View style={styles.filterRow}>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setPriceVisible(true)}
        >
          <Text style={styles.filterText}>
            💰 {priceFilter}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setGenderVisible(true)}
        >
          <Text style={styles.filterText}>
            👤 {genderFilter}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setSeatVisible(true)}
        >
          <Text style={styles.filterText}>
            💺 {seatFilter}
          </Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.results}>
        {filteredDrivers.length} Drivers Found
      </Text>

      <FlatList
        data={filteredDrivers}
        keyExtractor={(item) => item.id}
        renderItem={renderDriver}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      />

      <FilterModal
        visible={priceVisible}
        title="Filter by Price"
        options={[
          "All",
          "Under R100",
          "Under R150",
          "Under R200",
        ]}
        selectedValue={priceFilter}
        onSelect={setPriceFilter}
        onClose={() => setPriceVisible(false)}
      />

      <FilterModal
        visible={genderVisible}
        title="Filter by Gender"
        options={[
          "All",
          "Male",
          "Female",
        ]}
        selectedValue={genderFilter}
        onSelect={setGenderFilter}
        onClose={() => setGenderVisible(false)}
      />

      <FilterModal
        visible={seatVisible}
        title="Filter by Seats"
        options={[
          "All",
          "1+",
          "2+",
          "3+",
          "4+",
        ]}
        selectedValue={seatFilter}
        onSelect={setSeatFilter}
        onClose={() => setSeatVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    height: 55,
    marginLeft: 10,
    color: Colors.textPrimary,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  filterButton: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
  },

  filterText: {
    color: Colors.primary,
    fontWeight: "600",
  },  results: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 15,
  },

  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",

    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,

    elevation: 4,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
  },

  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },

  driverName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },

  detail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },

  price: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.rider,
  },

  bookButton: {
    marginTop: 15,
    backgroundColor: Colors.rider,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  bookButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});