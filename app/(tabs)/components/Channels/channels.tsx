import Header from "@/app/(tabs)/components/header";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE } from "../../utils/config";
import CustomTabNavigator from "../customTabNavigator";

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - ITEM_MARGIN * 3) / 2;

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchChannels();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchChannels = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.8);
      }
      setError(null);

      const response = await fetch(`${API_BASE}/cyber/channels`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setChannels(data);
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));

      if (data.length > 0) {
        setTimeout(() => {
          startAnimations();
        }, 300);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      setError("Failed to load channels. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchChannels();
  };

  const getPaginatedChannels = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return channels.slice(startIndex, endIndex);
  };

  const handlePageClick = (pageNumber: number) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageClick(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageClick(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const renderChannelItem = ({ item, index }: { item: ChannelItem; index: number }) => {
    const itemDelay = index * 100;
    
    return (
      <Animated.View
        style={[
          styles.channelItem,
          { width: ITEM_WIDTH },
          index % 2 === 0
            ? { marginRight: ITEM_MARGIN }
            : { marginLeft: ITEM_MARGIN },
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0],
                }),
              },
              {
                scale: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.channelImageContainer}
          activeOpacity={0.7}
          onPress={() => {
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();
            
            router.push({
              pathname: "/(tabs)/components/Channels/channelNews",
              params: { channelName: item.channel },
            });
          }}
        >
          {item.image ? (
            <Image
              source={{ uri: `${API_BASE}/${item.image}` }}
              style={styles.channelLogo}
              resizeMode="cover"
              onError={() => console.log(`Error loading image: ${item.image}`)}
            />
          ) : (
            <View style={[styles.channelLogo, styles.placeholderLogo]}>
              <Text style={styles.channelInitial}>{item.channel.charAt(0)}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.channelInfo}>
          <Text style={styles.channelName} numberOfLines={2} ellipsizeMode="tail">
            {item.channel}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderPagination = () => (
    <Animated.View 
      style={[
        styles.paginationContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === 1 && styles.disabledButton,
        ]}
        onPress={handlePrevPage}
        disabled={currentPage === 1}
        activeOpacity={0.6}
      >
        <Feather
          name="chevron-left"
          size={20}
          color={currentPage === 1 ? "#999" : "#23467eff"}
        />
        <Text
          style={[
            styles.paginationButtonText,
            currentPage === 1 && styles.disabledButtonText,
          ]}
        >
          Prev
        </Text>
      </TouchableOpacity>

      <View style={styles.pageNumbersContainer}>
        {currentPage > 3 && (
          <>
            <TouchableOpacity
              style={[
                styles.pageNumber,
                currentPage === 1 && styles.activePageNumber,
              ]}
              onPress={() => handlePageClick(1)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pageNumberText,
                  currentPage === 1 && styles.activePageNumberText,
                ]}
              >
                1
              </Text>
            </TouchableOpacity>
            {currentPage > 4 && <Text style={styles.pageEllipsis}>...</Text>}
          </>
        )}

        {getPageNumbers().map((pageNumber, index) => (
          <TouchableOpacity
            key={pageNumber}
            style={[
              styles.pageNumber,
              currentPage === pageNumber && styles.activePageNumber,
            ]}
            onPress={() => handlePageClick(pageNumber)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pageNumberText,
                currentPage === pageNumber && styles.activePageNumberText,
              ]}
            >
              {pageNumber}
            </Text>
          </TouchableOpacity>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && (
              <Text style={styles.pageEllipsis}>...</Text>
            )}
            <TouchableOpacity
              style={[
                styles.pageNumber,
                currentPage === totalPages && styles.activePageNumber,
              ]}
              onPress={() => handlePageClick(totalPages)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pageNumberText,
                  currentPage === totalPages && styles.activePageNumberText,
                ]}
              >
                {totalPages}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === totalPages && styles.disabledButton,
        ]}
        onPress={handleNextPage}
        disabled={currentPage === totalPages}
        activeOpacity={0.6}
      >
        <Text
          style={[
            styles.paginationButtonText,
            currentPage === totalPages && styles.disabledButtonText,
          ]}
        >
          Next
        </Text>
        <Feather
          name="chevron-right"
          size={20}
          color={currentPage === totalPages ? "#999" : "#23467eff"}
        />
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#23467eff" />
          <Text style={styles.loadingText}>Loading channels...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchChannels}>
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

      <View style={styles.contentContainer}>
        <Animated.Text 
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          All Channels ({channels.length})
        </Animated.Text>

        {channels.length > 0 ? (
          <>
            <FlatList
              data={getPaginatedChannels()}
              renderItem={renderChannelItem}
              keyExtractor={(item, index) => `${item.channel}-${index}`}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
              numColumns={2}
              ListFooterComponent={<View style={{ height: 20 }} />}
            />

            {totalPages > 1 && renderPagination()}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="tv" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No channels found</Text>
          </View>
        )}
        
        
      </View>

      <CustomTabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
    marginTop: 40,
    paddingBottom: 70,
  },
  title: {
    color: "#f93232ff",
    fontWeight: "600",
    fontSize: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listContainer: {
    padding: ITEM_MARGIN,
  },
  channelItem: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: "center",
    marginBottom: 20,
  },
  channelImageContainer: {
    marginBottom: 12,
  },
  channelLogo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#f93232",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  placeholderLogo: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderWidth: 1,
    borderColor: "#23467eff",
  },
  channelInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#23467eff",
  },
  channelInfo: {
    width: "100%",
    alignItems: "center",
  },
  channelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#091b38ff",
    marginBottom: 6,
    textAlign: "center",
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#23467eff",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    minWidth: 80,
    justifyContent: "center",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#23467eff",
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  disabledButtonText: {
    color: "#999",
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius:8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "transparent",
  },
  activePageNumber: {
    backgroundColor: "#f93232ff",
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activePageNumberText: {
    color: "#fff",
  },
  pageEllipsis: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 4,
  },
});
