"use client";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import type { Locale } from "@/i18n/config";
import type { SiteCopy } from "@/data/types";
import { Button } from "@/components/atoms/Button";
import {
  consentRequired,
  phoneRequired,
  requiredString,
  withNormalizedPhone,
} from "@/lib/form/schemas";
import { createRequestId } from "@/lib/form/utils";
import { submitLead } from "@/lib/form/submitLead";
import { fieldInput } from "@/styles/ui";

export function ContactForm({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  const schema = Yup.object({
    name: requiredString(),
    phone: phoneRequired(),
    email: Yup.string().trim().email(),
    message: Yup.string().trim(),
    consent: consentRequired(),
    website: Yup.string(),
  });

  return (
    <Formik
      initialValues={{
        name: "",
        phone: "",
        email: "",
        message: "",
        consent: false,
        website: "",
      }}
      validationSchema={schema}
      onSubmit={async (values, helpers) => {
        const data = withNormalizedPhone(values);
        await submitLead({
          type: "contact",
          locale,
          requestId: createRequestId("contact"),
          website: data.website,
          data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            message: data.message,
          },
          successTitle: content.contacts.successTitle,
          successText: content.contacts.successText,
          eventPrefix: "contact",
        });
        helpers.resetForm();
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="grid gap-4">
          <div className="absolute -left-[9999px]" aria-hidden>
            <Field name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <Field
            name="name"
            placeholder={content.formCommon.name}
            className={fieldInput}
          />
          {touched.name && errors.name ? (
            <p className="m-0 text-sm text-danger">{content.ui.required}</p>
          ) : null}
          <Field
            name="phone"
            placeholder={content.formCommon.phone}
            className={fieldInput}
          />
          {touched.phone && errors.phone ? (
            <p className="m-0 text-sm text-danger">{content.ui.required}</p>
          ) : null}
          <Field
            name="email"
            type="email"
            placeholder={content.formCommon.email}
            className={fieldInput}
          />
          <Field
            as="textarea"
            name="message"
            rows={4}
            placeholder={content.formCommon.message}
            className={`${fieldInput} py-4`}
          />
          <label className="flex items-start gap-3 text-sm text-ink">
            <Field type="checkbox" name="consent" className="mt-1" />
            <span>
              {content.formCommon.consent}{" "}
              <a
                href={locale === "ru" ? "/ru/consent/" : "/consent/"}
                className="font-medium underline underline-offset-2"
              >
                {locale === "ru" ? "Текст согласия" : "Rozilik matni"}
              </a>
            </span>
          </label>
          {touched.consent && errors.consent ? (
            <p className="m-0 text-sm text-danger">{content.ui.required}</p>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {content.ui.send}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
