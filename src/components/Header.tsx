import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightActionTitle?: string;
  onRightAction?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightActionTitle,
  onRightAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightActionTitle && onRightAction && (
        <TouchableOpacity
          onPress={onRightAction}
          style={styles.rightButton}
          accessibilityRole="button"
          accessibilityLabel={rightActionTitle}
        >
          <Text style={styles.rightActionText}>{rightActionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftContainer: {
    flex: 1,
  },
  backButton: {
    marginBottom: spacing.xs,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightButton: {
    paddingLeft: spacing.md,
    paddingVertical: spacing.xs,
  },
  rightActionText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
