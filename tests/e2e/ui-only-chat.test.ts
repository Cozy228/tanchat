import { expect, test } from "@playwright/test";

async function saveEndpointConfig(page: import("@playwright/test").Page, endpointUrl: string) {
  await page.getByTestId("chat-config-button").click();
  await page.getByLabel("Endpoint URL").fill(endpointUrl);
  await page.getByLabel("API Key").fill("test-key");
  await page.getByLabel("Model").fill("demo-model");
  await page.getByRole("button", { name: "Save settings" }).click();
}

test("saves a custom OpenAI-compatible endpoint locally", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const endpointUrl = new URL("/mock-openai", page.url()).toString();

  await saveEndpointConfig(page, endpointUrl);

  await expect(page.getByTestId("chat-config-status")).toContainText("Live");

  await page.reload({ waitUntil: "networkidle" });

  await page.getByTestId("chat-config-button").click();
  await expect(page.getByLabel("Endpoint URL")).toHaveValue(endpointUrl);
  await expect(page.getByLabel("Model")).toHaveValue("demo-model");
});

test("sends a message to the configured endpoint", async ({ page }) => {
  let requestBody: Record<string, unknown> | undefined;
  let authHeader: string | undefined;

  await page.route("**/mock-openai", async (route) => {
    requestBody = route.request().postDataJSON() as Record<string, unknown>;
    authHeader = route.request().headers().authorization;

    await route.fulfill({
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: "Live endpoint reply",
            },
          },
        ],
      }),
    });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  const endpointUrl = new URL("/mock-openai", page.url()).toString();
  await saveEndpointConfig(page, endpointUrl);

  await page.getByTestId("chat-message-input").fill("Summarize this project.");
  await page.getByTestId("chat-send-button").click();

  await expect(page.getByTestId("message-user").last()).toContainText("Summarize this project.");
  await expect(page.getByTestId("message-assistant").last()).toContainText("Live endpoint reply");

  expect(authHeader).toBe("Bearer test-key");
  expect(requestBody).toMatchObject({
    model: "demo-model",
    stream: false,
  });
  expect(requestBody?.messages).toEqual([
    {
      role: "user",
      content: "Summarize this project.",
    },
  ]);
});
