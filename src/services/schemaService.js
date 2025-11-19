const Job = require('../models/job.model');
const Company = require('../models/company.model');
const Category = require('../models/category.model');

class SchemaService {
  /**
   * Generate breadcrumb schema markup
   * @param {Array} breadcrumbs - Array of breadcrumb objects with name, url, and position
   * @returns {Object} - BreadcrumbList schema object
   */
  generateBreadcrumbSchema(breadcrumbs) {
    const breadcrumbItems = breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    };
  }

  /**
   * Generate job posting schema markup
   * @param {Object} job - Job object from database
   * @param {Object} company - Company object (optional, will be fetched if not provided)
   * @returns {Object} - JobPosting schema object
   */
  async generateJobPostingSchema(job, company = null) {
    // Fetch company if not provided
    if (!company && job.companyId) {
      company = await Company.findByPk(job.companyId);
    }

    const jobSchema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "datePosted": job.createdAt.toISOString(),
      "validThrough": job.applyBefore ? job.applyBefore.toISOString() : undefined,
      "employmentType": this.mapJobType(job.jobType),
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location,
          "addressCountry": job.country || "US"
        }
      },
      "applicantLocationRequirements": {
        "@type": "Country",
        "name": job.country || "United States"
      },
      "qualifications": job.qualification,
      "experienceRequirements": job.experience,
      "skills": job.skills,
      "baseSalary": job.salary ? {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": job.salary
      } : undefined,
      "numberOfOpenings": job.vacancy || 1,
      "hiringOrganization": company ? {
        "@type": "Organization",
        "name": company.name,
        "logo": company.logo,
        "sameAs": company.website,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": company.location
        }
      } : undefined,
      "jobBenefits": job.benefits || [],
      "workHours": "Full-time",
      "applicationContact": {
        "@type": "ContactPoint",
        "contactType": "hiring",
        "email": company?.email
      }
    };

    // Remove undefined properties
    return this.cleanSchema(jobSchema);
  }

  /**
   * Generate organization schema for company pages
   * @param {Object} company - Company object from database
   * @returns {Object} - Organization schema object
   */
  generateOrganizationSchema(company) {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": company.name,
      "description": company.description,
      "url": `https://harpaljob.com/companies/${company.slug}`,
      "logo": company.logo,
      "sameAs": company.website,
      "foundingDate": company.founded ? `${company.founded}-01-01` : undefined,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": company.location
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": company.email,
        "telephone": company.phone
      },
      "aggregateRating": company.rating > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": company.rating,
        "reviewCount": 1
      } : undefined
    };

    return this.cleanSchema(orgSchema);
  }

  /**
   * Generate website schema for homepage
   * @returns {Object} - WebSite schema object
   */
  generateWebsiteSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "HarPalJob",
      "url": "https://harpaljob.com",
      "description": "Find your dream job near you. Browse thousands of job listings and connect with top employers.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://harpaljob.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };
  }

  /**
   * Generate FAQ schema
   * @param {Array} faqs - Array of FAQ objects with question and answer
   * @returns {Object} - FAQPage schema object
   */
  generateFAQSchema(faqs) {
    const faqItems = faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems
    };
  }

  /**
   * Map job type to schema.org employment type
   * @param {string} jobType - Job type from database
   * @returns {string} - Schema.org employment type
   */
  mapJobType(jobType) {
    const typeMap = {
      'full-time': 'FULL_TIME',
      'part-time': 'PART_TIME',
      'contract': 'CONTRACTOR',
      'internship': 'INTERN'
    };
    return typeMap[jobType] || 'FULL_TIME';
  }

  /**
   * Clean schema object by removing undefined properties
   * @param {Object} schema - Schema object
   * @returns {Object} - Cleaned schema object
   */
  cleanSchema(schema) {
    const clean = {};
    for (const [key, value] of Object.entries(schema)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleaned = this.cleanSchema(value);
          if (Object.keys(cleaned).length > 0) {
            clean[key] = cleaned;
          }
        } else {
          clean[key] = value;
        }
      }
    }
    return clean;
  }

  /**
   * Generate all schemas for a job page
   * @param {Object} job - Job object
   * @param {Array} breadcrumbs - Breadcrumb array
   * @returns {Object} - Object containing all schemas
   */
  async generateJobPageSchemas(job, breadcrumbs) {
    const [jobSchema, breadcrumbSchema] = await Promise.all([
      this.generateJobPostingSchema(job),
      Promise.resolve(this.generateBreadcrumbSchema(breadcrumbs))
    ]);

    return {
      jobPosting: jobSchema,
      breadcrumb: breadcrumbSchema
    };
  }

  /**
   * Generate all schemas for a company page
   * @param {Object} company - Company object
   * @param {Array} breadcrumbs - Breadcrumb array
   * @returns {Object} - Object containing all schemas
   */
  generateCompanyPageSchemas(company, breadcrumbs) {
    return {
      organization: this.generateOrganizationSchema(company),
      breadcrumb: this.generateBreadcrumbSchema(breadcrumbs)
    };
  }
}

module.exports = new SchemaService(); 