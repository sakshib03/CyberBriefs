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
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { API_BASE } from "../../utils/config";
import CustomTabNavigator from "../customTabNavigator";
import Footer from "../footer";

export default function BlogDetails() {
  const params = useLocalSearchParams();
  const blogId = params.blogId || "1";
  const { width } = useWindowDimensions();

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

  const systemFonts = [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ];

  const tagsStyles = {
    body: {
      fontFamily: systemFonts.join(","),
      fontSize: 18,
      color: "#475569",
      lineHeight: 28,
    },
    h1: {
      fontSize: 26,
      fontWeight: "800",
      color: "#dc2626",
      marginBottom: 16,
      lineHeight: 36,
      fontFamily: systemFonts.join(","),
    },
    h2: {
      fontSize: 22,
      fontWeight: "700",
      color: "#0f172a",
      marginTop: 20,
      marginBottom: 12,
      lineHeight: 30,
      fontFamily: systemFonts.join(","),
    },
    h3: {
      fontSize: 20,
      fontWeight: "600",
      color: "#0f172a",
      marginTop: 16,
      marginBottom: 10,
      lineHeight: 28,
      fontFamily: systemFonts.join(","),
    },
    p: {
      fontSize: 18,
      color: "#475569",
      lineHeight: 28,
      marginBottom: 16,
      fontFamily: systemFonts.join(","),
      textAlign: "justify",
    },
    strong: {
      fontWeight: "700",
      color: "#0f172a",
    },
    em: {
      fontStyle: "italic",
    },
    u: {
      textDecorationLine: "underline",
    },
    ul: {
      marginBottom: 16,
      marginLeft: 0,
      marginTop: 8,
      paddingLeft: 20,
    },
    ol: {
      marginBottom: 16,
      marginLeft: 0,
      marginTop: 8,
      paddingLeft: 20,
    },
    li: {
      fontSize: 18,
      color: "#475569",
      lineHeight: 28,
      marginBottom: 8,
      fontFamily: systemFonts.join(","),
    },
    span: {
      fontSize: 18,
      color: "#475569",
      lineHeight: 28,
      fontFamily: systemFonts.join(","),
    },
    a: {
      color: "#fc2f2fff",
      textDecorationLine: "underline",
    },
    br: {
      height: 0,
    },
    table: {
      borderWidth: 1,
      borderColor: "#c6c6c6ff",
      borderRadius: 8,
      marginVertical: 20,
      backgroundColor: "#fff",
      overflow: "hidden",
    },
    tr: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#c6c6c6ff",
    },
    th: {
      flex: 1,
      padding: 12,
      backgroundColor: "#f8fafc",
      fontWeight: "700",
      color: "#0f172a",
      textAlign: "center",
      borderRightWidth: 1,
      borderRightColor: "#c6c6c6ff",
      fontSize: 16,
    },
    td: {
      flex: 1,
      padding: 12,
      textAlign: "center",
      borderRightWidth: 1,
      borderRightColor: "#c6c6c6ff",
      fontSize: 16,
      color: "#475569",
    },
    "td:last-child": {
      borderRightWidth: 0,
    },
    "th:last-child": {
      borderRightWidth: 0,
    },
  };

  const preprocessHTML = (html) => {
    if (!html) return "";

    let processed = html
      .replace(/&nbsp;/g, " ")
      .replace(/&rsquo;/g, "'")
      .replace(/&mdash;/g, "—")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<br\s*\/?>/gi, "<br/>")
      .replace(/\r\n/g, "\n");

    processed = processed.replace(/<colgroup>[\s\S]*?<\/colgroup>/g, "");

    processed = processed.replace(/style="[^"]*"/g, "");

    processed = processed.replace(/<p[^>]*>/g, "<p>");

    processed = processed.replace(/height="[^"]*"/g, "");

    return processed;
  };

  const hasHtmlContent = (html) => {
    if (!html) return false;
    const textOnly = html.replace(/<[^>]*>/g, "").trim();
    return textOnly.length > 0;
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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchBlogDetails(blogId)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <CustomTabNavigator />
      </View>
    );
  }

  console.log("Blog data loaded:", {
    title: blogData?.title?.substring(0, 100),
    bodyLength: blogData?.body?.length,
    hasBody: !!blogData?.body,
    hasHtmlContent: hasHtmlContent(blogData?.body),
  });

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/components/Blogs/allBlogs")}
          >
            <Feather name="arrow-left" size={20} color={"#fff"} />
            <Text style={styles.backButtonText}>Back to Blogs</Text>
          </TouchableOpacity>

          {blogData?.originalLink && (
            <TouchableOpacity
              style={styles.originalLinkButton}
              onPress={handleOpenOriginalLink}
            >
              <Text style={styles.originalLinkText}>Original Article</Text>
              <Feather name="external-link" size={22} color={"#fc2f2fff"} />
            </TouchableOpacity>
          )}
        </View>

        {blogData && (
          <View style={styles.newsCard}>
            <Image
              source={{
                uri: `${blogData.imagePath}`,
              }}
              style={styles.newsImage}
              resizeMode="cover"
              defaultSource={require("@/assets/images/default_image.png")}
              onError={(e) => {
                console.log("Image load error:", e.nativeEvent.error);
              }}
            />

            {blogData.title ? (
              <RenderHtml
                contentWidth={width - 88}
                source={{ html: preprocessHTML(blogData.title) }}
                tagsStyles={tagsStyles}
                baseStyle={styles.htmlBase}
                systemFonts={systemFonts}
              />
            ) : (
              <Text style={styles.fallbackTitle}>Blog Title</Text>
            )}

            <View style={styles.authorMetaSection}>
              <View style={styles.authorInfo}>
                <Image
                  source={require("@/assets/images/photo.png")}
                  style={styles.authorImage}
                />
                <View style={styles.authorDetails}>
                  <Text style={styles.authorName}>{blogData.author}</Text>
                  <Text style={styles.authorTime}>{blogData.timeAgo}</Text>
                </View>
              </View>

              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Feather name="calendar" size={14} color="#64748b" />
                  <Text style={styles.metaText}>
                    {new Date(blogData.publishedTime).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.htmlContainer}>
              {hasHtmlContent(blogData.body) ? (
                <RenderHtml
                  contentWidth={width - 88}
                  source={{ html: preprocessHTML(blogData.body) }}
                  tagsStyles={tagsStyles}
                  baseStyle={styles.htmlBase}
                  systemFonts={systemFonts}
                  enableExperimentalMarginCollapsing={true}
                  defaultTextProps={{
                    style: {
                      fontSize: 18,
                      color: "#475569",
                      lineHeight: 28,
                      fontFamily: systemFonts.join(","),
                    },
                  }}
                />
              ) : (
                <Text style={styles.fallbackText}>
                  {blogData.body?.replace(/<[^>]*>/g, " ") ||
                    "No content available"}
                </Text>
              )}
            </View>

            <View style={styles.divider} />
          </View>
        )}
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
    marginTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#fc2f2fff",
    borderRadius: 8,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  originalLinkButton: {
    flexDirection: "row",
    padding: 8,
    gap: 6,
    alignItems: "center",
  },
  originalLinkText: {
    color: "#fc2f2fff",
    fontSize: 16,
    fontWeight: "600",
  },
  newsCard: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    padding: 16,
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
  htmlContainer: {
    marginTop: 8,
  },
  htmlBase: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  fallbackTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#dc2626",
    marginBottom: 20,
    lineHeight: 36,
  },
  fallbackText: {
    fontSize: 18,
    color: "#475569",
    lineHeight: 28,
    marginBottom: 16,
    textAlign: "justify",
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
  authorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  authorDetails: {
    marginLeft: 12,
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
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 24,
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
