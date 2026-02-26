import React from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { normalize } from '@/theme/normalize';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecitationPlanCard } from './RecitationPlanCard';
import { RecitationPlanForm } from './RecitationPlanForm';
import { useSessionRecitationPlans } from '@/features/scheduling/hooks/useRecitationPlans';
import { useSessionRecitationPlanActions } from '@/features/scheduling/hooks/useSessionRecitationPlanActions';
import { styles } from './SessionRecitationPlanList.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionRecitationPlanListProps {
  sessionId: string;
  schoolId: string;
  userId: string;
  sessionDate: string;
  role: 'teacher' | 'student';
  isClassSession: boolean;
  students?: Array<{ id: string; name: string }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionRecitationPlanList({
  sessionId,
  schoolId,
  userId,
  sessionDate,
  role,
  isClassSession,
  students,
}: SessionRecitationPlanListProps) {
  const { t } = useTranslation();

  const { data: plans = [], isLoading } = useSessionRecitationPlans(sessionId);

  const actions = useSessionRecitationPlanActions({ sessionId, userId, plans });

  const isTeacher = role === 'teacher';

  // ── Loading state ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </View>
    );
  }

  // ── Student view ──────────────────────────────────────────────────────
  if (!isTeacher) {
    const teacherPlan = plans.find(
      (p) => p.student_id === userId && p.source !== 'student_suggestion',
    ) ?? actions.sessionDefaultPlan;

    return (
      <View style={styles.section}>
        {/* Teacher's plan (read-only) */}
        {teacherPlan != null && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {t('scheduling.recitationPlan.myPlan')}
              </Text>
              {teacherPlan.student_id == null && (
                <Badge
                  label={t('scheduling.recitationPlan.sessionDefault')}
                  variant="info"
                  size="sm"
                />
              )}
            </View>
            <RecitationPlanCard
              plan={teacherPlan}
              canManage={false}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </>
        )}

        {/* Student suggestion section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {t('scheduling.recitationPlan.mySuggestion')}
          </Text>
          {actions.mySuggestions.length > 0 && (
            <Button
              title={t('scheduling.recitationPlan.editPlan')}
              onPress={actions.openSuggestionForm}
              variant="ghost"
              size="sm"
              icon={
                <Ionicons
                  name="create-outline"
                  size={normalize(16)}
                  color={colors.primary[600]}
                />
              }
            />
          )}
        </View>

        {actions.mySuggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            {actions.mySuggestions.map((suggestion) => (
              <RecitationPlanCard
                key={suggestion.id}
                plan={suggestion}
                canManage
                onEdit={actions.openSuggestionForm}
                onDelete={actions.handleDeleteSuggestions}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="bulb-outline"
              size={normalize(24)}
              color={lightTheme.textTertiary}
            />
            <Text style={styles.emptyText}>
              {t('scheduling.recitationPlan.noSuggestionYet')}
            </Text>
            <Text style={styles.hintText}>
              {t('scheduling.recitationPlan.suggestionHint')}
            </Text>
            <Button
              title={t('scheduling.recitationPlan.suggestPlan')}
              onPress={actions.openSuggestionForm}
              variant="primary"
              size="sm"
              icon={
                <Ionicons
                  name="add-circle-outline"
                  size={normalize(16)}
                  color={colors.white}
                />
              }
              style={styles.emptyButton}
            />
          </View>
        )}

        {/* Suggestion form modal */}
        <RecitationPlanForm
          visible={actions.suggestionFormVisible}
          onClose={actions.handleCloseSuggestionForm}
          onSave={actions.handleSaveSuggestions}
          sessionId={sessionId}
          studentId={userId}
          schoolId={schoolId}
          userId={userId}
          sessionDate={sessionDate}
          initialItems={actions.suggestionInitialItems}
          initialNotes={actions.suggestionInitialNotes}
        />
      </View>
    );
  }

  // ── Teacher view ──────────────────────────────────────────────────────
  return (
    <View style={styles.section}>
      {/* Section header with "Set for All" button */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {t('scheduling.recitationPlan.title')}
        </Text>
        {isClassSession && (
          <Button
            title={t('scheduling.recitationPlan.setForAll')}
            onPress={actions.openSetForAll}
            variant="secondary"
            size="sm"
            icon={
              <Ionicons
                name="layers-outline"
                size={normalize(16)}
                color={colors.primary[500]}
              />
            }
          />
        )}
      </View>

      {/* Session default plan */}
      {actions.sessionDefaultPlan != null && (
        <View style={styles.defaultPlanContainer}>
          <Badge
            label={t('scheduling.recitationPlan.sessionDefault')}
            variant="info"
            size="sm"
          />
          <RecitationPlanCard
            plan={actions.sessionDefaultPlan}
            canManage
            onEdit={() => actions.openFormForStudent(null, actions.sessionDefaultPlan!)}
            onDelete={() => actions.handleDelete(actions.sessionDefaultPlan!)}
          />
        </View>
      )}

      {/* Per-student plans */}
      {students != null &&
        students.map((student) => {
          const studentPlan = actions.studentPlanMap.get(student.id);
          const studentSuggestions = actions.studentSuggestionsMap.get(student.id) ?? [];

          return (
            <View key={student.id} style={styles.studentRow}>
              <View style={styles.studentHeader}>
                <View style={styles.studentNameRow}>
                  <Ionicons
                    name="person-outline"
                    size={normalize(16)}
                    color={lightTheme.textSecondary}
                  />
                  <Text style={styles.studentName} numberOfLines={1}>
                    {student.name}
                  </Text>
                </View>

                {studentPlan == null ? (
                  <Button
                    title={t('scheduling.recitationPlan.setPlan')}
                    onPress={() => actions.openFormForStudent(student.id)}
                    variant="ghost"
                    size="sm"
                    icon={
                      <Ionicons
                        name="add-circle-outline"
                        size={normalize(16)}
                        color={colors.primary[600]}
                      />
                    }
                  />
                ) : null}
              </View>

              {studentPlan != null ? (
                <RecitationPlanCard
                  plan={studentPlan}
                  canManage
                  onEdit={() => actions.openFormForStudent(student.id, studentPlan)}
                  onDelete={() => actions.handleDelete(studentPlan)}
                />
              ) : actions.sessionDefaultPlan != null ? (
                <View style={styles.inheritedBadge}>
                  <Badge
                    label={t('scheduling.recitationPlan.sessionDefault')}
                    variant="default"
                    size="sm"
                  />
                </View>
              ) : (
                <View style={styles.noPlanRow}>
                  <Text style={styles.noPlanText}>
                    {t('scheduling.recitationPlan.noPlanSet')}
                  </Text>
                </View>
              )}

              {/* Student suggestions (read-only for teacher) */}
              {studentSuggestions.length > 0 && (
                <View style={styles.suggestionContainer}>
                  <Badge
                    label={t('scheduling.recitationPlan.studentSuggestion')}
                    variant="warning"
                    size="sm"
                  />
                  {studentSuggestions.map((suggestion) => (
                    <RecitationPlanCard
                      key={suggestion.id}
                      plan={suggestion}
                      canManage={false}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}

      {/* No students provided and no session default (private session) */}
      {students == null && actions.sessionDefaultPlan == null && (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={normalize(24)}
            color={lightTheme.textTertiary}
          />
          <Text style={styles.emptyText}>
            {t('scheduling.recitationPlan.noPlanSet')}
          </Text>
          <Button
            title={t('scheduling.recitationPlan.setPlan')}
            onPress={() => actions.openFormForStudent(null)}
            variant="primary"
            size="sm"
            icon={
              <Ionicons
                name="add-circle-outline"
                size={normalize(16)}
                color={colors.white}
              />
            }
            style={styles.emptyButton}
          />
        </View>
      )}

      {/* Form modal */}
      <RecitationPlanForm
        visible={actions.formVisible}
        onClose={actions.handleCloseForm}
        onSave={actions.handleTeacherSave}
        sessionId={sessionId}
        studentId={actions.formStudentId}
        schoolId={schoolId}
        userId={userId}
        sessionDate={sessionDate}
        initialItems={actions.teacherFormInitialItems}
        initialNotes={actions.teacherFormInitialNotes}
      />
    </View>
  );
}

