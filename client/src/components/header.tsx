import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-search text-primary text-2xl mr-3"></i>
              <h1 className="text-xl font-bold text-gray-900">VisualFind</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#" 
              className="text-gray-700 hover:text-primary transition-colors duration-300"
              data-testid="link-how-it-works"
            >
              How it Works
            </a>
            <a 
              href="#" 
              className="text-gray-700 hover:text-primary transition-colors duration-300"
              data-testid="link-products"
            >
              Products
            </a>
            <a 
              href="#" 
              className="text-gray-700 hover:text-primary transition-colors duration-300"
              data-testid="link-support"
            >
              Support
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-700 hover:text-primary transition-colors duration-300"
              data-testid="button-history"
            >
              <i className="fas fa-history"></i>
              <span className="hidden sm:inline ml-2">History</span>
            </button>
            <Button 
              className="bg-primary text-white hover:bg-primary-dark"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
