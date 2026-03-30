"use client";

import { useEffect, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import type { PurchaseOption } from "@/lib/portal/data";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export function EmbeddedPortalCheckout({
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

  if (!stripePromise) {
    return (
      <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Falta configurar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` para mostrar la
        terminal de pago embebida.
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function loadClientSecret() {
      setIsLoading(true);
      setErrorMessage(null);
      setClientSecret(null);

      try {
        const response = await fetch("/api/checkout/embedded-session", {
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
        const payload = (rawBody ? JSON.parse(rawBody) : {}) as {
          clientSecret?: string;
          error?: string;
        };

        if (!response.ok || !payload.clientSecret) {
          throw new Error(payload.error || "No se pudo iniciar el checkout");
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

    void loadClientSecret();

    return () => {
      cancelled = true;
    };
  }, [courseId, courseSlug, option.code, option.mode, option.priceId]);

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
    <EmbeddedCheckoutProvider
      key={`${option.code}-${option.priceId}-${clientSecret}`}
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
