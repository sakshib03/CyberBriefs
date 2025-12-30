import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Header from "@/app/(tabs)/components/header";
import CustomTabNavigator from "./customTabNavigator";
import { router, useLocalSearchParams } from "expo-router";
import { API_BASE } from "../utils/config";

export default function BlogDetails() {
  const params = useLocalSearchParams();
  const blogId = params.blogId || "1";
  
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDaysAgo = (publishedTime) => {
    const publishedDate = new Date(publishedTime);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - publishedDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const monthsDiff = Math.floor(daysDiff / 30);
    const yearsDiff = Math.floor(daysDiff / 365);

    if (yearsDiff > 0) {
      return `${yearsDiff} ${yearsDiff === 1 ? "year" : "years"} ago`;
    } else if (monthsDiff > 0) {
      return `${monthsDiff} ${monthsDiff === 1 ? "month" : "months"} ago`;
    } else if (daysDiff === 0) {
      return "Today";
    } else if (daysDiff === 1) {
      return "Yesterday";
    } else {
      return `${daysDiff} days ago`;
    }
  };

  const getReadTime = (body) => {
    const wordsPerMinute = 200;
    const wordCount = body.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  const fetchBlogDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/news/blogs/vikram/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const mappedBlog = {
        id: data.id,
        title: data.headline,
        body: data.body,
        publishedTime: data.published_time,
        imagePath: data.image_path,
        author: data.author,
        timeAgo: getDaysAgo(data.published_time),
        readTime: getReadTime(data.body),
        originalLink: data.original_link,
      };
      
      setBlogData(mappedBlog);
    } catch (err) {
      console.error("Error fetching blog details:", err);
      setError(err.message || "Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchBlogDetails(blogId);
    }
  }, [blogId]);

  const handleOpenOriginalLink = () => {
    if (blogData?.originalLink) {
      Linking.openURL(blogData.originalLink).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f93232" />
          <Text style={styles.loadingText}>Loading Blog Details...</Text>
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
          <Feather name="alert-circle" size={50} color="#f93232" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchBlogDetails(blogId)}>
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
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#fc2f2fff",
              borderRadius: 8,
              flexDirection: "row",
              paddingHorizontal: 14,
              paddingVertical: 10,
              gap: 6,
            }}
            onPress={() => router.push("/(tabs)/components/allBlogs")}
          >
            <Feather name="arrow-left" size={20} color={"#fff"} />
            <Text style={{ color: "#fff", fontSize: 14 }}>Back to Blogs</Text>
          </TouchableOpacity>
          
          {blogData?.originalLink && (
            <TouchableOpacity
              style={{ flexDirection: "row", padding: 6, gap: 6, alignItems: "center" }}
              onPress={handleOpenOriginalLink}
            >
              <Text style={{ color: "#fc2f2fff", fontSize: 16 }}>
                Original Article
              </Text>
              <Feather name="external-link" size={22} color={"#fc2f2fff"} />
            </TouchableOpacity>
          )}
        </View>

        {blogData && (
          <View style={styles.newsCard}>
            <Image
              source={{ 
                uri: `${API_BASE}${blogData.imagePath}`,
              }}
              style={styles.newsImage}
              resizeMode="cover"
              defaultSource={require("@/assets/images/img1.jpeg")}
              onError={(e) => {
                console.log("Image load error:", e.nativeEvent.error);
              }}
            />
            
            <Text style={styles.newsTitle}>{blogData.title}</Text>

            {/* Author and Metadata Section */}
            <View style={styles.authorMetaSection}>
              <View style={styles.authorInfo}>
                <Image
                  source={require("@/assets/images/photo.png")}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.authorName}>{blogData.author}</Text>
                  <Text style={styles.authorTime}>{blogData.timeAgo}</Text>
                </View>
              </View>
              
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Feather name="calendar" size={14} color="#64748b" />
                  <Text style={styles.metaText}>
                    {new Date(blogData.publishedTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.newsBody}>{blogData.body}</Text>
          </View>
        )}
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
    paddingHorizontal: 24,
  },
  newsCard: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    padding: 20,
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
    height: 220,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  newsTitle: {
    fontWeight: "800",
    fontSize: 26,
    color: "#0f172a",
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 20,
    textShadowColor: "rgba(15, 23, 42, 0.05)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  authorMetaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 16,
    color: "#030303ff",
    fontWeight: "600",
  },
  authorTime: {
    color: "#434242ff",
    fontSize: 14,
    marginTop: 4,
  },
  metaInfo: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  newsBody: {
    fontSize: 18,
    color: "#475569",
    lineHeight: 28,
    fontWeight: "500",
    letterSpacing: -0.1,
    textAlign: "justify",
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
    fontSize: 18,
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
    backgroundColor: "#f93232",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#f93232",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: "#f93232",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});