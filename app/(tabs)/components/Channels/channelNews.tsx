import Header from "@/app/(tabs)/components/header";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE } from "../../utils/config";
import CustomTabNavigator from "../customTabNavigator";
import Footer from "../footer";

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  image: string;
  published_time: string;
}

export default function ChannelNews() {
  const { channelName } = useLocalSearchParams<{ channelName: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channelName) {
      fetchChannelNews();
    }
  }, [channelName]);

  const fetchChannelNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/news/cyber/channel/${encodeURIComponent(channelName)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      console.error("Error fetching channel news:", err);
      setError("Failed to load news for this channel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = newsData.filter(
    (item) =>
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#23467eff" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
        <CustomTabNavigator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Feather name="wifi-off" size={50} color="#f93232ff" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchChannelNews}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <CustomTabNavigator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.searchContainer}>
        <Text style={styles.title}>{channelName || "Channel News"}</Text>
        <TextInput
          placeholder="Search news by title or summary..."
          placeholderTextColor={"#595858ff"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView style={styles.contentContainer}>
        {filteredNews.length > 0 ? (
          filteredNews.map((item, index) => (
            <View key={item.id} style={styles.newsCard}>
              {item.image && (
                <Image
                  source={{ uri: `${item.image}` }}
                  style={styles.newsImage}
                  resizeMode="cover"
                  defaultSource={require("@/assets/images/default_image.png")}
                  onError={() =>
                    console.log(`Error loading image: ${item.image}`)
                  }
                />
              )}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/components/Channels/newsDetails",
                    params: {
                      newsId: item.id.toString(),
                      headline: item.headline,
                      summary: item.summary,
                      image: item.image,
                      publishedTime: item.published_time,
                    },
                  })
                }
              >
                <Text style={styles.newsTitle}>{item.headline}</Text>
              </TouchableOpacity>

              <Text style={styles.newsTime}>
                {new Date(item.published_time).toLocaleString()}
              </Text>
              <Text style={styles.newsSummary} numberOfLines={3}>
                {item.summary}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No news found matching your search"
                : "No news available for this channel"}
            </Text>
          </View>
        )}
        {filteredNews.length > 0 && <Footer />}
      </ScrollView>
      
      <CustomTabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
    marginBottom:10,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#334155",
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    marginTop: 0,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  title: {
    color: "#f93232",
    fontWeight: "800",
    fontSize: 22,
    paddingVertical: 20,
    textAlign: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    letterSpacing: -0.5,
    textShadowColor: "rgba(144, 25, 25, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  newsCard: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    padding: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  newsTitle: {
    fontWeight: "800",
    fontSize: 20,
    marginTop: 0,
    color: "#0f172a",
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  newsTime: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 16,
    fontWeight: "600",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  newsSummary: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
    lineHeight: 24,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 32,
    backgroundColor: "#f8fafc",
  },
  errorText: {
    marginTop: 24,
    fontSize: 17,
    color: "#475569",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "600",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 32,
    backgroundColor: "#901919",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#901919",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: "#901919",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 24,
    fontSize: 18,
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
    letterSpacing: 0.3,
  },
});
