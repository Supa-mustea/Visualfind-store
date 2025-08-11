import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FiltersSidebarProps {
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    brand: string;
    similarity: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const categories = ["All Categories", "Furniture", "Fashion", "Electronics", "Lighting"];
  const brands = ["IKEA", "West Elm", "CB2", "Article"];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (category === "All Categories") {
      onFiltersChange({ ...filters, category: checked ? "" : filters.category });
    } else {
      onFiltersChange({ ...filters, category: checked ? category : "" });
    }
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    onFiltersChange({ ...filters, brand: checked ? brand : "" });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, maxPrice: value[0] });
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
        
        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <Checkbox
                    id={`category-${category}`}
                    checked={category === "All Categories" ? filters.category === "" : filters.category === category}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range
            </Label>
            <div className="space-y-2">
              <Slider
                value={[filters.maxPrice]}
                onValueChange={handlePriceChange}
                max={1000}
                min={0}
                step={50}
                className="w-full"
                data-testid="slider-price"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>$0</span>
                <span>${filters.maxPrice}+</span>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Brand
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brand === brand}
                    onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                    data-testid={`checkbox-brand-${brand.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Similarity Score */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Similarity
            </Label>
            <Select 
              value={filters.similarity} 
              onValueChange={(value) => onFiltersChange({ ...filters, similarity: value })}
            >
              <SelectTrigger data-testid="select-similarity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most-similar">Most Similar</SelectItem>
                <SelectItem value="very-similar">Very Similar</SelectItem>
                <SelectItem value="similar">Similar</SelectItem>
                <SelectItem value="somewhat-similar">Somewhat Similar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          className="w-full mt-6 bg-primary text-white hover:bg-primary-dark"
          onClick={() => {/* Filters are applied automatically */}}
          data-testid="button-apply-filters"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
