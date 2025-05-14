import { Link } from 'react-router-dom'
import { FiBriefcase, FiEdit, FiStar, FiCheckCircle } from 'react-icons/fi'
import { motion, type Variants } from 'framer-motion' // Import motion and Variants
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

// Reusable variants for individual elements fading/sliding in
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Reusable variants for staggering children
const staggerContainerVariants: Variants = {
  hidden: { opacity: 1 }, // Container itself can be visible
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Adjust stagger delay as needed
    }
  }
};

const HomePage = () => {
  return (
    <motion.div // Add motion to the main container for an overall initial animation if desired
      initial="hidden"
      animate="visible"
      variants={{ // Simple fade for the whole page container
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
      }}
      className="flex flex-col items-center"
    >
      {/* Hero section */}
      <motion.div 
        className="max-w-4xl mx-auto text-center py-16 px-4"
        variants={staggerContainerVariants} // Use stagger for children of this section
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          variants={fadeInUpVariants}
        >
          Find Your Next Tech Opportunity
        </motion.h1>
        
        <motion.p 
          className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          variants={fadeInUpVariants}
        >
          NextHire connects talented professionals with the best job opportunities in the tech industry.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={fadeInUpVariants} // Buttons can animate together or individually
        >
          <Link to="/jobs">
            <Button size="lg" className="flex items-center gap-2 w-full sm:w-auto">
              <FiBriefcase />
              Browse Jobs
            </Button>
          </Link>
          
          <Link to="/jobs/add">
            <Button size="lg" variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <FiEdit />
              Post a Job
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Features section */}
      <motion.div 
        className="w-full bg-card border-t border-border py-20"
        initial="hidden"
        whileInView="visible" // Animate when section scrolls into view
        viewport={{ once: true, amount: 0.2 }} // Trigger once, when 20% is visible
        variants={staggerContainerVariants}
      >
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-16"
            variants={fadeInUpVariants}
          >
            Why Use NextHire?
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainerVariants} // Stagger the feature cards
          >
            {/* FeatureCards will inherit variants if they are motion components */}
            <FeatureCard 
              icon={<FiEdit />}
              title="Easy Job Posting"
              description="Post your job listing in minutes with our streamlined process and reach qualified candidates instantly."
            />
            
            <FeatureCard 
              icon={<FiCheckCircle />}
              title="No Account Required"
              description="Post and manage jobs without creating an account. Just save your modification code for future edits."
            />
            
            <FeatureCard 
              icon={<FiStar />}
              title="Save Favorite Jobs"
              description="Bookmark interesting opportunities to review later and track your application progress."
            />
          </motion.div>
        </div>
      </motion.div>
      
      {/* How it works section */}
      <motion.div 
        className="w-full bg-slate-50 dark:bg-neutral-800/30 py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainerVariants}
      >
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-16"
            variants={fadeInUpVariants}
          >
            How NextHire Works
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 md:gap-y-0"
            variants={staggerContainerVariants} // Stagger the two columns
          >
            {/* Column 1: For Job Seekers */}
            <motion.div className="space-y-6 rounded-lg p-6 md:p-0" variants={fadeInUpVariants}>
              <h3 className="text-xl lg:text-2xl font-semibold mb-6 text-center md:text-left">For Job Seekers</h3>
              <motion.ul className="space-y-4" variants={staggerContainerVariants}>
                {[
                  "Browse through available job postings with powerful search and filtering.",
                  "Save interesting opportunities to your personalized list for easy access.",
                  "Apply directly using the provided application links or instructions.",
                  "Track your saved jobs and manage your job hunt efficiently."
                ].map((text, index) => (
                  <motion.li key={index} className="flex items-start gap-4" variants={fadeInUpVariants}>
                    <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mt-0.5 shrink-0 text-sm font-semibold">{index + 1}</span>
                    <span>{text}</span>
                  </motion.li>
                ))}
              </motion.ul>
              
              <motion.div className="mt-10 text-center md:text-left" variants={fadeInUpVariants}>
                <Link to="/jobs">
                  <Button size="lg">Find Jobs Now</Button>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Column 2: For Employers */}
            <motion.div className="space-y-6 rounded-lg p-6 md:p-0" variants={fadeInUpVariants}>
              <h3 className="text-xl lg:text-2xl font-semibold mb-6 text-center md:text-left">For Employers</h3>
              <motion.ul className="space-y-4" variants={staggerContainerVariants}>
                {[
                  "Create a detailed and attractive job listing in minutes.",
                  "Securely save your unique modification code for future edits or deletion.",
                  "Receive applications directly via your specified method, hassle-free.",
                  "Update, manage, or remove your job listing anytime with ease."
                ].map((text, index) => (
                  <motion.li key={index} className="flex items-start gap-4" variants={fadeInUpVariants}>
                    <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mt-0.5 shrink-0 text-sm font-semibold">{index + 1}</span>
                    <span>{text}</span>
                  </motion.li>
                ))}
              </motion.ul>
              
              <motion.div className="mt-10 text-center md:text-left" variants={fadeInUpVariants}>
                <Link to="/jobs/add">
                  <Button size="lg">Post a Job</Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Call to action */}
      <motion.div 
        className="w-full bg-primary text-primary-foreground py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-3xl font-bold mb-6" variants={fadeInUpVariants}>
            Ready to Get Started?
          </motion.h2>
          <motion.p className="text-xl mb-8 opacity-90" variants={fadeInUpVariants}>
            Join thousands of job seekers and employers using NextHire today.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUpVariants} // Or stagger these buttons if preferred
          >
            <Link to="/jobs">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Browse Jobs
              </Button>
            </Link>
            
            <Link to="/jobs/add">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Post a Job
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Feature card component - convert to motion component
const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) => {
  return (
    // Apply fadeInUpVariants here, it will be triggered by the parent stagger
    <motion.div variants={fadeInUpVariants}> 
      <Card className="p-6 flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 group dark:border-neutral-700 h-full"> {/* Added h-full for consistent height in grid */}
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-6 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <div className="text-3xl">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  )
}

export default HomePage