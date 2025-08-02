
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  Link, 
  File, 
  X, 
  ExternalLink,
  Download
} from 'lucide-react';
import { UploadFile } from '@/api/integrations';

export default function AttachmentUpload({ attachments = [], onAttachmentsChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef(null); // Added useRef for file input

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const newAttachments = [];
      
      for (const file of files) {
        const { file_url } = await UploadFile({ file });
        
        const attachment = {
          id: Date.now() + Math.random(),
          type: getFileType(file.type),
          url: file_url,
          name: file.name,
          metadata: {
            size: file.size,
            lastModified: file.lastModified,
            type: file.type
          }
        };
        
        newAttachments.push(attachment);
      }
      
      onAttachmentsChange([...attachments, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      // Reset the file input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // New function to trigger the hidden file input
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleLinkAdd = () => {
    if (!linkUrl.trim()) return;
    
    const linkAttachment = {
      id: Date.now() + Math.random(),
      type: 'link',
      url: linkUrl,
      name: extractDomainFromUrl(linkUrl),
      metadata: {
        addedAt: new Date().toISOString()
      }
    };
    
    onAttachmentsChange([...attachments, linkAttachment]);
    setLinkUrl('');
  };

  const removeAttachment = (attachmentId) => {
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const extractDomainFromUrl = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getAttachmentColor = (type) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'audio': return 'bg-orange-100 text-orange-800';
      case 'link': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex gap-2">
        {/* Hidden file input */}
        <Input
          ref={fileInputRef} // Added ref
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden" // Hidden input
        />
        {/* Button to trigger the hidden file input */}
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={handleUploadButtonClick} // Added onClick handler
          className="bg-white/70 w-full justify-center" // Adjusted class for full width and centering
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Files'} {/* Updated button text */}
        </Button>
      </div>

      {/* Link Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a link (https://...)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLinkAdd()}
          className="bg-white/70"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleLinkAdd}
          disabled={!linkUrl.trim()}
          className="bg-white/70"
        >
          <Link className="w-4 h-4" />
        </Button>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Attachments</h4>
          <div className="grid gap-2">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="bg-white/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge className={`${getAttachmentColor(attachment.type)} border-0`}>
                        {getAttachmentIcon(attachment.type)}
                        <span className="ml-1 capitalize">{attachment.type}</span>
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {attachment.name}
                        </p>
                        {attachment.metadata?.size && (
                          <p className="text-xs text-slate-500">
                            {(attachment.metadata.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {attachment.type === 'link' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
