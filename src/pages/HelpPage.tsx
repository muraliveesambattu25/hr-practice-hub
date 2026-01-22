import { HelpCircle, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I add a new employee?',
    answer: 'Navigate to the Employees page and click the "Add Employee" button. Fill in the required information and click "Create Employee" to save.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'Go to your Profile page and scroll down to the "Change Password" section. Enter your current password and your new password twice to confirm.',
  },
  {
    question: 'Who can access the Users management page?',
    answer: 'Only users with the Admin role have access to the Users management page. Managers and Employees cannot view or modify user accounts.',
  },
  {
    question: 'How do I filter employees by department?',
    answer: 'On the Employees list page, use the Department dropdown filter to select a specific department. The table will automatically update to show only employees from that department.',
  },
  {
    question: 'Can I export employee data?',
    answer: 'This feature is currently in development. Soon you will be able to export employee data in CSV and PDF formats.',
  },
  {
    question: 'How do I deactivate an employee account?',
    answer: 'Navigate to the employee\'s edit page and toggle the "Active Status" switch to off. The employee will then be marked as inactive in the system.',
  },
];

const HelpPage = () => {
  return (
    <div className="space-y-6" data-testid="help-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="help-title">
          Help & Support
        </h1>
        <p className="text-muted-foreground">
          Find answers to common questions or contact our support team
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQ Section */}
        <Card className="lg:col-span-2" data-testid="faq-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger data-testid={`faq-question-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent data-testid={`faq-answer-${index}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="space-y-6">
          <Card data-testid="contact-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Email Support</p>
                <a 
                  href="mailto:support@minihrms.com" 
                  className="text-sm text-primary hover:underline"
                  data-testid="support-email"
                >
                  support@minihrms.com
                </a>
              </div>
              <div>
                <p className="text-sm font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground" data-testid="support-phone">
                  +1 (555) 123-4567
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Office Hours</p>
                <p className="text-sm text-muted-foreground" data-testid="support-hours">
                  Mon-Fri: 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="quick-links">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer" data-testid="link-docs">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Documentation
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer" data-testid="link-changelog">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Changelog
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer" data-testid="link-status">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  System Status
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Form */}
        <Card className="lg:col-span-3" data-testid="support-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send us a Message
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Send us a message and we'll get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" data-testid="input-subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue in detail..." 
                  rows={5}
                  data-testid="input-message"
                />
              </div>
              <Button type="submit" data-testid="submit-support">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
