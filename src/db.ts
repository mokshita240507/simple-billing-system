import { openDB } from "idb";

export const dbPromise = openDB("shop-db", 1, {
  upgrade(db) {
    db.createObjectStore("products", { keyPath: "barcode" });
    db.createObjectStore("inventory", { keyPath: "barcode" });
    db.createObjectStore("sales", { autoIncrement: true });
  },
});