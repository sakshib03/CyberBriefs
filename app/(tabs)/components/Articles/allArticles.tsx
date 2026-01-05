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
import { useState, useEffect } from "react";
import Header from "@/app/(tabs)/components/header";
import CustomTabNavigator from "../customTabNavigator";
import { router } from "expo-router";
import { API_BASE } from "../../utils/config";
import { Feather } from "@expo/vector-icons";

export default function AllArticles() {
  const [newsData, setNewsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(3);

  const fetchAllArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/news/cyber/recent`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllArticles();
  }, []);

  const filteredNews = newsData.filter(
    (item) =>
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredNews.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredNews.length / articlesPerPage);

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
          <ActivityIndicator size="large" color="#23467eff" />
          <Text style={styles.loadingText}>Loading Articles...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchAllArticles}>
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles, channels, topics..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>All Articles</Text>
        
        {currentArticles.length > 0 ? (
          <>
            {currentArticles.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.newsCard}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/components/Channels/newsDetails",
                    params: {
                      newsId: item.id.toString(),
                      headline: item.headline,
                      summary: item.summary,
                      image: item.image,
                      publishedTime: item.published_time,
                      channel: item.channel
                    },
                  })
                }
              >
                {item.image && (
                  <Image
                    source={{ uri: `${API_BASE}/${item.image}` }}
                    style={styles.newsImage}
                    resizeMode="cover"
                    onError={() => console.log(`Error loading image: ${item.image}`)}
                  />
                )}
                
                {/* Channel Badge */}
                <View style={styles.channelBadge}>
                  <Text style={styles.channelText}>{item.channel}</Text>
                </View>

                <Text style={styles.newsTitle}>{item.headline}</Text>

                <View style={styles.metaContainer}>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={14} color="#64748b" />
                    <Text style={styles.metaText}>
                      {new Date(item.published_time).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={14} color="#64748b" />
                    <Text style={styles.metaText}>
                      {(() => {
                        const publishedDate = new Date(item.published_time);
                        const currentDate = new Date();
                        const timeDiff = currentDate.getTime() - publishedDate.getTime();
                        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
                        
                        if (daysDiff === 0) return "Today";
                        if (daysDiff === 1) return "Yesterday";
                        return `${daysDiff} days ago`;
                      })()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.newsSummary} numberOfLines={3}>
                  {item.summary}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                {/* Previous Button */}
                <TouchableOpacity 
                  style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                  onPress={prevPage}
                  disabled={currentPage === 1}
                >
                  <Feather name="chevron-left" size={20} color={currentPage === 1 ? "#94a3b8" : "#091b38"} />
                  <Text style={[styles.pageButtonText, currentPage === 1 && styles.disabledButtonText]}>
                    Prev
                  </Text>
                </TouchableOpacity>

                {/* Page Numbers */}
                <View style={styles.pageNumbers}>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    if (pageNumber > totalPages) return null;

                    return (
                      <TouchableOpacity
                        key={pageNumber}
                        style={[styles.pageNumber, currentPage === pageNumber && styles.activePageNumber]}
                        onPress={() => paginate(pageNumber)}
                      >
                        <Text style={[styles.pageNumberText, currentPage === pageNumber && styles.activePageNumberText]}>
                          {pageNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Next Button */}
                <TouchableOpacity 
                  style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                  onPress={nextPage}
                  disabled={currentPage === totalPages}
                >
                  <Text style={[styles.pageButtonText, currentPage === totalPages && styles.disabledButtonText]}>
                    Next
                  </Text>
                  <Feather name="chevron-right" size={20} color={currentPage === totalPages ? "#94a3b8" : "#091b38"} />
                </TouchableOpacity>
              </View>
            )}

            {/* Page Info */}
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
              {searchQuery ? "No articles found matching your search" : "No articles available"}
            </Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
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
    color: "#091b38",
    fontWeight: "800",
    fontSize: 28,
    paddingVertical: 20,
    textAlign: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 5,
    letterSpacing: -0.5,
    textShadowColor: "rgba(9, 27, 56, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  newsCard: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
    paddingVertical: 24,
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
  channelBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#f93232",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  channelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontWeight: "800",
    fontSize: 22,
    marginTop: 0,
    color: "#0f172a",
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
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
  newsSummary: {
    fontSize: 16,
    color: "#475569",
    marginTop: 8,
    lineHeight: 24,
    fontWeight: "500",
    letterSpacing: -0.1,
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