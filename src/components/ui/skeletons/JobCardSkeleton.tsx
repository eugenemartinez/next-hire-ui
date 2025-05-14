import Card from '../Card';

const JobCardSkeleton = () => {
  return (
    <Card className="p-4 md:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Company Logo Placeholder */}
        <div className="w-16 h-16 bg-muted rounded-md shrink-0"></div>
        
        <div className="flex-grow">
          {/* Job Title Placeholder */}
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          {/* Company Name Placeholder */}
          <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
          
          {/* Meta Info Placeholders (Location, Job Type) */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>

          {/* Tags Placeholders */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="h-5 bg-muted rounded w-1/6"></div>
            <div className="h-5 bg-muted rounded w-1/5"></div>
            <div className="h-5 bg-muted rounded w-1/4"></div>
          </div>
        </div>
      </div>
      
      {/* Salary & Posted Date Placeholder (optional, adjust if not always present) */}
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-border/50">
        <div className="h-5 bg-muted rounded w-1/3"></div> {/* Salary */}
        <div className="h-4 bg-muted rounded w-1/4"></div> {/* Posted Date */}
      </div>
    </Card>
  );
};

export default JobCardSkeleton;