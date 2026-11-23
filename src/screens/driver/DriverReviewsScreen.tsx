import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyRatingSummary, useReviewsReceived } from '../../hooks/useReviews';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { RatingStars } from '../../components/RatingStars';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { colors, spacing, typography } from '../../theme';

interface Props {
  navigation: any;
}

export const DriverReviewsScreen: React.FC<Props> = ({ navigation }) => {
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useMyRatingSummary();
  const { data: reviews = [], isLoading: loadingReviews, refetch: refetchReviews } = useReviewsReceived();

  const handleRefresh = () => {
    refetchSummary();
    refetchReviews();
  };

  const isLoading = loadingSummary || loadingReviews;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Passenger Feedback" onBack={() => navigation.goBack()} />

      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.scoreCol}>
                  <Text style={styles.scoreText}>
                    {summary?.driver_average_rating
                      ? summary.driver_average_rating.toFixed(1)
                      : summary?.average_rating
                      ? summary.average_rating.toFixed(1)
                      : '5.0'}
                  </Text>
                  <RatingStars
                    rating={summary?.driver_average_rating || summary?.average_rating || 5}
                    size={20}
                  />
                  <Text style={styles.totalReviews}>
                    {summary?.driver_reviews_count || summary?.total_reviews || 0} Passenger Reviews
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

            <Text style={styles.reviewsTitle}>All Passenger Reviews</Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No Passenger Reviews Yet"
              description="When passengers complete rides and leave ratings, their comments and badges will appear here."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.reviewItemWrapper}>
            <Card style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View>
                  <Text style={styles.reviewerName}>
                    {item.reviewer?.full_name || 'Passenger'}
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
  reviewsTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
