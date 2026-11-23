import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassengerStackParamList } from '../../navigation/types';
import { useSubmitReview } from '../../hooks/useReviews';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { RatingStars } from '../../components/RatingStars';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<PassengerStackParamList, 'RateTrip'>;

const AVAILABLE_TAGS = [
  'Punctual',
  'Polite & Friendly',
  'Clean Car',
  'Smooth Driving',
  'Great Music',
  'Safe Driver',
];

export const RateTripScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId, driverName } = route.params;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitReviewMutation = useSubmitReview();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await submitReviewMutation.mutateAsync({
        booking_id: bookingId,
        rating,
        comment: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      setSuccessMessage('Thank you! Your review has been submitted.');
      setTimeout(() => {
        navigation.navigate('PassengerTabs', { screen: 'MyBookings' });
      }, 1500);
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Rate Trip" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <Card style={styles.ratingCard}>
            <Text style={styles.title}>
              How was your trip with {driverName || 'the driver'}?
            </Text>
            <Text style={styles.subtitle}>
              Your rating helps build trust across the Winnie4 car-sharing community.
            </Text>

            <View style={styles.starsWrapper}>
              <RatingStars
                rating={rating}
                maxStars={5}
                size={36}
                onRatingChange={setRating}
              />
              <Text style={styles.ratingLabel}>
                {rating === 5
                  ? 'Excellent!'
                  : rating === 4
                  ? 'Very Good'
                  : rating === 3
                  ? 'Average'
                  : rating === 2
                  ? 'Poor'
                  : 'Terrible'}
              </Text>
            </View>
          </Card>

          {/* Feedback Tags */}
          <Card>
            <Text style={styles.sectionTitle}>What did you like?</Text>
            <View style={styles.tagsRow}>
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.tagText,
                        isSelected && styles.tagTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Written Comment */}
          <Card>
            <Input
              label="Leave a Comment (Optional)"
              placeholder="Share details about your experience..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top' }}
            />
          </Card>

          <Button
            title="Submit Review"
            size="lg"
            onPress={handleSubmit}
            loading={submitReviewMutation.isPending}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
  },
  ratingCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  starsWrapper: {
    alignItems: 'center',
  },
  ratingLabel: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  submitBtn: {
    marginVertical: spacing.lg,
  },
  successBanner: {
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
});
