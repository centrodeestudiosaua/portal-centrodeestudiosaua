"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
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
  clientSecret,
}: {
  courseSlug: string;
  clientSecret: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState("");
  const [country, setCountry] = useState("MX");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const elementBaseClass =
    "rounded-none border border-border bg-white px-4 py-3 text-base text-primary";
  const elementOptions = {
    style: {
      base: {
        color: "#1a1a35",
        fontSize: "18px",
        fontFamily: "Inter, sans-serif",
        "::placeholder": {
          color: "#98a2b3",
        },
      },
      invalid: {
        color: "#911a26",
      },
    },
  } as const;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("La terminal aun no termina de cargar.");
      return;
    }

    if (!cardholderName.trim()) {
      setErrorMessage("Ingresa el nombre del titular de la tarjeta.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage("Confirmando pago con Stripe...");

    const cardElement = elements.getElement(CardNumberElement);

    if (!cardElement) {
      setErrorMessage("No se pudo encontrar el campo de tarjeta.");
      setStatusMessage(null);
      setIsSubmitting(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardholderName.trim(),
          address: {
            country,
          },
        },
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "No se pudo confirmar el pago.");
      setIsSubmitting(false);
      return;
    }

    const status = result.paymentIntent?.status;

    if (status === "succeeded" || status === "processing") {
      setStatusMessage("Activando acceso...");

      const confirmResponse = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: result.paymentIntent?.id,
          courseSlug,
        }),
      });

      const confirmRaw = await confirmResponse.text();
      const confirmPayload = (confirmRaw ? JSON.parse(confirmRaw) : {}) as {
        ok?: boolean;
        error?: string;
      };

      if (!confirmResponse.ok || !confirmPayload.ok) {
        setStatusMessage(null);
        setErrorMessage(
          confirmPayload.error ?? "El pago se hizo, pero no se pudo activar tu acceso.",
        );
        setIsSubmitting(false);
        return;
      }

      setStatusMessage("Pago confirmado. Redirigiendo...");
      router.push(`/courses/${courseSlug}?checkout=success`);
      return;
    }

    setStatusMessage(null);
    setErrorMessage("El pago no pudo completarse. Intenta de nuevo.");
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary">
            Nombre del titular
          </span>
          <input
            value={cardholderName}
            onChange={(event) => setCardholderName(event.target.value)}
            placeholder="Nombre como aparece en la tarjeta"
            className="w-full rounded-none border border-border bg-white px-4 py-3 text-base text-primary outline-none transition-colors focus:border-accent"
            autoComplete="cc-name"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary">Pais</span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="w-full rounded-none border border-border bg-white px-4 py-3 text-base text-primary outline-none transition-colors focus:border-accent"
            autoComplete="country"
          >
            <option value="MX">Mexico</option>
            <option value="US">Estados Unidos</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_160px]">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary">
            Numero de tarjeta
          </span>
          <div className={elementBaseClass}>
            <CardNumberElement options={elementOptions} />
          </div>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary">
            Fecha de expiracion
          </span>
          <div className={elementBaseClass}>
            <CardExpiryElement options={elementOptions} />
          </div>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-primary">
            Codigo de seguridad
          </span>
          <div className={elementBaseClass}>
            <CardCvcElement options={elementOptions} />
          </div>
        </label>
      </div>

      {errorMessage ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
          {statusMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || isSubmitting || !cardholderName.trim()}
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
      <PaymentElementForm courseSlug={courseSlug} clientSecret={clientSecret} />
    </Elements>
  );
}
