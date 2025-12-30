import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import Header from "@/app/(tabs)/components/header";
import CustomTabNavigator from "./components/customTabNavigator";
import { router } from "expo-router";
import RenderHTML from "react-native-render-html";
import { API_BASE } from "./utils/config";

export default function HomeScreen() {
  const [popularArticles, setPopularArticles] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timeoutRef = useState(null);

  const images = [
    require("@/assets/images/img1.jpeg"),
    require("@/assets/images/img2.jpeg"),
    require("@/assets/images/img3.jpeg"),
  ];

  useEffect(() => {
    timeoutRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, []);

  const darkWebNews = [
    {
      id: 1,
      title: "Data Breach Discovered at integliatech.com",
      summary:
        "Integlia Tech (formerly known as Integlia Technology Solutions Private Limited) is a private, unlisted software development company based in Pune, Maharashtra, India.",
      details:
        "BrotherHood Threat Actor Identified | Discovered: 10-15-2025 | Country: India",
    },
  ];

  const getDaysAgo = (publishedTime) => {
    const publishedDate = new Date(publishedTime);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - publishedDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) {
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

  const fetchPopularArticles = async () => {
    try {
      const response = await fetch(`${API_BASE}/news/cyber/recent`);
      const data = await response.json();

      const mappedArticles = data.slice(0, 10).map((item) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        days: getDaysAgo(item.published_time),
        channel: item.channel,
        image: item.image,
        published_time: item.published_time,
      }));

      setPopularArticles(mappedArticles);
    } catch (error) {
      console.error("Error fetching popular articles:", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const response = await fetch(`${API_BASE}/news/blogs/vikram`);
      const data = await response.json();

      const mappedBlogs = data.slice(0, 2).map((item) => ({
        id: item.id,
        title: item.headline,
        summary: item.body.substring(0, 150) + "...", 
        publishedTime: item.published_time,
        imagePath: item.image_path,
        author: item.author,
        timeAgo: getDaysAgo(item.published_time),
        readTime: getReadTime(item.body),
        fullBody: item.body,
      }));

      setBlogPosts(mappedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);

    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  useEffect(() => {
    fetchPopularArticles();
    fetchBlogs();
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Aflac data breach exposes 22 million customers, cybersecurity
            concerns persist
          </Text>
          <Text style={styles.heroSubtitle}>
            Latest insights from cybersecurity experts
          </Text>
        </View>

        {/* Featured Article */}

        <View style={styles.featuredCard}>
          <View style={styles.featuredBadge}>
            <Text style={styles.badgeText}>FEATURED</Text>
          </View>
          <Image
            source={images[currentImageIndex]}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.paginationContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
          {/* <View style={styles.featuredContent}>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/components/newsDetails")}
              >
                <Text style={styles.featuredTitle}>{item.title}</Text>
              </TouchableOpacity>

              <View style={styles.metaInfo}>
                <Feather name="clock" size={14} color="#888" />
                <Text style={styles.metaText}>
                  {new Date(item.publishedTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <Text style={styles.featuredSummary} numberOfLines={3}>
                {item.summary}
              </Text>

              <View style={styles.authorSection}>
                <View style={styles.authorInfo}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.avatarText}>
                      {item.author.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{item.author}</Text>
                    <Text style={styles.authorTime}>{item.timeAgo}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.readMoreButton}
                  onPress={() => router.push("/(tabs)/components/blogDetails")}
                >
                  <Text style={styles.readMoreText}>Read Full</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View> */}
        </View>

        {/* Most Read Articles - Updated to use API data */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Most Read Articles</Text>
              <Text style={styles.sectionSubtitle}>
                Top trending in cybersecurity
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/(tabs)/components/allArticles")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="chevron-right" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {popularArticles.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.articleCard}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/components/newsDetails",
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
                <View style={styles.articleImageContainer}>
                  <Image
                    source={{ uri: `${API_BASE}/${item.image}` }}
                    style={styles.articleImage}
                    resizeMode="cover"
                  />
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{item.channel}</Text>
                  </View>
                </View>
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.headline}
                  </Text>

                  <View style={styles.articleMeta}>
                    <Feather name="calendar" size={12} color="#888" />
                    <Text style={styles.articleTime}>{item.days}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Blogs Section - Updated to use API data */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Latest Blogs</Text>
              <Text style={styles.sectionSubtitle}>
                Insights from security researcher
              </Text>
            </View>
          </View>

          {loadingBlogs ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f93232" />
              <Text style={styles.loadingText}>Loading blogs...</Text>
            </View>
          ) : blogPosts.length > 0 ? (
            <>
              {blogPosts.map((item) => (
                <View key={item.id} style={styles.blogCard}>
                  <Image
                    source={{ uri: `${API_BASE}${item.imagePath}` }}
                    style={styles.blogImage}
                    resizeMode="cover"
                    defaultSource={require("@/assets/images/img1.jpeg")}
                  />
                  <View style={styles.blogContent}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/components/blogDetails",
                          params: {
                            blogId: item.id.toString(),
                            title: item.title,
                            summary: item.summary,
                            body: item.fullBody,
                            author: item.author,
                            publishedTime: item.publishedTime,
                            readTime: item.readTime,
                            imagePath: item.imagePath,
                          },
                        })
                      }
                    >
                      <Text style={styles.blogTitle}>{item.title}</Text>
                    </TouchableOpacity>

                    <View style={styles.blogMeta}>
                      <View style={styles.metaItem}>
                        <Image
                        source={require("@/assets/images/photo.png")}
                        style={{ width: 40, height: 40, borderRadius: 25 }}
                      />
                        <Text style={styles.metaTextSmall}>{item.author}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="clock" size={14} color="#091b38" />
                        <Text style={styles.metaTextSmall}>
                          {timeAgo(item.publishedTime)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.blogSummary} numberOfLines={2}>
                      {item.summary}
                    </Text>

                    <TouchableOpacity
                      style={styles.blogReadButton}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/components/blogDetails",
                          params: {
                            blogId: item.id.toString(),
                            title: item.title,
                            summary: item.summary,
                            body: item.fullBody,
                            author: item.author,
                            publishedTime: item.publishedTime,
                            readTime: item.readTime,
                            imagePath: item.imagePath,
                          },
                        })
                      }
                    >
                      <Text style={styles.blogReadText}>Continue Reading</Text>
                      <Feather
                        name="arrow-up-right"
                        size={20}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.readMoreBlogsButton}
                onPress={() => router.push("/(tabs)/components/allBlogs")}
              >
                <Text style={styles.readMoreBlogsText}>Explore All Blogs</Text>
                <Feather name="book-open" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No blogs available</Text>
            </View>
          )}
        </View>

        <View style={styles.darkWebSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.darkWebTitle}>
                Latest from Y2AI Newsletter
              </Text>
              <Text style={styles.darkWebSubtitle}>
                Threat intelligence reports
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.darkWebButton}>
            <Text style={styles.darkWebButtonText}>All Reports</Text>
            <Feather name="external-link" size={16} color="#fff" />
          </TouchableOpacity>

          <View style={styles.darkWebCard}>
            <View style={styles.darkWebHeader}>
              <View style={styles.alertBadge}>
                <Feather name="alert-triangle" size={14} color="#fff" />
                <Text style={styles.alertText}>ALERT</Text>
              </View>
              <Text style={styles.darkWebTime}>Discovered: 10-15-2025</Text>
            </View>

            <Text style={styles.darkWebMainTitle}>
              Data Breach Discovered at integliatech.com
            </Text>
            <Text style={styles.darkWebSummary}>{darkWebNews[0].summary}</Text>

            <View style={styles.darkWebDetails}>
              <View style={styles.detailItem}>
                <Feather name="user" size={14} color="#666" />
                <Text style={styles.detailText}>BrotherHood Threat Actor</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="map-pin" size={14} color="#666" />
                <Text style={styles.detailText}>Country: India</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>View Full Report</Text>
              <Feather name="download" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text
            style={{ color: "#515050ff", marginTop: 20, textAlign: "center" }}
          >
            © 2026 cyberbriefs.org
          </Text>
        </View>
        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>

      <CustomTabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    zIndex: 999,
  },
  contentContainer: {
    marginTop: 50,
    paddingBottom: 80,
  },

  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#091b38",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },

  featuredCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#f93232",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  featuredImage: {
    width: "100%",
    height: 240,
  },
  featuredContent: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#091b38",
    lineHeight: 28,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
  },
  featuredSummary: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 20,
  },
  authorSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#23467e",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#091b38",
  },
  authorTime: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  readMoreButton: {
    backgroundColor: "#f93232",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  readMoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#091b38",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "600",
  },

  horizontalScroll: {
    paddingLeft: 2,
  },
  articleCard: {
    width: 180,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  articleImageContainer: {
    position: "relative",
  },
  articleImage: {
    width: "100%",
    height: 120,
  },
  categoryTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(249, 50, 50, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  articleContent: {
    padding: 12,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#091b38",
    lineHeight: 18,
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  articleTime: {
    fontSize: 12,
    color: "#888",
  },

  blogCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  blogImage: {
    width: "100%",
    height: 220,
  },
  blogContent: {
    padding: 20,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#091b38",
    lineHeight: 24,
    marginBottom: 12,
  },
  blogMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaTextSmall: {
    fontSize: 16,
    color: "#14122cff",
    fontWeight:500
  },
  blogSummary: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 16,
  },
  blogReadButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  blogReadText: {
    color: "#f93232",
    fontSize: 14,
    fontWeight: "600",
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },

  readMoreBlogsButton: {
    backgroundColor: "#f93232",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  readMoreBlogsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  darkWebSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  darkWebTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#091b38",
    marginBottom: 4,
  },
  darkWebSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
  },
  darkWebButton: {
    backgroundColor: "#091b38",
    alignSelf: "flex-end",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  darkWebButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  darkWebCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  darkWebHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f93232",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  alertText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  darkWebTime: {
    fontSize: 12,
    color: "#a0a0c0",
  },
  darkWebMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 24,
    marginBottom: 12,
  },
  darkWebSummary: {
    fontSize: 14,
    color: "#c0c0e0",
    lineHeight: 20,
    marginBottom: 16,
  },
  darkWebDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#a0a0c0",
  },
  reportButton: {
    backgroundColor: "#23467e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
    borderRadius: 12,
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  footerSpace: {
    height: 40,
  },

  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#f93232",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
