import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useMyRatingSummary,
  useReviewsGiven,
  useReviewsReceived,
} from '../../hooks/useReviews';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { RatingStars } from '../../components/RatingStars';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  navigation: any;
}

export const MyReviewsScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useMyRatingSummary();
  const { data: given = [], isLoading: loadingGiven, refetch: refetchGiven } = useReviewsGiven();
  const { data: received = [], isLoading: loadingReceived, refetch: refetchReceived } = useReviewsReceived();

  const handleRefresh = () => {
    refetchSummary();
    refetchGiven();
    refetchReceived();
  };

  const reviewsList = activeTab === 'received' ? received : given;
  const isLoading = loadingSummary || (activeTab === 'received' ? loadingReceived : loadingGiven);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Ratings & Reviews" onBack={() => navigation.goBack()} />

      <FlatList
        data={reviewsList}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Rating Summary Card */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.scoreCol}>
                  <Text style={styles.scoreText}>
                    {summary?.average_rating ? summary.average_rating.toFixed(1) : '5.0'}
                  </Text>
                  <RatingStars
                    rating={summary?.average_rating || 5}
                    size={18}
                  />
                  <Text style={styles.totalReviews}>
                    {summary?.total_reviews || 0} Total Reviews
                  </Text>
                </View>

                {summary?.rating_breakdown && (
                  <View style={styles.breakdownCol}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = summary.rating_breakdown[String(stars)] || 0;
                      const total = summary.total_reviews || 1;
                      const pct = Math.min(100, Math.round((count / total) * 100));

                      return (
                        <View key={stars} style={styles.breakdownBarRow}>
                          <Text style={styles.starNum}>{stars}★</Text>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${pct}%` }]} />
                          </View>
                          <Text style={styles.countNum}>{count}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </Card>

            {/* Sub Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                onPress={() => setActiveTab('received')}
                style={[styles.tab, activeTab === 'received' && styles.tabActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
                  Received ({received.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('given')}
                style={[styles.tab, activeTab === 'given' && styles.tabActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.tabText, activeTab === 'given' && styles.tabTextActive]}>
                  Given ({given.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={`No Reviews ${activeTab === 'received' ? 'Received' : 'Given'}`}
              description="Complete trips to exchange feedback and build your community rating."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.reviewItemWrapper}>
            <Card style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View>
                  <Text style={styles.reviewerName}>
                    {item.reviewer?.full_name || (activeTab === 'received' ? 'Co-rider' : 'You')}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <RatingStars rating={item.rating} size={16} />
              </View>

              {item.tags && (
                <View style={styles.reviewTags}>
                  <Text style={styles.tagsText}>Tags: {item.tags}</Text>
                </View>
              )}

              {item.comment ? (
                <Text style={styles.commentText}>"{item.comment}"</Text>
              ) : null}
            </Card>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    padding: spacing.md,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCol: {
    alignItems: 'center',
    paddingRight: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  scoreText: {
    ...typography.h1,
    fontSize: 44,
    color: colors.primary,
    fontWeight: '800',
    lineHeight: 48,
  },
  totalReviews: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  breakdownCol: {
    flex: 1,
    paddingLeft: spacing.md,
  },
  breakdownBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  starNum: {
    ...typography.caption,
    width: 24,
    color: colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginHorizontal: spacing.xs,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  countNum: {
    ...typography.caption,
    width: 20,
    color: colors.textMuted,
    textAlign: 'right',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginTop: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  reviewItemWrapper: {
    paddingHorizontal: spacing.md,
  },
  reviewCard: {
    marginBottom: spacing.sm,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  reviewerName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
  },
  reviewDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  reviewTags: {
    marginTop: spacing.xs,
  },
  tagsText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontStyle: 'italic',
  },
  commentText: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});
