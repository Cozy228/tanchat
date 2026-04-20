import { z } from "zod";

export const endpointConfigStorageKey = "tanchat.endpoint-config";

export const endpointConfigSchema = z.object({
  endpointUrl: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || isValidUrl(value), {
      message: "Endpoint URL must be a valid URL.",
    }),
  apiKey: z.string().trim(),
  model: z.string().trim(),
  systemPrompt: z.string(),
});

export type EndpointConfig = z.infer<typeof endpointConfigSchema>;

export const defaultEndpointConfig: EndpointConfig = {
  endpointUrl: "",
  apiKey: "",
  model: "",
  systemPrompt: "",
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function normalizeEndpointConfig(
  value: Partial<EndpointConfig> | null | undefined,
): EndpointConfig {
  return {
    endpointUrl: value?.endpointUrl?.trim() ?? "",
    apiKey: value?.apiKey?.trim() ?? "",
    model: value?.model?.trim() ?? "",
    systemPrompt: value?.systemPrompt?.trim() ?? "",
  };
}

export function parseEndpointConfig(value: unknown) {
  const normalized = normalizeEndpointConfig(
    typeof value === "object" && value !== null ? (value as Partial<EndpointConfig>) : undefined,
  );

  const result = endpointConfigSchema.safeParse(normalized);
  if (!result.success) {
    return defaultEndpointConfig;
  }

  return result.data;
}

export function readEndpointConfig() {
  if (typeof window === "undefined") {
    return defaultEndpointConfig;
  }

  try {
    const rawValue = window.localStorage.getItem(endpointConfigStorageKey);
    if (!rawValue) {
      return defaultEndpointConfig;
    }

    return parseEndpointConfig(JSON.parse(rawValue));
  } catch {
    return defaultEndpointConfig;
  }
}

export function writeEndpointConfig(value: EndpointConfig) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    endpointConfigStorageKey,
    JSON.stringify(normalizeEndpointConfig(value)),
  );
}

export function clearEndpointConfig() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(endpointConfigStorageKey);
}

export function isEndpointConfigReady(config: EndpointConfig) {
  return Boolean(config.endpointUrl && config.model);
}

export function getEndpointHost(config: EndpointConfig) {
  if (!config.endpointUrl) {
    return null;
  }

  try {
    return new URL(config.endpointUrl).host;
  } catch {
    return null;
  }
}
