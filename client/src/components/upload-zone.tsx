import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onImageUpload: (file: File) => void;
  onExampleSearch: (category: string) => void;
}

export default function UploadZone({ onImageUpload, onExampleSearch }: UploadZoneProps) {
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'bg-primary/5');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size <= 10 * 1024 * 1024) {
          onImageUpload(file);
        } else {
          toast({
            title: "File too large",
            description: "Please select an image under 10MB",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  }, [onImageUpload, toast]);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file.size <= 10 * 1024 * 1024) {
          onImageUpload(file);
        } else {
          toast({
            title: "File too large",
            description: "Please select an image under 10MB",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  }, [onImageUpload, toast]);

  const exampleImages = [
    {
      src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
      alt: "Modern living room setup",
      category: "furniture",
      label: "Furniture"
    },
    {
      src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
      alt: "Designer handbag",
      category: "fashion",
      label: "Fashion"
    },
    {
      src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150",
      alt: "Kitchen appliances",
      category: "kitchen",
      label: "Kitchen"
    }
  ];

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors duration-300 p-12 text-center mb-8 cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
        data-testid="upload-zone"
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <i className="fas fa-cloud-upload-alt text-primary text-2xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your image here
            </h3>
            <p className="text-gray-600 mb-4">or click to browse files</p>
            <Button 
              className="bg-primary text-white hover:bg-primary-dark"
              data-testid="button-choose-file"
            >
              <i className="fas fa-upload mr-2"></i>
              Choose File
            </Button>
          </div>
          <p className="text-sm text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">Try these example searches:</p>
        <div className="flex flex-wrap justify-center gap-4">
          {exampleImages.map((example, index) => (
            <button
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              onClick={() => onExampleSearch(example.category)}
              data-testid={`example-search-${example.category}`}
            >
              <img 
                src={example.src} 
                alt={example.alt}
                className="w-32 h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {example.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
