document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const apiKeyInput = document.getElementById("apiKey");
  const userIdInput = document.getElementById("userId");
  const saveBtn = document.getElementById("save");
  const status = document.getElementById("status");

  const stored = await chrome.storage.sync.get(["apiUrl", "apiKey", "userId"]);

  if (stored.apiUrl) apiUrlInput.value = stored.apiUrl;
  if (stored.apiKey) apiKeyInput.value = stored.apiKey;
  if (stored.userId) userIdInput.value = stored.userId;

  saveBtn.addEventListener("click", async () => {
    const apiUrl = apiUrlInput.value.trim() || "http://localhost:3000";
    const apiKey = apiKeyInput.value.trim();
    const userId = userIdInput.value.trim();

    await chrome.storage.sync.set({
      apiUrl,
      apiKey: apiKey || undefined,
      userId: userId || undefined,
    });

    status.textContent = "Settings saved.";
    saveBtn.textContent = "Saved!";
    setTimeout(() => {
      saveBtn.textContent = "Save Settings";
      status.textContent = "";
    }, 2000);
  });
});
