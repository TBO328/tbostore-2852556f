-- Allow admins and owners to upload/update/delete any avatar
CREATE POLICY "Admins can upload any avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (has_role(auth.uid(), 'admin') OR is_owner(auth.uid()))
);

CREATE POLICY "Admins can update any avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (has_role(auth.uid(), 'admin') OR is_owner(auth.uid()))
);

CREATE POLICY "Admins can delete any avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (has_role(auth.uid(), 'admin') OR is_owner(auth.uid()))
);