import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather, Fontisto } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Header from "@/app/(tabs)/components/header";
import CustomTabNavigator from "../../components/customTabNavigator";
import { router } from "expo-router";
import { API_BASE } from "../../utils/config";
import Footer from "../footer";

export default function Newsletter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newslettersPerPage] = useState(3);

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
    const cleanText = body
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&rsquo;/g, "'")
      .replace(/&mdash;/g, "—")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    const wordCount = cleanText.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&mdash;/g, "—")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  const extractSummary = (html) => {
    if (!html) return "";

    const firstParagraphMatch = html.match(/<p[^>]*>(.*?)<\/p>/);
    if (firstParagraphMatch && firstParagraphMatch[1]) {
      const cleanText = stripHtmlTags(firstParagraphMatch[1]);
      if (cleanText.length > 30) {
        return cleanText.length > 150
          ? cleanText.substring(0, 150) + "..."
          : cleanText;
      }
    }

    const cleanText = stripHtmlTags(html);
    return cleanText.length > 150
      ? cleanText.substring(0, 150) + "..."
      : cleanText;
  };

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/newsletter/y2ai`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const mappedNewsletters = data.map((item) => {
        const cleanTitle = stripHtmlTags(item.headline);
        const summary = extractSummary(item.body);

        return {
          id: item.id,
          title: cleanTitle,
          summary: summary,
          fullBody: item.body,
          publishedTime: item.published_time,
          imagePath: item.image,
          timeAgo: getDaysAgo(item.published_time),
          readTime: getReadTime(item.body),
        };
      });

      setNewsletters(mappedNewsletters);
    } catch (err) {
      console.error("Error fetching newsletters:", err);
      setError(err.message || "Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const filteredNewsletters = newsletters.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const cleanTitle = stripHtmlTags(item.title).toLowerCase();
    const cleanSummary = stripHtmlTags(item.summary).toLowerCase();
    const cleanBody = stripHtmlTags(item.fullBody).toLowerCase();

    return (
      cleanTitle.includes(searchLower) ||
      cleanSummary.includes(searchLower) ||
      cleanBody.includes(searchLower)
    );
  });

  const indexOfLastNewsletter = currentPage * newslettersPerPage;
  const indexOfFirstNewsletter = indexOfLastNewsletter - newslettersPerPage;
  const currentNewsletters = filteredNewsletters.slice(
    indexOfFirstNewsletter,
    indexOfLastNewsletter
  );
  const totalPages = Math.ceil(filteredNewsletters.length / newslettersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f93232" />
          <Text style={styles.loadingText}>Loading Newsletters...</Text>
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
            onPress={fetchNewsletters}
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
        <TextInput
          placeholder="Search newsletters by title or content..."
          placeholderTextColor={"#595858ff"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentNewsletters.length > 0 ? (
          <>
            {currentNewsletters.map((item) => (
              <View key={item.id} style={styles.newsCard}>
                <Image
                  source={{ uri: `${item.imagePath}` }}
                  style={styles.newsImage}
                  resizeMode="cover"
                  defaultSource={require("@/assets/images/img1.jpeg")}
                  onError={(e) => {
                    console.log("Image load error:", e.nativeEvent.error);
                  }}
                />

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/components/Blogs/blogDetails",
                      params: {
                        id: item.id.toString(),
                        title: item.title,
                        body: item.fullBody,
                        publishedTime: item.publishedTime,
                        readTime: item.readTime,
                        imagePath: item.imagePath,
                      },
                    })
                  }
                >
                  <Text style={styles.newsTitle}>{item.title}</Text>
                </TouchableOpacity>

                <View style={styles.metaInfo}>
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={14} color="#64748b" />
                    <Text style={styles.metaText}>
                      {new Date(item.publishedTime).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{item.timeAgo}</Text>
                  </View>
                  {/* <View style={styles.metaItem}>
                    <Feather name="clock" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{item.readTime}</Text>
                  </View> */}
                </View>

                <Text style={styles.newsSummary} numberOfLines={3}>
                  {item.summary}
                </Text>

                <View style={styles.authorSection}>
                  <View style={styles.newsletterBadge}>
                    <Text style={styles.newsletterBadgeText}>NEWSLETTER</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() =>
                      router.push({
                        pathname:
                          "/(tabs)/components/NewsLetter/newsLetterDetails",
                        params: {
                          id: item.id.toString(),
                          title: item.title,
                          body: item.fullBody,
                          publishedTime: item.publishedTime,
                          readTime: item.readTime,
                          imagePath: item.imagePath,
                        },
                      })
                    }
                  >
                    <Text style={styles.readMoreText}>Read Newsletter</Text>
                    <Feather
                      name="external-link"
                      size={22}
                      color={"#fc2f2fff"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    currentPage === 1 && styles.disabledButton,
                  ]}
                  onPress={prevPage}
                  disabled={currentPage === 1}
                >
                  <Feather
                    name="chevron-left"
                    size={20}
                    color={currentPage === 1 ? "#94a3b8" : "#091b38"}
                  />
                  <Text
                    style={[
                      styles.pageButtonText,
                      currentPage === 1 && styles.disabledButtonText,
                    ]}
                  >
                    Prev
                  </Text>
                </TouchableOpacity>

                <View style={styles.pageNumbers}>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 2) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNumber = totalPages - 2 + i;
                    } else {
                      pageNumber = currentPage - 1 + i;
                    }

                    if (pageNumber > totalPages) return null;

                    return (
                      <TouchableOpacity
                        key={pageNumber}
                        style={[
                          styles.pageNumber,
                          currentPage === pageNumber && styles.activePageNumber,
                        ]}
                        onPress={() => paginate(pageNumber)}
                      >
                        <Text
                          style={[
                            styles.pageNumberText,
                            currentPage === pageNumber &&
                              styles.activePageNumberText,
                          ]}
                        >
                          {pageNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    currentPage === totalPages && styles.disabledButton,
                  ]}
                  onPress={nextPage}
                  disabled={currentPage === totalPages}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      currentPage === totalPages && styles.disabledButtonText,
                    ]}
                  >
                    Next
                  </Text>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={currentPage === totalPages ? "#94a3b8" : "#091b38"}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.pageInfoContainer}>
              <Text style={styles.pageInfoText}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No newsletters found matching your search"
                : "No newsletters available"}
            </Text>
          </View>
        )}
        {currentNewsletters.length > 0 && <Footer/>}
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
    marginTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: "#fff",
    color: "#334155",
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 8,
  },
  resultsContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resultsText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    color: "#f93232",
    fontWeight: "800",
    fontSize: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    letterSpacing: -0.5,
    textShadowColor: "rgba(249, 50, 50, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 80,
    paddingHorizontal: 15,
  },
  newsCard: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
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
    fontSize: 24,
    color: "#0f172a",
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  newsSummary: {
    fontSize: 16,
    color: "#475569",
    marginTop: 8,
    lineHeight: 24,
    fontWeight: "500",
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  authorSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  newsletterBadge: {
    backgroundColor: "#f93232",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  newsletterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  readMoreButton: {
    flexDirection: "row",
    padding: 8,
    gap: 6,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  readMoreText: {
    color: "#fc2f2fff",
    fontSize: 14,
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: "#f1f5f9",
  },
  pageButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#091b38",
  },
  disabledButtonText: {
    color: "#94a3b8",
  },
  pageNumbers: {
    flexDirection: "row",
    gap: 8,
  },
  pageNumber: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  activePageNumber: {
    backgroundColor: "#f93232",
    borderColor: "#f93232",
  },
  pageNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#091b38",
  },
  activePageNumberText: {
    color: "#fff",
  },
  pageInfoContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 8,
  },
  pageInfoText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
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
