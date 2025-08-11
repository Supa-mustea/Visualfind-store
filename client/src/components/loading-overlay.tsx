interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Analyzing your image..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center" data-testid="loading-overlay">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="text-loading-title">
          {message}
        </h3>
        <p className="text-gray-600" data-testid="text-loading-description">
          Our AI is finding similar products for you
        </p>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse w-3/5"></div>
        </div>
      </div>
    </div>
  );
}
