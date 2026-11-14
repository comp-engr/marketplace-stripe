"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListingPreview } from "@/components/marketplace/ListingPreview";
import { CATEGORIES, isCategoryName } from "@/lib/categories";
import { LISTING_IMAGES_BUCKET, supabase } from "@/lib/supabase";
import { ALLOWED_IMAGE_TYPES, LIMITS, MAX_IMAGE_BYTES, MAX_PRICE, isValidEmail } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { NewListing } from "@/types";

const DEFAULT_LOCATION = "Palo Alto, CA";

type Field = "photo" | "title" | "price" | "category" | "email" | "description" | "location" | "sellerName";

type Values = {
  title: string;
  price: string;
  category: string;
  location: string;
  sellerName: string;
  email: string;
  description: string;
};

function validate(values: Values, photo: File | null): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};

  if (!photo) errors.photo = "Add a photo of your item.";

  const title = values.title.trim();
  if (!title) errors.title = "Enter a title.";
  else if (title.length > LIMITS.title) errors.title = `Title must be ${LIMITS.title} characters or less.`;

  const priceText = values.price.trim();
  const price = Number(priceText);
  if (!priceText) errors.price = "Enter a price (0 for free).";
  else if (!Number.isFinite(price)) errors.price = "Price must be a number.";
  else if (price < 0) errors.price = "Price can't be negative.";
  else if (price > MAX_PRICE) errors.price = "Price is too high.";
  else if (!/^\d+(\.\d{1,2})?$/.test(priceText)) errors.price = "Use at most 2 decimal places.";

  if (!isCategoryName(values.category)) errors.category = "Choose a category.";

  const email = values.email.trim();
  if (!email) errors.email = "Enter your email so buyers can reach you.";
  else if (email.length > LIMITS.email || !isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (values.description.length > LIMITS.description)
    errors.description = `Description must be ${LIMITS.description} characters or less.`;
  if (values.location.trim().length > LIMITS.location) errors.location = "Location is too long.";
  if (values.sellerName.trim().length > LIMITS.name) errors.sellerName = "Name is too long.";

  return errors;
}

