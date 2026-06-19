const DEFAULT_API_URL = "https://petaflow.vercel.app";
const SAVE_ACTIVE_TAB = "PETALFLOW_SAVE_ACTIVE_TAB";

document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const apiKeyInput = document.getElementById("apiKey");
  const userIdInput = document.getElementById("userId");
  const saveBtn = document.getElementById("save");
  const savePageBtn = document.getElementById("savePage");
  const status = document.getElementById("status");
  const dashboardLink = document.getElementById("dashboardLink");

  const stored = await chrome.storage.sync.get(["apiUrl", "apiKey", "userId"]);

  apiUrlInput.value = stored.apiUrl || DEFAULT_API_URL;
  if (stored.apiKey) apiKeyInput.value = stored.apiKey;
  if (stored.userId) userIdInput.value = stored.userId;

  function updateDashboardLink() {
    const base = apiUrlInput.value.trim() || DEFAULT_API_URL;
    dashboardLink.href = `${base.replace(/\/$/, "")}/dashboard`;
  }

  updateDashboardLink();
  apiUrlInput.addEventListener("input", updateDashboardLink);

  function setStatus(text, isError = false) {
    status.textContent = text;
    status.classList.toggle("error", isError);
  }

  async function persistSettings() {
    const apiUrl = apiUrlInput.value.trim() || DEFAULT_API_URL;
    const apiKey = apiKeyInput.value.trim();
    const userId = userIdInput.value.trim();

    await chrome.storage.sync.set({
      apiUrl,
      apiKey: apiKey || undefined,
      userId: userId || undefined,
    });

    updateDashboardLink();
    return apiUrl;
  }

  saveBtn.addEventListener("click", async () => {
    await persistSettings();
    setStatus("Impostazioni salvate.");
    saveBtn.textContent = "Salvato!";
    setTimeout(() => {
      saveBtn.textContent = "Salva impostazioni";
      setStatus("");
    }, 2000);
  });

  savePageBtn.addEventListener("click", async () => {
    setStatus("Salvataggio...");
    savePageBtn.disabled = true;

    try {
      await persistSettings();
      const result = await chrome.runtime.sendMessage({ type: SAVE_ACTIVE_TAB });
      if (result?.ok) {
        setStatus(result.message);
      } else {
        setStatus(result?.message || "Salvataggio fallito.", true);
      }
    } catch {
      setStatus("Errore di connessione con l'estensione.", true);
    } finally {
      savePageBtn.disabled = false;
    }
  });
});
