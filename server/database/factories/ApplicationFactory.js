/**
 * ============================================================================
 * Alumni Tracker — Application Factory
 * ============================================================================
 * Architectural Layer: DATABASE / FACTORY (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * ============================================================================
 */

class ApplicationFactory {
  static coverLetters = [
    'Dear Hiring Team, Having graduated from Istanbul University Management Information Systems, I am eager to apply my skills in modern web architecture and data pipelines to this opportunity.',
    'I was thrilled to see this opening on the IU Alumni Portal. My technical background in backend engineering and cloud deployment aligns closely with the requirements specified.',
    'As an active IU alumnus with 3+ years of experience in high-throughput services, I would welcome the chance to discuss how my skill set can accelerate your team objectives.',
    'Hello! Please find my attached resume. I have been following your corporate achievements and believe my background in full-stack development and system reliability is a strong fit.'
  ];

  static recruiterNotes = [
    'Strong academic background and relevant internship experience.',
    'Excellent technical screening interview. Highly recommended for final round.',
    'Portfolio demonstrates solid understanding of PostgreSQL and Express design.',
    'Under review by department engineering lead.',
    'Solid communication skills and enthusiasm.'
  ];

  constructor(attributes = {}) {
    this.attributes = {
      resumeUrl: 'https://storage.alumni.edu/resumes/alumnus-cv.pdf',
      coverLetter: ApplicationFactory.coverLetters[Math.floor(Math.random() * ApplicationFactory.coverLetters.length)],
      status: 'submitted',
      notes: null,
      ...attributes
    };
  }

  shortlisted() {
    this.attributes.status = 'shortlisted';
    this.attributes.notes = 'Shortlisted based on technical CV review and GPA.';
    return this;
  }

  underReview() {
    this.attributes.status = 'under_review';
    this.attributes.notes = 'Initial screening underway.';
    return this;
  }

  interviewScheduled() {
    this.attributes.status = 'interview_scheduled';
    this.attributes.notes = 'Video interview invitation sent.';
    return this;
  }

  accepted() {
    this.attributes.status = 'accepted';
    this.attributes.notes = 'Offer extended to candidate.';
    return this;
  }

  make(overrides = {}) {
    return {
      ...this.attributes,
      ...overrides
    };
  }
}

module.exports = ApplicationFactory;
