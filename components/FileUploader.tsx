"use client"

import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { Button } from './ui/button'
import { cn, convertFileToUrl, getFileType } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'
import Thumbnail from './Thumbnail'
import { toast } from "sonner"
import { MAX_FILE_SIZE } from '@/constants'
import { usePathname } from 'next/navigation'
import { uploadFile } from '@/lib/actions/file.action'

interface Props {
  ownerId: string, 
  accountId: string, 
  className?: string,
}

export default function FileUploader ({ ownerId, accountId, className }: Props) {
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback(async(acceptedFile: File[]) => {
    // Do something with the files
    setFiles(acceptedFile);
    const uploadPromises = acceptedFile.map( async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
        return toast(`${file.name} is to large. Max file size is 50MB`)
      }
      return uploadFile({ file, ownerId, accountId, path}).then(
        (uploadFile) => {
          if (uploadFile) {
            setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
          }
        }
      );
    });
    await Promise.all(uploadPromises);
  }, [ownerId, accountId, path])
  const {getRootProps, getInputProps} = useDropzone({onDrop})
  const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, fileName: string) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className='cursor-pointer'>
      <input {...getInputProps()} />
      <Button type='button' className={cn("uploader-button", className)}>
        <Image src="/assets/icons/upload.svg" alt='upload' width={24} height={24}/>
        <p>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className='uploader-preview-list'>
          <li className='h4 text-light-100'>Uploading</li>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li key={`${file.name}-${index}`} className='uploader-preview-item'>
                <div className='flex items-center gap-3'>
                  <Thumbnail type={type} extension={extension} url={convertFileToUrl(file)}/>
                  <div className='preview-item-name'>
                    <Image src="/assets/icons/file-loader.gif" width={80} height={26} alt='loader'/>
                  </div>
                </div>
                <Image 
                  src="/assets/icons/remove.svg" 
                  width={24} 
                  height={24} 
                  alt='remove'
                  onClick={(e) => handleRemoveFile(e, file.name)}/>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
