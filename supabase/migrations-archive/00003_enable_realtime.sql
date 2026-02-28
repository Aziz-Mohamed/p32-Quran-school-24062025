-- Enable Supabase Realtime for tables that have subscriptions
-- Required for postgres_changes events to be delivered to clients

ALTER PUBLICATION supabase_realtime ADD TABLE student_stickers;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE homework;
ALTER PUBLICATION supabase_realtime ADD TABLE student_trophies;
ALTER PUBLICATION supabase_realtime ADD TABLE student_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE classes;
