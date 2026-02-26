import { Redirect } from 'expo-router';

export default function TeacherScheduleRedirect() {
  return <Redirect href="/(teacher)/(tabs)/sessions" />;
}
