import Card from '../Card'; // Assuming Card is in ui

const JobDetailsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12 animate-pulse">
      {/* Top actions bar skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 bg-muted rounded w-1/4"></div> {/* Back to jobs link */}
        <div className="hidden md:flex gap-2 items-center">
          <div className="h-9 bg-muted rounded w-24"></div> {/* Button 1 */}
          <div className="h-9 bg-muted rounded w-24"></div> {/* Button 2 */}
          <div className="h-9 bg-muted rounded w-20"></div> {/* Button 3 */}
        </div>
        <div className="md:hidden h-8 w-8 bg-muted rounded-md"></div> {/* Mobile menu icon */}
      </div>

      {/* Main Job Details Card Skeleton */}
      <Card className="mb-6 p-6 overflow-hidden">
        {/* Job Title Placeholder */}
        <div className="h-8 bg-muted rounded w-3/4 mb-3"></div>

        {/* Meta Information Placeholders */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-4">
          <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
        </div>
        
        {/* Job Overview Section Skeleton */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="h-5 bg-muted rounded w-1/5 mb-3"></div> {/* Section Title */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="h-5 bg-muted rounded w-24 shrink-0"></div>
              <div className="h-5 bg-muted rounded w-3/5"></div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 bg-muted rounded w-24 shrink-0"></div>
              <div className="h-5 bg-muted rounded w-1/2"></div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 bg-muted rounded w-24 shrink-0"></div>
              <div className="h-5 bg-muted rounded w-2/5"></div>
            </div>
          </div>
        </div>
        
        {/* Salary Information Skeleton */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="h-5 bg-muted rounded w-1/6 mb-2"></div> {/* Section Title */}
          <div className="h-5 bg-muted rounded w-1/3"></div>
        </div>
        
        {/* Tags Skeleton */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="h-5 bg-muted rounded w-1/5 mb-2"></div> {/* Section Title */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-12"></div>
            <div className="h-6 bg-muted rounded w-24"></div>
          </div>
        </div>
      </Card>
      
      {/* Job Description Card Skeleton */}
      <Card className="mb-6 p-6 overflow-hidden">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div> {/* Section Title */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </Card>
      
      {/* Application Info Card Skeleton */}
      <Card className="p-6 overflow-hidden">
        <div className="h-6 bg-muted rounded w-1/4 mb-4"></div> {/* Section Title */}
        <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </Card>
    </div>
  );
};

export default JobDetailsSkeleton;