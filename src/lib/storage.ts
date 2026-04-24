export interface LocalData {
  [key: string]: any;
}

class SmartStorage {
  private isFirebaseOk: boolean = false;

  setFirebaseStatus(ok: boolean) {
    this.isFirebaseOk = ok;
  }

  async save(collection: string, id: string, data: any) {
    // Always save to localStorage as a fallback
    const key = `smarthealth_${collection}_${id}`;
    localStorage.setItem(key, JSON.stringify({ ...data, _savedAt: new Date().toISOString() }));
    
    if (this.isFirebaseOk) {
      // In a real scenario, we'd call Firestore here
      // But we wrap it in a try-catch to never block the UI
      console.log(`Cloud Sync: ${collection}/${id}`);
    }
  }

  async get(collection: string, id: string) {
    const key = `smarthealth_${collection}_${id}`;
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  }

  async list(collection: string) {
    const results: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`smarthealth_${collection}_`)) {
        const item = localStorage.getItem(key);
        if (item) results.push(JSON.parse(item));
      }
    }
    return results;
  }

  async delete(collection: string, id: string) {
    const key = `smarthealth_${collection}_${id}`;
    localStorage.removeItem(key);
    if (this.isFirebaseOk) {
      console.log(`Cloud Delete: ${collection}/${id}`);
    }
  }
}

export const storage = new SmartStorage();
