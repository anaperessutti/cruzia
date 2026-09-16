CREATE POLICY "medios_read_publico" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'medios');
CREATE POLICY "medios_insert_admin" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'medios' AND public.is_admin());
CREATE POLICY "medios_update_admin" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'medios' AND public.is_admin()) WITH CHECK (bucket_id = 'medios' AND public.is_admin());
CREATE POLICY "medios_delete_admin" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'medios' AND public.is_admin());