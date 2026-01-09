import Header from "@/app/(tabs)/components/header";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE } from "../../utils/config";
import CustomTabNavigator from "../customTabNavigator";
import Footer from "../footer";

interface NewsDetail {
  id: number;
  channel: string;
  headline: string;
  body: string;
  summary: string;
  image: string;
  published_time: string;
  article_link: string;
  fetched_at: string;
}

export default function NewsDetails() {
  const { newsId, channel, headline, summary, image, publishedTime } = useLocalSearchParams<{
    newsId: string;
    channel?: string;
    headline?: string;
    summary?: string;
    image?: string;
    publishedTime?: string;
  }>();
  
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/news/cyber/${newsId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("News Detail:",data);
      setNewsDetail(data);
    } catch (err) {
      console.error("Error fetching news detail:", err);
      setError("Failed to load news details. Please try again.");
      
      if (headline || summary) {
        setNewsDetail({
          id: parseInt(newsId || "0"),
          channel: channel || "Unknown Channel",
          headline: headline || "",
          body: summary || "",
          summary: summary || "",
          image: image || "",
          published_time: publishedTime || "",
          article_link: "",
          fetched_at: ""
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenArticle = () => {
    if (newsDetail?.article_link) {
      Linking.openURL(newsDetail.article_link).catch(err => 
        console.error("Failed to open link:", err)
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#23467eff" />
          <Text style={styles.loadingText}>Loading news details...</Text>
        </View>
        <CustomTabNavigator />
      </View>
    );
  }

  if (error && !newsDetail) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={50} color="#f93232ff" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNewsDetail}>
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
      <ScrollView style={styles.contentContainer}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={"#fff"} />
            <Text style={styles.backButtonText}>Back to News</Text>
          </TouchableOpacity>
          
          {newsDetail?.article_link && (
            <TouchableOpacity
              style={styles.articleButton}
              onPress={handleOpenArticle}
            >
              <Text style={styles.articleButtonText}>Original Article</Text>
              <Feather name="external-link" size={20} color={"#fc2f2fff"} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.newsCard}>
          {newsDetail?.image ? (
            <Image
              source={{ uri: `${newsDetail.image}` }}
              style={styles.newsImage}
              resizeMode="cover"
              defaultSource={require("@/assets/images/default_image.png")}
              onError={() => console.log(`Error loading image: ${newsDetail.image}`)}
            />
          ) : (
            <View style={[styles.newsImage, styles.placeholderImage]}>
              <Feather name="image" size={40} color="#ccc" />
            </View>
          )}
          
          <Text style={styles.channelName}>
            {newsDetail?.channel || "Unknown Channel"}
          </Text>
          
          <Text style={styles.newsTitle}>
            {newsDetail?.headline || "No title available"}
          </Text>

          <View style={styles.timeContainer}>
            <Feather name="clock" size={16} color="#888" />
            <Text style={styles.newsTime}>
              {newsDetail?.published_time 
                ? new Date(newsDetail.published_time).toLocaleString() 
                : "Date not available"}
            </Text>
          </View>

          {newsDetail?.summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryLabel}>Summary:</Text>
              <Text style={styles.newsSummary}>
                {newsDetail.summary}
              </Text>
            </View>
          )}

          {newsDetail?.body && (
            <View style={styles.bodyContainer}>
              <Text style={styles.bodyLabel}>Full Article:</Text>
              <Text style={styles.newsBody}>
                {newsDetail.body}
              </Text>
            </View>
          )}

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={16} color="#666" />
              <Text style={styles.metaText}>
                Fetched: {newsDetail?.fetched_at 
                  ? new Date(newsDetail.fetched_at).toLocaleDateString() 
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
        <Footer/>
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
  contentContainer: {
    flex: 1,
    marginTop: 70,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  backButton: {
    backgroundColor: "#f93232",
    borderRadius: 14,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    gap: 10,
    shadowColor: "#f93232",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#f93232",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  articleButton: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#f93232",
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  articleButtonText: {
    color: "#f93232",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  newsCard: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  newsImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  },
  channelName: {
    fontSize: 15,
    color: "#901919",
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    backgroundColor: "#fff1f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ffe5e5",
  },
  newsTitle: {
    fontWeight: "900",
    fontSize: 32,
    marginBottom: 20,
    color: "#0f172a",
    lineHeight: 40,
    letterSpacing: -0.5,
    textShadowColor: "rgba(15, 23, 42, 0.05)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
  },
  newsTime: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  summaryContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  summaryLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  newsSummary: {
    fontSize: 17,
    color: "#475569",
    lineHeight: 28,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  bodyContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  bodyLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  newsBody: {
    fontSize: 17,
    color: "#475569",
    lineHeight: 28,
    fontWeight: "500",
    letterSpacing: -0.1,
    textAlign: "left",
  },
  metaContainer: {
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
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
    shadowRadius: 20,
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
});