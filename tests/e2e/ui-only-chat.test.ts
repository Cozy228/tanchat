import { expect, test } from "@playwright/test";

async function saveEndpointConfig(page: import("@playwright/test").Page) {
  await page.getByTestId("chat-config-button").click();
  await page.getByLabel("Endpoint URL").fill("https://example.test/v1/chat/completions");
  await page.getByLabel("API Key").fill("test-key");
  await page.getByLabel("Model").fill("demo-model");
  await page.getByRole("button", { name: "Save settings" }).click();
}

test("saves a custom OpenAI-compatible endpoint locally", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await saveEndpointConfig(page);

  await expect(page.getByTestId("chat-config-status")).toContainText("Configured");

  await page.reload({ waitUntil: "networkidle" });

  await page.getByTestId("chat-config-button").click();
  await expect(page.getByLabel("Endpoint URL")).toHaveValue(
    "https://example.test/v1/chat/completions",
  );
  await expect(page.getByLabel("Model")).toHaveValue("demo-model");
});

test("sends a message with the saved mock endpoint config", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await saveEndpointConfig(page);

  await page.getByTestId("chat-message-input").fill("Summarize this project.");
  await page.getByTestId("chat-send-button").click();

  await expect(page.getByTestId("message-user").last()).toContainText("Summarize this project.");
  await expect(page.getByTestId("message-assistant").last()).toContainText("Mock reply using");
});
