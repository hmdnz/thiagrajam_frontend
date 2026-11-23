import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface RatingStarsProps {
  rating: number; // 0 to 5
  maxStars?: number;
  onRatingChange?: (newRating: number) => void;
  size?: number;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  onRatingChange,
  size = 20,
  showText = false,
}) => {
  const isInteractive = !!onRatingChange;

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= Math.round(rating);

          return (
            <TouchableOpacity
              key={starNumber}
              disabled={!isInteractive}
              onPress={() => onRatingChange?.(starNumber)}
              style={styles.starWrapper}
              accessibilityRole={isInteractive ? 'button' : 'text'}
              accessibilityLabel={`${starNumber} star${starNumber > 1 ? 's' : ''}`}
            >
              <Text
                style={[
                  styles.star,
                  { fontSize: size, color: isFilled ? '#F59E0B' : colors.borderDark },
                ]}
              >
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {showText && <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starWrapper: {
    paddingHorizontal: 2,
  },
  star: {
    includeFontPadding: false,
  },
  ratingText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
