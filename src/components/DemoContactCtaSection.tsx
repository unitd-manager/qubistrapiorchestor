import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { createEnquiry, blocksToText, type EnquiryPayload } from "@/lib/strapi";

interface DemoFormField {
  id?: number;
  label?: string;
  placeholder?: string;
  field_type?: "text" | "email" | "tel" | "textarea";
  is_required?: boolean;
  field_name?: string;
  width?: "half" | "full";
}

interface DemoContactCtaSectionProps {
  heading?: string;
  highlighted_word?: string;
  description?: string;
  form_fields?: DemoFormField[];
  cta_label?: string;
  cta_link?: string;
  sub_description?: string;
  request_content?: string;
  request_description?: string;
}

const slugify = (label = "field") =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const DemoContactCtaSection = ({
  heading,
  highlighted_word,
  description,
  form_fields,
  cta_label,
  cta_link,
  sub_description,
  request_content,
  request_description,
}: DemoContactCtaSectionProps) => {
  const fields = form_fields ?? [];

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.field_name || slugify(f.label), ""]))
  );
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitEnquiry, isPending } = useMutation({
    mutationFn: () => {
      const payload: EnquiryPayload = {
        first_name: values["first_name"] ?? values["name"] ?? "",
        email: values["email"] ?? "",
        last_name: values["last_name"] ?? "",
        company: values["company"] ?? values["company_name"] ?? "",
        phone: values["phone"] ?? "",
        comments: values["comments"] ?? values["message"] ?? "",
        enquiry_type: "demo_request",
        subject: "Demo Request",
        product: "qubi",
      };
      return createEnquiry(payload);
    },
    onSuccess: () => setSubmitted(true),
  });

  const handleChange = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const missingRequired = fields.some(
      (f, idx) => idx < 2 && !values[f.field_name || slugify(f.label)]
    );
    if (missingRequired) return;
    submitEnquiry();
  };

  const renderHeading = () => {
    if (!heading || !highlighted_word || !heading.includes(highlighted_word)) return heading;
    const [before, after] = heading.split(highlighted_word);
    return (
      <>
        {before}
        <span className="text-gradient">{highlighted_word}</span>
        {after}
      </>
    );
  };

  return (
    <section id="book-demo" className="pt-24 pb-12 lg:pt-28 lg:pb-16 bg-surface-elevated border-y border-border scroll-mt-24">
      
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {(heading || description) && (
            <div className="text-center mb-10">
              {heading && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  {renderHeading()}
                </h2>
              )}
              {description && <p className="mt-6 text-lg text-muted-foreground">{blocksToText(description)}</p>}
            </div>
          )}

          {submitted ? (
            <div className="text-center py-12 rounded-2xl bg-primary/5 border border-primary/20">
              <CheckCircle size={40} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground">
                {typeof request_content === "string" ? request_content : blocksToText(request_content)}
              </h3>
              <p className="text-muted-foreground mt-2">
                {typeof request_description === "string" ? request_description : blocksToText(request_description)}
              </p>
            </div>
          ) : fields.length > 0 ? (
            <form
              onSubmit={handleSubmit}
              className="grid sm:grid-cols-2 gap-4 bg-surface-elevated border border-border rounded-2xl p-8"
            >
              {fields.map((f, fieldIdx) => {
                const key = f.field_name || slugify(f.label);
                const isTextarea = f.field_type === "textarea";
                const spanFull = f.width === "full" || isTextarea;
                const isRequired = fieldIdx < 2;
                return (
                  <div key={key} className={`flex flex-col gap-1.5 ${spanFull ? "sm:col-span-2" : ""}`}>
                    <label className="text-sm font-medium text-foreground" htmlFor={`demo-${key}`}>
                      {f.label} {isRequired && "*"}
                    </label>
                    {isTextarea ? (
                      <textarea
                        id={`demo-${key}`}
                        required={isRequired}
                        value={values[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={f.placeholder}
                        rows={4}
                        className="w-full rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 placeholder:italic focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:border-solid resize-none transition-colors"
                      />
                    ) : (
                      <input
                        id={`demo-${key}`}
                        type={f.field_type || "text"}
                        required={isRequired}
                        value={values[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={f.placeholder}
                        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    )}
                  </div>
                );
              })}
              {cta_label && (
                <div className="sm:col-span-2 flex justify-center mt-4">
                  <Button type="submit" variant="hero" size="lg" className="gap-2 px-8 h-12 shadow-none hover:shadow-none" disabled={isPending}>
                    {isPending ? "Sending..." : cta_label} <ArrowRight size={18} />
                  </Button>
                </div>
              )}
              {sub_description && (
                <p className="sm:col-span-2 text-center text-xs text-muted-foreground">{sub_description}</p>
              )}
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default DemoContactCtaSection;