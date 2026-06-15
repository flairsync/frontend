"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { clientOnly } from "vike-react/clientOnly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InputError } from "@/components/inputs/InputError";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import { Loader2, CheckCircle2, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import {
  getSupportCategories,
  submitSupportTicket,
  SupportCategory,
} from "@/features/support/service";

const LandingHeader = clientOnly(() => import("@/components/landing/LandingHeader"));

const SupportSchema = Yup.object().shape({
  name: Yup.string().trim().max(100, "Name must be at most 100 characters").required("Name is required"),
  email: Yup.string().email("Must be a valid email").required("Email is required"),
  category: Yup.string().required("Please select a category"),
  subject: Yup.string().trim().max(150, "Subject must be at most 150 characters").required("Subject is required"),
  message: Yup.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters")
    .required("Message is required"),
});

const FALLBACK_CATEGORIES: SupportCategory[] = [
  { value: "billing_and_payments", label: "Billing & Payments" },
  { value: "subscription", label: "Subscription" },
  { value: "getting_started", label: "Getting Started" },
  { value: "menu_management", label: "Menu Management" },
  { value: "staff_and_permissions", label: "Staff & Permissions" },
  { value: "reservations_and_orders", label: "Reservations & Orders" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "account_and_security", label: "Account & Security" },
  { value: "integrations", label: "Integrations" },
  { value: "other", label: "Other" },
];

const contactDetails = [
  { icon: Mail, label: "Email", value: "info@flairsync.com" },
  { icon: Phone, label: "Phone", value: "+376 123 456" },
  { icon: MapPin, label: "Address", value: "Andorra La Vella, AD500, Andorra" },
];

const SupportPage: React.FC = () => {
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  useEffect(() => {
    getSupportCategories()
      .then(setCategories)
      .catch(() => setCategories(FALLBACK_CATEGORIES))
      .finally(() => setCategoriesLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b border-border py-16 text-center px-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Support Center</h1>
            <p className="text-lg text-muted-foreground">
              Have a question or need help? Fill out the form and our team will get back to you shortly.
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-5xl px-6 py-16 space-y-16">

          {/* Contact cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contactDetails.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-none"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </section>

          <Separator />

          {/* Form section */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left copy */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Describe your issue and we'll route it to the right team. Most requests are answered within one business day.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Billing & subscription issues",
                  "Technical problems",
                  "Account & security concerns",
                  "General questions",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form card */}
            <div className="lg:col-span-3">
              {successEmail ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-16 px-6 rounded-xl border border-border bg-card">
                  <CheckCircle2 className="w-14 h-14 text-primary" />
                  <h3 className="text-xl font-bold">Message received!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    We'll reply to <strong>{successEmail}</strong> shortly.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSuccessEmail(null)}>
                    Submit another request
                  </Button>
                </div>
              ) : (
                <Card className="border border-border shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contact Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Formik
                      initialValues={{ name: "", email: "", category: "", subject: "", message: "" }}
                      validationSchema={SupportSchema}
                      onSubmit={async (values, { setStatus }) => {
                        setStatus(undefined);
                        try {
                          await submitSupportTicket({
                            name: values.name.trim(),
                            email: values.email,
                            category: values.category,
                            subject: values.subject.trim(),
                            message: values.message.trim(),
                          });
                          setSuccessEmail(values.email);
                        } catch (err: any) {
                          setStatus(err.message ?? "Something went wrong. Please try again.");
                        }
                      }}
                    >
                      {({ errors, touched, values, handleChange, isSubmitting, status }) => (
                        <Form className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder="Jane Smith"
                                onChange={handleChange}
                                value={values.name}
                                className="h-10"
                              />
                              {errors.name && touched.name && <InputError message={errors.name} />}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane@example.com"
                                onChange={handleChange}
                                value={values.email}
                                className="h-10"
                              />
                              {errors.email && touched.email && <InputError message={errors.email} />}
                            </div>
                          </div>

                          {/* Category */}
                          <div className="space-y-1.5">
                            <Label htmlFor="category">Category</Label>
                            {categoriesLoading ? (
                              <div className="h-10 flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading categories…
                              </div>
                            ) : (
                              <Field
                                as="select"
                                id="category"
                                name="category"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                <option value="" disabled>Select a category</option>
                                {categories.map((c) => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </Field>
                            )}
                            {errors.category && touched.category && <InputError message={errors.category} />}
                          </div>

                          {/* Subject */}
                          <div className="space-y-1.5">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              name="subject"
                              placeholder="Brief description of your issue"
                              onChange={handleChange}
                              value={values.subject}
                              className="h-10"
                            />
                            {errors.subject && touched.subject && <InputError message={errors.subject} />}
                          </div>

                          {/* Message */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="message">Message</Label>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {values.message.length} / 2000
                              </span>
                            </div>
                            <Textarea
                              id="message"
                              name="message"
                              placeholder="Describe your issue in detail…"
                              onChange={handleChange}
                              value={values.message}
                              rows={5}
                              maxLength={2000}
                              className="resize-none"
                            />
                            {errors.message && touched.message && <InputError message={errors.message} />}
                          </div>

                          {status && (
                            <p className="text-sm text-destructive">{status}</p>
                          )}

                          <Button type="submit" disabled={isSubmitting} className="w-full h-10">
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending…
                              </>
                            ) : (
                              "Send Message"
                            )}
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default SupportPage;
