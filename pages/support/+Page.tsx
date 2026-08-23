"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

function getSupportSchema(t: (key: string) => string) {
  return Yup.object().shape({
    name: Yup.string().trim().max(100, t("support_page.errors.name_max")).required(t("support_page.errors.name_required")),
    email: Yup.string().email(t("support_page.errors.email_invalid")).required(t("support_page.errors.email_required")),
    category: Yup.string().required(t("support_page.errors.category_required")),
    subject: Yup.string().trim().max(150, t("support_page.errors.subject_max")).required(t("support_page.errors.subject_required")),
    message: Yup.string()
      .trim()
      .min(10, t("support_page.errors.message_min"))
      .max(2000, t("support_page.errors.message_max"))
      .required(t("support_page.errors.message_required")),
  });
}

function getFallbackCategories(t: (key: string) => string): SupportCategory[] {
  return [
    { value: "billing_and_payments", label: t("support_page.categories.billing_and_payments") },
    { value: "subscription", label: t("support_page.categories.subscription") },
    { value: "getting_started", label: t("support_page.categories.getting_started") },
    { value: "menu_management", label: t("support_page.categories.menu_management") },
    { value: "staff_and_permissions", label: t("support_page.categories.staff_and_permissions") },
    { value: "reservations_and_orders", label: t("support_page.categories.reservations_and_orders") },
    { value: "technical_issue", label: t("support_page.categories.technical_issue") },
    { value: "account_and_security", label: t("support_page.categories.account_and_security") },
    { value: "integrations", label: t("support_page.categories.integrations") },
    { value: "other", label: t("support_page.categories.other") },
  ];
}

const SupportPage: React.FC = () => {
  const { t } = useTranslation("landing");
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const contactDetails = [
    { icon: Mail, label: t("support_page.contact.email_label"), value: "info@flairsync.com" },
    { icon: Phone, label: t("support_page.contact.phone_label"), value: "+376 123 456" },
    { icon: MapPin, label: t("support_page.contact.address_label"), value: "Andorra La Vella, AD500, Andorra" },
  ];

  useEffect(() => {
    getSupportCategories()
      .then(setCategories)
      .catch(() => setCategories(getFallbackCategories(t)))
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
            <h1 className="text-4xl font-extrabold tracking-tight">{t("support_page.hero_title")}</h1>
            <p className="text-lg text-muted-foreground">
              {t("support_page.hero_subtitle")}
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">

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
              <h2 className="text-2xl font-bold tracking-tight">{t("support_page.send_message_title")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("support_page.send_message_description")}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  t("support_page.bullets.billing"),
                  t("support_page.bullets.technical"),
                  t("support_page.bullets.account_security"),
                  t("support_page.bullets.general"),
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
                  <h3 className="text-xl font-bold">{t("support_page.success.title")}</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    {t("support_page.success.body_prefix")} <strong>{successEmail}</strong> {t("support_page.success.body_suffix")}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSuccessEmail(null)}>
                    {t("support_page.success.submit_another")}
                  </Button>
                </div>
              ) : (
                <Card className="border border-border shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{t("support_page.contact_support_title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Formik
                      initialValues={{ name: "", email: "", category: "", subject: "", message: "" }}
                      validationSchema={getSupportSchema(t)}
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
                          setStatus(err.message ?? t("support_page.errors.generic"));
                        }
                      }}
                    >
                      {({ errors, touched, values, handleChange, isSubmitting, status }) => (
                        <Form className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                              <Label htmlFor="name">{t("support_page.form.name")}</Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder={t("support_page.form.name_placeholder")}
                                onChange={handleChange}
                                value={values.name}
                                className="h-10"
                              />
                              {errors.name && touched.name && <InputError message={errors.name} />}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                              <Label htmlFor="email">{t("support_page.form.email")}</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t("support_page.form.email_placeholder")}
                                onChange={handleChange}
                                value={values.email}
                                className="h-10"
                              />
                              {errors.email && touched.email && <InputError message={errors.email} />}
                            </div>
                          </div>

                          {/* Category */}
                          <div className="space-y-1.5">
                            <Label htmlFor="category">{t("support_page.form.category")}</Label>
                            {categoriesLoading ? (
                              <div className="h-10 flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("support_page.form.loading_categories")}
                              </div>
                            ) : (
                              <Field
                                as="select"
                                id="category"
                                name="category"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                <option value="" disabled>{t("support_page.form.select_category")}</option>
                                {categories.map((c) => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </Field>
                            )}
                            {errors.category && touched.category && <InputError message={errors.category} />}
                          </div>

                          {/* Subject */}
                          <div className="space-y-1.5">
                            <Label htmlFor="subject">{t("support_page.form.subject")}</Label>
                            <Input
                              id="subject"
                              name="subject"
                              placeholder={t("support_page.form.subject_placeholder")}
                              onChange={handleChange}
                              value={values.subject}
                              className="h-10"
                            />
                            {errors.subject && touched.subject && <InputError message={errors.subject} />}
                          </div>

                          {/* Message */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="message">{t("support_page.form.message")}</Label>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {values.message.length} / 2000
                              </span>
                            </div>
                            <Textarea
                              id="message"
                              name="message"
                              placeholder={t("support_page.form.message_placeholder")}
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
                                {t("support_page.form.sending")}
                              </>
                            ) : (
                              t("support_page.form.send_message")
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
