"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import type { PurchaseOption } from "@/lib/portal/data";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type CheckoutIntentPayload = {
  clientSecret?: string;
  error?: string;
};

function PaymentElementForm({
  courseSlug,
}: {
  courseSlug: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("La terminal aun no termina de cargar.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(
        submitError.message ?? "No se pudo preparar el formulario de pago.",
      );
      setIsSubmitting(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/courses/${courseSlug}?checkout=success`,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "No se pudo confirmar el pago.");
      setIsSubmitting(false);
      return;
    }

    const status = result.paymentIntent?.status;

    if (status === "succeeded" || status === "processing") {
      router.push(`/courses/${courseSlug}?checkout=success`);
      return;
    }

    setErrorMessage("El pago no pudo completarse. Intenta de nuevo.");
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: {
            billingDetails: {
              name: "auto",
              email: "auto",
              address: {
                country: "auto",
                postalCode: "auto",
                city: "never",
                line1: "never",
                line2: "never",
                state: "never",
              },
            },
          },
        }}
      />

      {errorMessage ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="w-full bg-accent px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Procesando..." : "Confirmar pago"}
      </button>
    </form>
  );
}

export function StripeElementsCheckout({
  courseId,
  courseSlug,
  option,
}: {
  courseId: string;
  courseSlug: string;
  option: PurchaseOption;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const appearance = useMemo(
    () => ({
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#eab308",
        colorText: "#1a1a35",
        colorDanger: "#911a26",
        borderRadius: "0px",
      },
      rules: {
        ".Input": {
          border: "1px solid #d9dde5",
          boxShadow: "none",
        },
        ".Label": {
          color: "#1a1a35",
          fontWeight: "600",
        },
      },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadIntent() {
      setIsLoading(true);
      setClientSecret(null);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            courseSlug,
            priceId: option.priceId,
            mode: option.mode,
            purchaseOption: option.code,
          }),
        });

        const rawBody = await response.text();
        const payload = (rawBody ? JSON.parse(rawBody) : {}) as CheckoutIntentPayload;

        if (!response.ok || !payload.clientSecret) {
          throw new Error(payload.error || "No se pudo iniciar la terminal.");
        }

        if (!cancelled) {
          setClientSecret(payload.clientSecret);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la terminal de pago",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadIntent();

    return () => {
      cancelled = true;
    };
  }, [courseId, courseSlug, option.code, option.mode, option.priceId]);

  if (!stripePromise) {
    return (
      <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Falta configurar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        No se pudo cargar la terminal de pago. Detalle: {errorMessage}
      </div>
    );
  }

  if (isLoading || !clientSecret) {
    return (
      <div className="space-y-4 border border-border bg-background px-5 py-6">
        <div className="h-4 w-40 animate-pulse bg-muted" />
        <div className="h-10 animate-pulse bg-muted" />
        <div className="h-10 animate-pulse bg-muted" />
        <div className="h-24 animate-pulse bg-muted" />
        <div className="h-12 animate-pulse bg-muted" />
      </div>
    );
  }

  return (
    <Elements
      key={`${option.code}-${option.priceId}-${clientSecret}`}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <PaymentElementForm courseSlug={courseSlug} />
    </Elements>
  );
}
