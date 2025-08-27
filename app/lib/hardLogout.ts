export async function hardLogout(auth?: { signOut: () => Promise<void> }) {
  // Best-effort sign out via store and SDK
  try {
    await auth?.signOut?.();
  } catch {}
  try {
    // Also try direct SDK signOut in case store wrapper failed
    // @ts-ignore
    await window?.puter?.auth?.signOut?.();
  } catch {}

  // Clear local/session storage
  try {
    localStorage.clear();
  } catch {}
  try {
    sessionStorage.clear();
  } catch {}

  // Attempt to delete all IndexedDB databases (may not be supported in all browsers)
  try {
    const anyIDB: any = (window as any).indexedDB;
    if (anyIDB && typeof anyIDB.databases === "function") {
      const dbs = await anyIDB.databases();
      for (const db of dbs) {
        const name = (db as any)?.name as string | undefined;
        if (!name) continue;
        await new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = req.onerror = req.onblocked = () => resolve();
        });
      }
    }
  } catch {}

  // Small delay before reload
  await new Promise((r) => setTimeout(r, 50));

  // Force a hard reload to ensure state resets
  try {
    window.location.replace("/" + (window.location.search ? "" : "?logout=1"));
  } catch {
    window.location.href = "/?logout=1";
  }
}
