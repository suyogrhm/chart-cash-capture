
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Paperclip, Image, X, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface TransactionAttachmentsProps {
  attachments: Attachment[];
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (id: string) => void;
  maxFiles?: number;
}

export const TransactionAttachments = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  maxFiles = 5
}: TransactionAttachmentsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (attachments.length < maxFiles) {
        onAddAttachment(file);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (type: string) => {
    return type.startsWith('image/');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-card-foreground">Attachments</span>
        {attachments.length < maxFiles && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Attachment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    multiple
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: Images, PDF, DOC, TXT. Max {maxFiles} files.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  {isImageFile(attachment.type) ? (
                    <Image className="h-4 w-4 text-primary" />
                  ) : (
                    <Paperclip className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground truncate max-w-[200px]">
                    {attachment.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {isImageFile(attachment.type) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAttachment(attachment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && (
        <div className="text-center py-4 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No attachments</p>
        </div>
      )}
    </div>
  );
};
