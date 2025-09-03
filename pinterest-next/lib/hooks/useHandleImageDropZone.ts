'use client';

import { useCallback, useEffect, useState } from 'react';
import { API } from '@/lib/api-client/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface Props {
  isPfp: boolean;
  id: number;
}

export const useHandleImageDropZone = ({ isPfp, id }: Props) => {
  const [openState, setOpenState] = useState<boolean>();
  const [isLoading, setIsLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>();

  const fetchUserImage = async () => {
    setIsLoading(true);
    const user = await API.getUserInfo.getUserInfo(id.toString());

    if (user && !(user instanceof Error)) {
      if (user.user.pfpUrl == null || user.user.pfpUrl == '') {
        setIsLoading(false);

        return;
      }
      setProfilePicture(user.user.pfpUrl);
    }
  };

  useEffect(() => {
    fetchUserImage();
  }, []);

  const onDrop = useCallback((acceptedFile: File[]) => {
    setOpenState(false);
    setIsLoading(true);
    const file: File = acceptedFile[0];
    isPfp ? handleImage(file) : setUploadedFile(file);
  }, []);

  const handleImage = async (file: File) => {
    const link = await API.uploadImage.uploadPublicImage(file);
    if (link && !(link instanceof Error)) {
      if (await API.changeUserInfo.changeUserPfp(link, id.toString())) {
        setProfilePicture(link);
        toast('Image uploaded successfully');

        return;
      }
    }

    toast('Image upload failed');
    setIsLoading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return {
    getRootProps,
    getInputProps,
    setIsLoading,
    setUploadedFile,
    uploadedFile,
    isDragActive,
    openState,
    isLoading,
    profilePicture,
  };
};