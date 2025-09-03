import { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface Props {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T,
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T,
  isDragActive: boolean,
  className?: string,
}

export const DragAndDropImageComponent = ({ getRootProps, getInputProps, isDragActive, className }: Props) => {
  return (
    <div
      className={cn('h-[300px] bg-gray-200 flex justify-center items-center p-5 rounded-md', className)} {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p className={'text-center font-semibold'}>Drop the image here ...</p> :
          <p className={'text-center font-semibold'}>Drag your image here, or click to select</p>
      }
    </div>
  );
};