export function ListingForm() {
  const router = useRouter();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<Values>({
    title: "",
    price: "",
    category: "",
    location: DEFAULT_LOCATION,
    sellerName: "",
    email: "",
    description: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Free the object URL when the photo changes or the form unmounts
  useEffect(() => {
    if (!photo) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const errors = validate(values, photo);
  const isValid = Object.keys(errors).length === 0;

  const set = (field: keyof Values) => (value: string) => setValues((v) => ({ ...v, [field]: value }));
  const touch = (field: Field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const errorFor = (field: Field) => (touched[field] ? errors[field] : undefined);

  function pickFile(file: File | undefined) {
    setTouched((t) => ({ ...t, photo: true }));
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      setPhotoError("Use a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPhotoError("That photo is larger than 5 MB. Choose a smaller one.");
      return;
    }
    setPhotoError(null);
    setPhoto(file);
  }

  function removePhoto() {
    setPhoto(null);
    setTouched((t) => ({ ...t, photo: true }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ photo: true, title: true, price: true, category: true, email: true, description: true });
    if (!isValid || !photo || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upload the photo under a unique name
      const ext = ALLOWED_IMAGE_TYPES[photo.type];
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .upload(path, photo, { contentType: photo.type, upsert: false });
      if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);

      // 2. Insert the listing (listings are publicly readable, so .select() is allowed)
      const listing: NewListing = {
        title: values.title.trim(),
        price: Number(values.price),
        category: values.category as NewListing["category"],
        location: values.location.trim() || DEFAULT_LOCATION,
        seller_name: values.sellerName.trim() || null,
        seller_email: values.email.trim(),
        description: values.description.trim() || null,
        image_url: publicUrl,
      };
      const { data, error: insertError } = await supabase.from("listings").insert(listing).select("id").single();
      if (insertError || !data) throw new Error(`Could not save your listing: ${insertError?.message ?? "unknown error"}`);

      toast.success("Your listing is live!");
      router.push(`/item/${data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
      toast.error(message);
      setSubmitting(false);
    }
  }

  const photoMessage = photoError ?? errorFor("photo");

  return (
    <div className="grid gap-4 p-4 lg:h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(320px,380px)_1fr_minmax(280px,340px)] lg:overflow-hidden">
      {/* Left: form */}
      <form
        id={formId}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col rounded-xl bg-white shadow-sm lg:min-h-0 lg:overflow-hidden"
      >
        <div className="space-y-4 p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {/* Photo dropzone */}
          <div>
            {photo && photoUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-[#e4e6eb]">
                <Image src={photoUrl} alt="Selected photo" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Remove photo"
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
                >
                  <X className="size-4" />
                </button>
                <p className="absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  {photo.name}
                </p>
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed bg-fb-bg/60 px-4 text-center transition-colors hover:bg-fb-bg",
                  dragging && "border-fb-blue bg-fb-active",
                  photoMessage && "border-destructive/60"
                )}
              >
                <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-secondary">
                  <ImagePlus className="size-5" />
                </span>
                <span className="text-[15px] font-semibold">Add photos</span>
                <span className="text-[13px] text-muted-foreground">or drag and drop</span>
                <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP or GIF, up to 5 MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={Object.keys(ALLOWED_IMAGE_TYPES).join(",")}
                  className="sr-only"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </label>
            )}
            {photoMessage && <FieldError>{photoMessage}</FieldError>}
          </div>

          <FieldShell label="Title" required error={errorFor("title")}>
            <Input
              value={values.title}
              onChange={(e) => set("title")(e.target.value)}
              onBlur={touch("title")}
              maxLength={LIMITS.title}
              placeholder="What are you selling?"
              aria-invalid={!!errorFor("title")}
              className="h-12"
            />
          </FieldShell>

          <FieldShell label="Price" required error={errorFor("price")}>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(e) => set("price")(e.target.value)}
              onBlur={touch("price")}
              placeholder="0 for free"
              aria-invalid={!!errorFor("price")}
              className="h-12"
            />
          </FieldShell>

          <FieldShell label="Category" required error={errorFor("category")}>
            <Select
              value={values.category}
              onValueChange={(v) => {
                set("category")(v);
                setTouched((t) => ({ ...t, category: true }));
              }}
              onOpenChange={(open) => {
                if (!open) setTouched((t) => ({ ...t, category: true }));
              }}
            >
              <SelectTrigger className="!h-12 w-full" aria-invalid={!!errorFor("category")}>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.name}>
                    <c.icon className="size-4" />
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label="Location" error={errorFor("location")}>
            <Input
              value={values.location}
              onChange={(e) => set("location")(e.target.value)}
              onBlur={touch("location")}
              maxLength={LIMITS.location}
              className="h-12"
            />
          </FieldShell>

          <FieldShell label="Your name" hint="Optional" error={errorFor("sellerName")}>
            <Input
              value={values.sellerName}
              onChange={(e) => set("sellerName")(e.target.value)}
              onBlur={touch("sellerName")}
              maxLength={LIMITS.name}
              autoComplete="name"
              className="h-12"
            />
          </FieldShell>

          <FieldShell label="Email" required error={errorFor("email")}>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => set("email")(e.target.value)}
              onBlur={touch("email")}
              maxLength={LIMITS.email}
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errorFor("email")}
              className="h-12"
            />
          </FieldShell>

          <FieldShell
            label="Description"
            hint="Optional"
            error={errorFor("description")}
            counter={`${values.description.length}/${LIMITS.description}`}
          >
            <Textarea
              value={values.description}
              onChange={(e) => set("description")(e.target.value)}
              onBlur={touch("description")}
              maxLength={LIMITS.description}
              rows={5}
              placeholder="Condition, size, pickup details..."
              className="min-h-28 resize-y"
            />
          </FieldShell>

          {submitError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}
        </div>

        <div className="border-t p-4">
          <Button
            type="submit"
            disabled={!isValid || submitting}
            className="h-10 w-full rounded-md bg-fb-blue text-[15px] font-semibold hover:bg-fb-blue-hover disabled:bg-[#e4e6eb] disabled:text-[#bcc0c4] disabled:opacity-100"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </form>

      {/* Middle + right: live preview */}
      <ListingPreview
        imageUrl={photoUrl}
        title={values.title.trim()}
        price={values.price}
        location={values.location}
        sellerName={values.sellerName}
        description={values.description.trim()}
        category={values.category}
      />
    </div>
  );
}

function FieldShell({
  label,
  required,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-semibold">
        <span>
          {label}
          {required && <span className="text-destructive"> *</span>}
          {hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}
        </span>
        {counter && <span className="text-xs font-normal text-muted-foreground tabular-nums">{counter}</span>}
      </span>
      {children}
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <span role="alert" className="mt-1 block text-[13px] text-destructive">
      {children}
    </span>
  );
}
