import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';

import { spacing } from '@/theme/spacing';
import { SearchBar } from '@/components/ui';
import { EmptyState } from '@/components/feedback';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchableListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  searchFilter: (item: T, query: string) => boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  ListHeaderComponent?: React.ReactElement;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SearchableList<T>({
  data,
  renderItem,
  keyExtractor,
  searchFilter,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  ListHeaderComponent,
  style,
}: SearchableListProps<T>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.searchPlaceholder');
  const resolvedEmptyTitle = emptyTitle ?? t('common.noResultsTitle');
  const resolvedEmptyDescription = emptyDescription ?? t('common.noResultsDescription');

  const filteredData = useMemo(() => {
    if (query.length === 0) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((item) => searchFilter(item, lowerQuery));
  }, [data, query, searchFilter]);

  const handleClear = useCallback(() => setQuery(''), []);

  return (
    <View style={[styles.root, style]}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={handleClear}
        placeholder={resolvedSearchPlaceholder}
        style={styles.searchBar}
      />

      <FlashList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <EmptyState title={resolvedEmptyTitle} description={resolvedEmptyDescription} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  searchBar: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
});
